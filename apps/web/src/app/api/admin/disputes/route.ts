import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { disputes, users, transactions } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "disputes:assign");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;
    const status = searchParams.get("status") || "";

    let whereConditions = sql`1=1`;
    if (status) whereConditions = sql`${whereConditions} AND ${disputes.status} = ${status}`;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(disputes)
      .where(whereConditions);

    const rows = await db
      .select({
        id: disputes.id,
        reference: disputes.reference,
        transactionId: disputes.transactionId,
        status: disputes.status,
        resolutionTier: disputes.resolutionTier,
        assignedMediatorId: disputes.assignedMediatorId,
        openedBy: disputes.openedBy,
        openedAt: disputes.openedAt,
        transactionReference: transactions.reference,
        transactionTitle: transactions.title,
        openerName: users.fullName,
      })
      .from(disputes)
      .leftJoin(transactions, eq(disputes.transactionId, transactions.id))
      .leftJoin(users, eq(disputes.openedBy, users.id))
      .where(whereConditions)
      .limit(limit)
      .offset(offset)
      .orderBy(disputes.openedAt);

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
