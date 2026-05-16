import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { kycSubmissions, users } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "kyc:review");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;
    const status = searchParams.get("status") || "pending";
    const tier = searchParams.get("tier");

    let whereConditions = sql`${kycSubmissions.status} = ${status}`;
    if (tier) {
      whereConditions = sql`${whereConditions} AND ${kycSubmissions.tier} = ${Number(tier)}`;
    }

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(kycSubmissions)
      .where(whereConditions);

    const rows = await db
      .select({
        id: kycSubmissions.id,
        userId: kycSubmissions.userId,
        tier: kycSubmissions.tier,
        documentType: kycSubmissions.documentType,
        documentNumber: kycSubmissions.documentNumber,
        country: kycSubmissions.country,
        status: kycSubmissions.status,
        rejectionReason: kycSubmissions.rejectionReason,
        submittedAt: kycSubmissions.submittedAt,
        reviewedAt: kycSubmissions.reviewedAt,
        userEmail: users.email,
        userFullName: users.fullName,
      })
      .from(kycSubmissions)
      .leftJoin(users, eq(kycSubmissions.userId, users.id))
      .where(whereConditions)
      .limit(limit)
      .offset(offset)
      .orderBy(kycSubmissions.submittedAt);

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
