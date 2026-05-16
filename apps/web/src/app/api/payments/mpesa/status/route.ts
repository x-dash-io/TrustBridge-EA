import { type NextRequest, NextResponse } from "next/server";
import { getPaymentByCheckoutId } from "@/lib/db/queries/payments";

export async function GET(request: NextRequest) {
  try {
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
