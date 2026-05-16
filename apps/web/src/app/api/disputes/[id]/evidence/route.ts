import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDisputeEvidence, createDisputeEvidence, getDisputeById } from "@/lib/db/queries/disputes";
import { getTransactionParties } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { validateFile, computeFileHash, sanitizeFileName } from "@/lib/utils/file-validation";
import { PERMISSIONS } from "@/lib/auth/roles";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dispute = await getDisputeById(id);
    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Enforce party or staff access
    const authUser = await getCurrentUser();
    const isStaff = authUser?.allPermissions.includes(PERMISSIONS.DISPUTES_READ) ?? false;
    if (!isStaff) {
      const parties = await getTransactionParties(
        (dispute as unknown as { transactionId: string }).transactionId
      );
      if (!parties.some((p) => p.userId === user.id)) {
        return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
      }
    }

    const evidence = await getDisputeEvidence(id);

    return NextResponse.json(
      (evidence as Array<Record<string, unknown>>).map((e) => ({
        id: e.id,
        fileName: e.fileName,
        fileSize: e.fileSize,
        fileType: e.fileType,
        uploadedBy: e.uploadedBy,
        createdAt:
          e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
        // filePath withheld — use the signed download endpoint
      }))
    );
  } catch (error) {
    console.error("Dispute Evidence GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify dispute exists and caller is a party
    const dispute = await getDisputeById(id);
    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const parties = await getTransactionParties(
      (dispute as unknown as { transactionId: string }).transactionId
    );
    const authUser = await getCurrentUser();
    const isStaff = authUser?.allPermissions.includes(PERMISSIONS.DISPUTES_READ) ?? false;
    if (!isStaff && !parties.some((p) => p.userId === user.id)) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // FIX BUG-07: validate size, MIME type, magic bytes, and file name
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateFile(buffer, file.type, file.name);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // FIX BUG-09: compute SHA-256 before storing
    const fileHash = computeFileHash(buffer);
    const safeFileName = sanitizeFileName(file.name);
    const filePath = `disputes/${id}/${Date.now()}-${safeFileName}`;

    if (supabase.storage) {
      const { error: storageError } = await supabase.storage
        .from("dispute-evidence")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });
      if (storageError) {
        console.error("Storage upload failed:", storageError);
        return NextResponse.json(
          { error: "File storage failed" },
          { status: 500 }
        );
      }
    }

    const evidence = await createDisputeEvidence({
      disputeId: id,
      uploadedBy: user.id,
      fileName: safeFileName,
      filePath,
      fileSize: file.size,
      fileType: file.type || null,
    });

    await logAuditEvent({
      transactionId: null,
      actorId: user.id,
      actorRole: parties.find((p) => p.userId === user.id)?.role ?? "unknown",
      action: "DISPUTE_EVIDENCE_UPLOADED",
      metadata: {
        disputeId: id,
        fileName: safeFileName,
        fileSize: file.size,
        fileHash,
        mimeType: file.type,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({
      id: evidence.id,
      fileName: evidence.fileName,
      fileSize: evidence.fileSize,
    });
  } catch (error) {
    console.error("Dispute Evidence Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
