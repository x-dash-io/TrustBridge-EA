import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initiateSTKPush } from "@/lib/mpesa/stk-push";
import { createPayment } from "@/lib/db/queries/payments";
import { getTransactionById } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";

const stkPushSchema = z.object({
  transactionId: z.string().uuid(),
  milestoneId: z.string().uuid().optional(),
  phoneNumber: z.string().regex(/^(\+?254)\d{9}$/, "Phone must be in E.164 format (e.g. +254712345678)"),
  amount: z.number().positive().max(300000, "Amount exceeds M-Pesa limit of KSh 300,000"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = stkPushSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { transactionId, milestoneId, phoneNumber, amount } = parsed.data;

    const transaction = await getTransactionById(transactionId);

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status !== "draft" && transaction.status !== "pending_funds") {
      return NextResponse.json(
        { error: `Transaction is in status "${transaction.status}", cannot accept payment` },
        { status: 409 }
      );
    }

    const ref = transaction.reference;
    const callbackUrl =
      process.env.MPESA_STK_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/mpesa/stk`;

    const darajaRes = await initiateSTKPush({
      phone: phoneNumber,
      amount: Math.ceil(amount),
      transactionRef: ref,
    });

    if (darajaRes.ResponseCode !== "0") {
      return NextResponse.json(
        { error: "M-Pesa request failed", message: darajaRes.ResponseDescription },
        { status: 502 }
      );
    }

    const payment = await createPayment({
      transactionId,
      milestoneId: milestoneId || null,
      payerId: transaction.createdBy,
      amount: amount.toString(),
      currency: transaction.currency,
      method: "mpesa_stk",
      status: "pending",
      mpesaPhone: phoneNumber,
      checkoutRequestId: darajaRes.CheckoutRequestID,
    });

    await logAuditEvent({
      transactionId,
      actorId: transaction.createdBy,
      actorRole: "buyer",
      action: "mpesa_stk_initiated",
      metadata: {
        checkoutRequestId: darajaRes.CheckoutRequestID,
        amount,
        phone: phoneNumber.slice(0, -4) + "****",
      },
    });

    return NextResponse.json({
      checkoutRequestId: darajaRes.CheckoutRequestID,
      merchantRequestId: darajaRes.MerchantRequestID,
      message: `STK push sent to ${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-4)}`,
      paymentId: payment.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
