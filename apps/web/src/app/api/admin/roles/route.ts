import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*");

    const rows = await db
      .select()
      .from(roles)
      .orderBy(roles.createdAt);

    return NextResponse.json({ data: rows });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*");

    const body = await request.json();
    const parsed = createRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const newRole = await db
      .insert(roles)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        permissions: parsed.data.permissions,
        isSystem: false,
      })
      .returning();

    return NextResponse.json(newRole[0], { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
