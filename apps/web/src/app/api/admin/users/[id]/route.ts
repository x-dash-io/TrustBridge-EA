import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { users, userRoles, roles } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["individual", "business"]).optional(),
  kycStatus: z.enum(["pending", "verified", "rejected"]).optional(),
  kycTier: z.number().int().min(0).max(4).optional(),
  assignedRoles: z.array(z.string()).optional(),
  fullName: z.string().min(3).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*", "users:view");
    const { id } = await params;

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then((r) => r[0] || null);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const assignedRoles = await db
      .select({
        roleId: roles.id,
        roleName: roles.name,
        roleDescription: roles.description,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, dbUser.id));

    return NextResponse.json({
      ...dbUser,
      assignedRoles,
    });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*", "users:view");
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { assignedRoles, ...updateFields } = parsed.data;

    if (Object.keys(updateFields).length > 0) {
      await db
        .update(users)
        .set({ ...updateFields, updatedAt: new Date() })
        .where(eq(users.id, id));
    }

    if (assignedRoles !== undefined) {
      await db.delete(userRoles).where(eq(userRoles.userId, id));
      for (const roleId of assignedRoles) {
        await db.insert(userRoles).values({
          userId: id,
          roleId,
          assignedById: user.id,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
