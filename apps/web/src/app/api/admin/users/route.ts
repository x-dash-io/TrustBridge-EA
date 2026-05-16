import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { users, userRoles, roles } from "@/lib/db/schema";
import { sql, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*", "users:view");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const kycFilter = searchParams.get("kyc") || "";

    let whereConditions = sql`1=1`;
    if (search) {
      whereConditions = sql`${whereConditions} AND (${users.email} ILIKE ${"%" + search + "%"} OR ${users.fullName} ILIKE ${"%" + search + "%"})`;
    }
    if (kycFilter) {
      whereConditions = sql`${whereConditions} AND ${users.kycStatus} = ${kycFilter}`;
    }

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereConditions);

    const userRows = await db
      .select()
      .from(users)
      .where(whereConditions)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    const userIds = userRows.map((u) => u.id);
    const roleAssignments = userIds.length > 0
      ? await db
          .select({
            userId: userRoles.userId,
            roleName: roles.name,
            roleId: roles.id,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(sql`${userRoles.userId} = ANY(${userIds})`)
      : [];

    const roleMap: Record<string, { roleId: string; roleName: string }[]> = {};
    for (const ra of roleAssignments) {
      if (!roleMap[ra.userId]) roleMap[ra.userId] = [];
      roleMap[ra.userId].push({ roleId: ra.roleId, roleName: ra.roleName });
    }

    const filteredRows = roleFilter
      ? userRows.filter((u) => (roleMap[u.id] || []).some((r) => r.roleName === roleFilter))
      : userRows;

    const data = filteredRows.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      kycTier: u.kycTier,
      kycStatus: u.kycStatus,
      role: u.role,
      preferredCurrency: u.preferredCurrency,
      createdAt: u.createdAt,
      assignedRoles: roleMap[u.id] || [],
    }));

    return NextResponse.json({
      data,
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
