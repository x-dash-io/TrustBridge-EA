import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let totalVolume = 0;
    let activeCount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let complianceRating = 98;

    try {
      const { db } = await import("@/lib/db");
      const { transactions } = await import("@/lib/db/schema");
      const { getTransactionsByUserId } = await import("@/lib/db/queries/transactions");
      const { getUserById } = await import("@/lib/db/queries/users");

      const txs = await getTransactionsByUserId(user.id);
      const userData = await getUserById(user.id);

      totalVolume = txs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      activeCount = txs.filter((tx) => tx.status === "funded" || tx.status === "in_progress" || tx.status === "in_inspection" || tx.status === "pending_funds").length;
      completedCount = txs.filter((tx) => tx.status === "completed").length;
      pendingCount = txs.filter((tx) => tx.status === "requires_review" || tx.status === "draft").length;
      complianceRating = userData?.kycTier ? Math.min(98, 60 + userData.kycTier * 10) : 60;
    } catch (dbError) {
      console.warn("Database not available, returning default stats:", dbError);
    }

    return NextResponse.json({
      totalVolume,
      activeCount,
      completedCount,
      pendingCount,
      complianceRating,
    });
  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
