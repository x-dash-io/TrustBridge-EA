import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { transactions, users } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*", "transactions:view_all");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    let whereConditions = sql`1=1`;
    if (status) whereConditions = sql`${whereConditions} AND ${transactions.status} = ${status}`;
    if (search) whereConditions = sql`${whereConditions} AND (${transactions.reference} ILIKE ${"%" + search + "%"} OR ${transactions.title} ILIKE ${"%" + search + "%"})`;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(whereConditions);

    const rows = await db
      .select({
        id: transactions.id,
        reference: transactions.reference,
        title: transactions.title,
        assetClass: transactions.assetClass,
        status: transactions.status,
        currency: transactions.currency,
        amount: transactions.amount,
        createdBy: transactions.createdBy,
        createdAt: transactions.createdAt,
        creatorEmail: users.email,
        creatorName: users.fullName,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.createdBy, users.id))
      .where(whereConditions)
      .limit(limit)
      .offset(offset)
      .orderBy(transactions.createdAt);

    return NextResponse.json({
      data: rows,
      total: Number(totalResult.count),
      page,
      limit,
      totalPages: Math.ceil(Number(totalResult.count) / limit),
    });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
