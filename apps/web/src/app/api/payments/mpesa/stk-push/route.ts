import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { initiateSTKPush } from "@/lib/mpesa/stk-push";
import { createPayment } from "@/lib/db/queries/payments";
import { getTransactionById, getTransactionParties } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";

const stkPushSchema = z.object({
  transactionId: z.string().uuid(),
  milestoneId: z.string().uuid().optional(),
  phoneNumber: z
    .string()
    .regex(/^(\+?254)\d{9}$/, "Phone must be in E.164 format (e.g. +254712345678)"),
  amount: z
    .number()
    .positive()
    .max(300000, "Amount exceeds M-Pesa limit of KSh 300,000"),
});

export async function POST(request: NextRequest) {
  // 1. Authenticate caller
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    // 2. Load transaction
    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // 3. FIX BUG-05: Verify the authenticated user is the buyer on this transaction.
    //    Previously the route accepted any authenticated user and attributed the payment
    //    to transaction.createdBy — allowing User A to trigger an STK push on User B's
    //    transaction, or fabricate a payment on a transaction they don't own.
    const parties = await getTransactionParties(transactionId);
    const buyerParty = parties.find(
      (p) => p.role === "buyer" && p.userId === user.id
    );

    if (!buyerParty) {
      await logAuditEvent({
        transactionId,
        actorId: user.id,
        actorRole: "unknown",
        action: "STK_PUSH_UNAUTHORIZED_ATTEMPT",
        metadata: { transactionId, userId: user.id },
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      });
      return NextResponse.json(
        { error: "Only the buyer on this transaction can initiate payment" },
        { status: 403 }
      );
    }

    // 4. State guard
    if (transaction.status !== "draft" && transaction.status !== "pending_funds") {
      return NextResponse.json(
        {
          error: `Transaction is in status "${transaction.status}", cannot accept payment`,
        },
        { status: 409 }
      );
    }

    const ref = transaction.reference;

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
      payerId: user.id, // Now correctly the authenticated caller, not transaction.createdBy
      amount: amount.toString(),
      currency: transaction.currency,
      method: "mpesa_stk",
      status: "pending",
      mpesaPhone: phoneNumber,
      checkoutRequestId: darajaRes.CheckoutRequestID,
    });

    await logAuditEvent({
      transactionId,
      actorId: user.id,
      actorRole: "buyer",
      action: "MPESA_STK_INITIATED",
      metadata: {
        checkoutRequestId: darajaRes.CheckoutRequestID,
        amount,
        phoneMasked: `${phoneNumber.slice(0, 5)}****${phoneNumber.slice(-4)}`,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({
      checkoutRequestId: darajaRes.CheckoutRequestID,
      merchantRequestId: darajaRes.MerchantRequestID,
      message: `STK push sent to ${phoneNumber.slice(0, 5)}****${phoneNumber.slice(-4)}`,
      paymentId: payment.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
