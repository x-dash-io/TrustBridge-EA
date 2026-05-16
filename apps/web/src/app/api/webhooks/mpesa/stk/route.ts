import { type NextRequest, NextResponse } from "next/server";
import type { DarajaCallbackBody } from "@/lib/mpesa/daraja";
import { getPaymentByCheckoutId, updatePaymentStatus } from "@/lib/db/queries/payments";
import { updateTransactionStatus } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";

export async function POST(request: NextRequest) {
  try {
    const body: DarajaCallbackBody = await request.json();
    const callback = body.Body.stkCallback;

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

    const payment = await getPaymentByCheckoutId(CheckoutRequestID);

    if (!payment) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Payment not found" });
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
        action: "mpesa_stk_completed",
        metadata: {
          checkoutRequestId: CheckoutRequestID,
          receipt,
          amountPaid,
          phoneNumber,
          paymentId: payment.id,
        },
      });
    } else {
      await updatePaymentStatus(CheckoutRequestID, "failed");

      await logAuditEvent({
        transactionId: payment.transactionId,
        actorId: payment.payerId,
        actorRole: "buyer",
        action: "mpesa_stk_failed",
        metadata: {
          checkoutRequestId: CheckoutRequestID,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          paymentId: payment.id,
        },
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("M-Pesa webhook error:", message);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal error" });
  }
}
