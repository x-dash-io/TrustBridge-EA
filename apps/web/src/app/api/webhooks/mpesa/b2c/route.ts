import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { disbursements } from "@/lib/db/schema";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = body.Result;
    if (!result) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const conversationId = result.ConversationID;
    const transactionId = result.TransactionID;
    const amount = result.TransactionAmount;
    const phone = result.TransactionCompletedDateTime
      ? result.PhoneNumber || ""
      : "";
    const status = result.ResultCode === 0 ? "completed" : "failed";
    const failureReason = result.ResultDesc || "";

    // Update disbursement record
    if (conversationId) {
      await db
        .update(disbursements)
        .set({
          status,
          providerReference: transactionId || conversationId,
          updatedAt: new Date(),
        })
        .where(eq(disbursements.providerReference, conversationId));
    }

    // Audit log
    await logAuditEvent({
      transactionId: null,
      actorId: null,
      actorRole: "system",
      action: status === "completed" ? "B2C_DISBURSEMENT_COMPLETED" : "B2C_DISBURSEMENT_FAILED",
      metadata: {
        conversationId,
        transactionId,
        amount,
        phone,
        failureReason,
      },
    });

    return NextResponse.json({
      success: true,
      status,
      receipt: transactionId,
    });
  } catch (error) {
    console.error("B2C Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
