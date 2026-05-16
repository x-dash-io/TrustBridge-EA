import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMilestoneById, transitionMilestoneStatus } from "@/lib/db/queries/milestones";
import { getTransactionParties } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { validateFile, computeFileHash, sanitizeFileName } from "@/lib/utils/file-validation";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limited = await rateLimit(request, "strict", "milestone:deliver");
  if (limited) return limited;

  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch Milestone and Transaction Parties
  const milestone = await getMilestoneById(id);
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  const parties = await getTransactionParties(milestone.transactionId!);
  const sellerParty = parties.find(p => p.role === "seller");

  // 3. Verify Sender is Seller
  if (sellerParty?.userId !== user.id) {
    return NextResponse.json({ error: "Only the seller can deliver milestones" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return NextResponse.json({ error: "At least one delivery file is required" }, { status: 400 });
    }
    
    // 4. Upload Files to Supabase Storage
    const uploadedFiles: Array<{ path: string; hash: string; fileName: string }> = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const validation = validateFile(buffer, file.type, file.name);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 422 });
      }
      const safeName = sanitizeFileName(file.name);
      const fileHash = computeFileHash(buffer);
      const fileName = `${id}/${Date.now()}-${safeName}`;
      const { data, error } = await supabase.storage
        .from("milestones")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });
      
      if (error) throw error;
      uploadedFiles.push({ path: data.path, hash: fileHash, fileName: safeName });
    }

    // 5. Update Milestone Status
    const inspectionStartedAt = new Date();
    const inspectionDays = 5;
    const inspectionExpiresAt = new Date(inspectionStartedAt.getTime() + inspectionDays * 24 * 60 * 60 * 1000);
    const transitioned = await transitionMilestoneStatus(id, "pending", "delivered", {
      deliveredAt: new Date(),
      inspectionStartedAt,
      inspectionExpiresAt,
      autoReleaseEligibleAt: inspectionExpiresAt,
    });
    if (!transitioned) {
      return NextResponse.json({ error: "Milestone status changed; retry with latest state" }, { status: 409 });
    }

    // 6. Audit Log
    await logAuditEvent({
      transactionId: milestone.transactionId,
      actorId: user.id,
      actorRole: "seller",
      action: "MILESTONE_DELIVERED",
      metadata: { milestoneId: id, files: uploadedFiles },
    });

    // 7. Notification Logic (Mocked)
    // sendNotification({ type: "MILESTONE_DELIVERED", userId: buyerId, ... })

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
