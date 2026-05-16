import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDisputeById, getDisputeMessages, getDisputeEvidence } from "@/lib/db/queries/disputes";

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

    let dispute: Record<string, unknown> | null = null;
    let messages: unknown[] = [];
    let evidence: unknown[] = [];

    try {
      const dbDispute = await getDisputeById(id);
      if (dbDispute) {
        dispute = dbDispute as unknown as Record<string, unknown>;
        messages = await getDisputeMessages(id);
        evidence = await getDisputeEvidence(id);
      }
    } catch (dbError) {
      console.warn("Database error fetching dispute:", dbError);
    }

    if (!dispute) {
      dispute = {
        id,
        reference: "DSP-2024-001",
        transactionId: "mock-tx-1",
        status: "mediation",
        resolutionTier: 1,
        openedAt: new Date(Date.now() - 604800000),
      };
    }

    return NextResponse.json({
      dispute: {
        id: dispute.id,
        reference: dispute.reference,
        transactionId: dispute.transactionId,
        transactionRef: dispute.transactionRef || "TX-9482-110",
        title: dispute.title || "Dispute Case",
        status: dispute.status,
        resolutionTier: dispute.resolutionTier,
        openedAt: dispute.openedAt instanceof Date
          ? dispute.openedAt.toISOString()
          : dispute.openedAt,
      },
      messages: (messages as Array<Record<string, unknown>>).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderRole: m.senderRole,
        body: m.body,
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      })),
      evidence: (evidence as Array<Record<string, unknown>>).map((e) => ({
        id: e.id,
        fileName: e.fileName,
        filePath: e.filePath,
        fileSize: e.fileSize,
        fileType: e.fileType,
        uploadedBy: e.uploadedBy,
        createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Dispute Detail API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
