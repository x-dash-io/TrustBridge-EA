import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDisputeById, getDisputeMessages, getDisputeEvidence } from "@/lib/db/queries/disputes";
import { getTransactionParties } from "@/lib/db/queries/transactions";
import { PERMISSIONS } from "@/lib/auth/roles";

/**
 * FIX BUG-06: The previous GET handler authenticated the user but never
 * checked whether that user is a party to the dispute's transaction. Any
 * authenticated user could read any dispute — messages, evidence, parties —
 * by guessing or enumerating UUID dispute IDs.
 *
 * Fix: after loading the dispute, verify the caller is either:
 *   (a) a named party on the underlying transaction, OR
 *   (b) a staff member with disputes:read permission (mediators, admins)
 */
export async function GET(
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

    const dispute = await getDisputeById(id);
    if (!dispute) {
      // Return 404 not 403 — don't confirm existence to unauthorised callers
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Check staff permissions (mediators, compliance officers, admins)
    const authUser = await getCurrentUser();
    const isStaff =
      authUser?.allPermissions.includes(PERMISSIONS.DISPUTES_READ) ?? false;

    if (!isStaff) {
      // Verify caller is a named party on the transaction
      const parties = await getTransactionParties(
        (dispute as unknown as { transactionId: string }).transactionId
      );
      const isParty = parties.some((p) => p.userId === user.id);

      if (!isParty) {
        return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
      }
    }

    const messages = await getDisputeMessages(id);
    const evidence = await getDisputeEvidence(id);

    const d = dispute as unknown as Record<string, unknown>;

    return NextResponse.json({
      dispute: {
        id: d.id,
        reference: d.reference,
        transactionId: d.transactionId,
        status: d.status,
        resolutionTier: d.resolutionTier,
        assignedMediatorId: d.assignedMediatorId,
        openedAt:
          d.openedAt instanceof Date
            ? d.openedAt.toISOString()
            : d.openedAt,
        resolvedAt:
          d.resolvedAt instanceof Date
            ? d.resolvedAt.toISOString()
            : d.resolvedAt,
      },
      messages: (messages as Array<Record<string, unknown>>).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderRole: m.senderRole,
        body: m.body,
        createdAt:
          m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      })),
      evidence: (evidence as Array<Record<string, unknown>>).map((e) => ({
        id: e.id,
        fileName: e.fileName,
        fileSize: e.fileSize,
        fileType: e.fileType,
        uploadedBy: e.uploadedBy,
        createdAt:
          e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
        // filePath intentionally omitted — use the signed-URL download endpoint
      })),
    });
  } catch (error) {
    console.error("Dispute Detail API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
