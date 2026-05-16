import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { agents, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*", "disputes:assign");

    const rows = await db
      .select({
        id: agents.id,
        userId: agents.userId,
        displayName: agents.displayName,
        counties: agents.counties,
        rating: agents.rating,
        reviewCount: agents.reviewCount,
        isActive: agents.isActive,
        userEmail: users.email,
      })
      .from(agents)
      .leftJoin(users, eq(agents.userId, users.id))
      .orderBy(agents.displayName);

    return NextResponse.json({ data: rows });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
