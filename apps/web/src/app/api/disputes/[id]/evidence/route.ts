import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDisputeEvidence, createDisputeEvidence } from "@/lib/db/queries/disputes";
import { logAuditEvent } from "@/lib/db/queries/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let evidence: unknown[] = [];
    try {
      evidence = await getDisputeEvidence(id);
    } catch (dbError) {
      console.warn("Database error fetching evidence:", dbError);
    }

    return NextResponse.json((evidence as Array<Record<string, unknown>>).map((e) => ({
      id: e.id,
      fileName: e.fileName,
      filePath: e.filePath,
      fileSize: e.fileSize,
      fileType: e.fileType,
      uploadedBy: e.uploadedBy,
      createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    })));
  } catch (error) {
    console.error("Dispute Evidence API Error:", error);
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filePath = `disputes/${id}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    if (supabase.storage) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await supabase.storage.from("dispute-evidence").upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });
    }

    const evidence = await createDisputeEvidence({
      disputeId: id,
      uploadedBy: user.id,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      fileType: file.type || null,
    });

    await logAuditEvent({
      transactionId: null,
      actorId: user.id,
      actorRole: "buyer",
      action: "DISPUTE_EVIDENCE_UPLOADED",
      metadata: { disputeId: id, fileName: file.name, fileSize: file.size },
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
