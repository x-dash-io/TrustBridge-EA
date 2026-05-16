import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { users, kycSubmissions, disputes, transactions } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*", "transactions:view_all");

    const [totalUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [pendingKyc] = await db
      .select({ count: sql<number>`count(*)` })
      .from(kycSubmissions)
      .where(sql`${kycSubmissions.status} = 'pending'`);

    const [openDisputes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(disputes)
      .where(sql`${disputes.status} = 'open'`);

    const [txCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions);

    const [txVolume] = await db
      .select({ total: sql<string>`coalesce(sum(amount::numeric), 0)` })
      .from(transactions)
      .where(sql`${transactions.status} != 'draft'`);

    return NextResponse.json({
      totalUsers: Number(totalUsers.count),
      pendingKyc: Number(pendingKyc.count),
      openDisputes: Number(openDisputes.count),
      totalTransactions: Number(txCount.count),
      totalVolume: txVolume.total || "0",
    });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
