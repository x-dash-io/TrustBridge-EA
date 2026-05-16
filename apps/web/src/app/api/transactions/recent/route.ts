import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTransactionsByUserId } from "@/lib/db/queries/transactions";
import { rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, "general", "transactions:recent");
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let txs = [];
    try {
      txs = await getTransactionsByUserId(user.id);
    } catch (dbError) {
      if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEMO_DATA !== "true") {
        console.error("Recent transactions query failed:", dbError);
        return NextResponse.json({ error: "Transactions unavailable" }, { status: 503 });
      }
      console.warn("Database connection failed. Falling back to Institutional Mock Data.", dbError);
      // Fallback for demonstration if DB is not configured
      txs = [
        {
          id: "mock-1",
          reference: "TX-9482-110",
          title: "Scale.ai Domain Acquisition",
          amount: "1250000",
          currency: "KES",
          status: "active",
          createdAt: new Date(),
        },
        {
          id: "mock-2",
          reference: "TX-1102-552",
          title: "Batch #412 Industrial Equipment",
          amount: "450000",
          currency: "KES",
          status: "completed",
          createdAt: new Date(Date.now() - 86400000),
        }
      ];
    }
    
    // Transform to simple array for dashboard
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
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
