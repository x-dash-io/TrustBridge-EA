import { type NextRequest, NextResponse } from "next/server";
import type { DarajaCallbackBody } from "@/lib/mpesa/daraja";
import { verifyWebhookToken } from "@/lib/mpesa/webhook-verify";
import { getPaymentByCheckoutId, updatePaymentStatus } from "@/lib/db/queries/payments";
import { updateTransactionStatus } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";

/**
 * FIX BUG-03: Added secret-token verification on inbound M-Pesa STK callbacks.
 *
 * The MPESA_WEBHOOK_SECRET env var must be set and must match the token
 * embedded in the callback URL registered with Safaricom Daraja:
 *   https://yourapp.com/api/webhooks/mpesa/stk?token=<MPESA_WEBHOOK_SECRET>
 *
 * Additionally: the CheckoutRequestID is looked up in the DB before any state
 * change is applied (idempotency guard). Unknown IDs are rejected with a
 * non-200 response — Daraja will not retry, which is the desired behaviour.
 */
export async function POST(request: NextRequest) {
  // 1. Verify secret token in query param (primary Daraja webhook defence)
  const token = request.nextUrl.searchParams.get("token");
  if (!verifyWebhookToken(token, process.env.MPESA_WEBHOOK_SECRET)) {
    await logAuditEvent({
      transactionId: null,
      actorId: null,
      actorRole: "system",
      action: "WEBHOOK_REJECTED_INVALID_TOKEN",
      metadata: { webhook: "mpesa_stk", ip: request.headers.get("x-forwarded-for") },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
    // Return 200 to Daraja (non-200 triggers retries which we don't want for invalid tokens)
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Rejected" });
  }

  try {
    const body: DarajaCallbackBody = await request.json();
    const callback = body.Body.stkCallback;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

    // 2. Look up payment — idempotency guard against replay attacks
    const payment = await getPaymentByCheckoutId(CheckoutRequestID);
    if (!payment) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Payment not found" });
    }

    // 3. Guard: don't reprocess an already-completed payment (replay protection)
    if (payment.status === "completed") {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    if (ResultCode === 0 && CallbackMetadata) {
      const items = CallbackMetadata.Item;
      const receipt =
        items.find((i) => i.Name === "MpesaReceiptNumber")?.Value?.toString() || null;
      const amountPaid =
        items.find((i) => i.Name === "Amount")?.Value?.toString() || null;
      const phoneNumber =
        items.find((i) => i.Name === "PhoneNumber")?.Value?.toString() || null;

      await updatePaymentStatus(CheckoutRequestID, "completed", receipt ?? undefined);

      if (payment.transactionId) {
        await updateTransactionStatus(payment.transactionId, "funded");
      }

      await logAuditEvent({
        transactionId: payment.transactionId,
        actorId: payment.payerId,
        actorRole: "buyer",
        action: "MPESA_STK_COMPLETED",
        metadata: {
          checkoutRequestId: CheckoutRequestID,
          receipt,
          amountPaid,
          // Mask phone for PII: keep country code + last 4 digits
          phoneMasked: phoneNumber
            ? `${phoneNumber.slice(0, 5)}****${phoneNumber.slice(-4)}`
            : null,
          paymentId: payment.id,
        },
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      });
    } else {
      await updatePaymentStatus(CheckoutRequestID, "failed");
      await logAuditEvent({
        transactionId: payment.transactionId,
        actorId: payment.payerId,
        actorRole: "buyer",
        action: "MPESA_STK_FAILED",
        metadata: {
          checkoutRequestId: CheckoutRequestID,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          paymentId: payment.id,
        },
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("M-Pesa STK webhook error:", message);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal error" });
  }
}
