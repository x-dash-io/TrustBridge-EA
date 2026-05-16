import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMilestoneById, updateMilestoneStatus } from "@/lib/db/queries/milestones";
import { getTransactionParties } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    
    // 4. Upload Files to Supabase Storage
    const uploadedFiles = [];
    for (const file of files) {
      const fileName = `${id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("milestones")
        .upload(fileName, file);
      
      if (error) throw error;
      uploadedFiles.push(data.path);
    }

    // 5. Update Milestone Status
    await updateMilestoneStatus(id, "delivered", {
      deliveredAt: new Date(),
    });

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
