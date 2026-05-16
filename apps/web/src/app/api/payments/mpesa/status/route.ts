import { type NextRequest, NextResponse } from "next/server";
import { getPaymentByCheckoutId } from "@/lib/db/queries/payments";
import { createClient } from "@/lib/supabase/server";
import { getTransactionParties } from "@/lib/db/queries/transactions";
import { rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const limited = await rateLimit(request, "general", "mpesa:status");
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checkoutRequestId = request.nextUrl.searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: "checkoutRequestId query parameter is required" },
        { status: 400 }
      );
    }

    const payment = await getPaymentByCheckoutId(checkoutRequestId);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const parties = payment.transactionId
      ? await getTransactionParties(payment.transactionId)
      : [];
    const isParty = parties.some((p) => p.userId === user.id);
    if (payment.payerId !== user.id && !isParty) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: payment.status,
      receipt: payment.providerReference || null,
      amount: payment.amount,
      method: payment.method,
      updatedAt: payment.updatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
