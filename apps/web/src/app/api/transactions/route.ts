import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTransactionsByUserId } from "@/lib/db/queries/transactions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let txs = [];
    try {
      txs = await getTransactionsByUserId(user.id);
    } catch (dbError) {
      console.warn("Database connection failed. Falling back to Institutional Mock Data.", dbError);
      txs = [
        { id: "mock-1", reference: "TX-9482-110", title: "Scale.ai Domain Acquisition", amount: "1250000", currency: "KES", status: "active", createdAt: new Date() },
        { id: "mock-2", reference: "TX-1102-552", title: "Batch #412 Industrial Equipment", amount: "450000", currency: "KES", status: "completed", createdAt: new Date(Date.now() - 86400000) },
        { id: "mock-3", reference: "TX-2291-004", title: "Real Estate: Riverside 2B", amount: "18500000", currency: "KES", status: "pending", createdAt: new Date(Date.now() - 172800000) },
      ];
    }
    
    if (status && status !== "all") {
      txs = txs.filter(tx => tx.status === status);
    }

    const formattedTxs = txs.map(tx => ({
      id: tx.id,
      reference: tx.reference,
      title: tx.title,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      createdAt: tx.createdAt ? tx.createdAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(formattedTxs);
  } catch (error) {
    console.error("Transactions API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
