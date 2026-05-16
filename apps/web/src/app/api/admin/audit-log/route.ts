import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { auditLog, users } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "audit:view");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const offset = (page - 1) * limit;
    const action = searchParams.get("action") || "";
    const search = searchParams.get("search") || "";

    let whereConditions = sql`1=1`;
    if (action) whereConditions = sql`${whereConditions} AND ${auditLog.action} = ${action}`;
    if (search) whereConditions = sql`${whereConditions} AND ${auditLog.action} ILIKE ${"%" + search + "%"}`;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLog)
      .where(whereConditions);

    const rows = await db
      .select({
        id: auditLog.id,
        transactionId: auditLog.transactionId,
        actorId: auditLog.actorId,
        actorRole: auditLog.actorRole,
        action: auditLog.action,
        metadata: auditLog.metadata,
        ipAddress: auditLog.ipAddress,
        createdAt: auditLog.createdAt,
        actorEmail: users.email,
        actorName: users.fullName,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.actorId, users.id))
      .where(whereConditions)
      .limit(limit)
      .offset(offset)
      .orderBy(auditLog.createdAt);

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
