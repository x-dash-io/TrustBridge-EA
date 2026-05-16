import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { disbursements } from "@/lib/db/schema";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { verifyWebhookToken } from "@/lib/mpesa/webhook-verify";
import { eq } from "drizzle-orm";

/**
 * FIX BUG-12: B2C webhook had no verification — identical vulnerability to
 * the STK webhook. A fake "disbursement completed" payload would mark a
 * payout as settled without funds actually moving.
 *
 * Same defence: secret token in URL + idempotency on ConversationID.
 * Use MPESA_B2C_WEBHOOK_SECRET (separate secret from STK for least privilege).
 */
export async function POST(request: NextRequest) {
  // 1. Verify secret token
  const token = request.nextUrl.searchParams.get("token");
  if (!verifyWebhookToken(token, process.env.MPESA_B2C_WEBHOOK_SECRET)) {
    await logAuditEvent({
      transactionId: null,
      actorId: null,
      actorRole: "system",
      action: "WEBHOOK_REJECTED_INVALID_TOKEN",
      metadata: { webhook: "mpesa_b2c", ip: request.headers.get("x-forwarded-for") },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Rejected" });
  }

  try {
    const body = await request.json();
    const result = body.Result;

    if (!result) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const conversationId: string = result.ConversationID;
    const transactionId: string | undefined = result.TransactionID;
    const amount: number | undefined = result.TransactionAmount;
    const resultCode: number = result.ResultCode;
    const resultDesc: string = result.ResultDesc || "";

    if (!conversationId) {
      return NextResponse.json({ error: "Missing ConversationID" }, { status: 400 });
    }

    // 2. Guard: look up disbursement to prevent unknown-ID injection
    const existing = await db
      .select({ id: disbursements.id, status: disbursements.status })
      .from(disbursements)
      .where(eq(disbursements.providerReference, conversationId))
      .limit(1)
      .then((r) => r[0] || null);

    if (!existing) {
      // Unknown conversation ID — log and discard
      await logAuditEvent({
        transactionId: null,
        actorId: null,
        actorRole: "system",
        action: "B2C_WEBHOOK_UNKNOWN_CONVERSATION_ID",
        metadata: { conversationId },
      });
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // 3. Idempotency: skip already-terminal states
    if (existing.status === "completed" || existing.status === "failed") {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    const status = resultCode === 0 ? "completed" : "failed";

    await db
      .update(disbursements)
      .set({
        status,
        providerReference: transactionId || conversationId,
        updatedAt: new Date(),
      })
      .where(eq(disbursements.id, existing.id));

    await logAuditEvent({
      transactionId: null,
      actorId: null,
      actorRole: "system",
      action: status === "completed" ? "B2C_DISBURSEMENT_COMPLETED" : "B2C_DISBURSEMENT_FAILED",
      metadata: {
        conversationId,
        transactionId,
        amount,
        resultCode,
        resultDesc,
        disbursementId: existing.id,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("B2C Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
