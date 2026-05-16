import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, userRoles, roles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { type AuthUser } from "./authorize";
import { type RoleName } from "./roles";

/**
 * FIX BUG-01: The previous implementation used a module-level singleton
 * (`let _currentUser`) which is shared across all concurrent requests in
 * Next.js serverless/edge environments. This causes User A's identity to
 * bleed into User B's request — a critical authentication vulnerability.
 *
 * The fix: remove all module-level state. Every call fetches fresh from
 * Supabase's cryptographically-verified session cookie. The Supabase client
 * itself handles token caching safely per-request via the cookie store.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) return null;

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)
    .then((r) => r[0] || null);

  if (!dbUser) return null;

  const userRoleRows = await db
    .select({
      roleId: userRoles.roleId,
      roleName: roles.name,
      permissions: roles.permissions,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, dbUser.id)))
    .then((r) => r);

  // If no roles assigned, assign the default "user" role
  let resolvedRoles = userRoleRows;
  if (resolvedRoles.length === 0) {
    const defaultRole = await db
      .select({ id: roles.id, name: roles.name, permissions: roles.permissions })
      .from(roles)
      .where(eq(roles.name, "user"))
      .limit(1)
      .then((r) => r[0]);

    if (defaultRole) {
      await db.insert(userRoles).values({
        userId: dbUser.id,
        roleId: defaultRole.id,
      });

      resolvedRoles = [
        {
          roleId: defaultRole.id,
          roleName: defaultRole.name as RoleName,
          permissions: (defaultRole.permissions as string[]) || [],
        },
      ];
    }
  }

  const allPermissions = Array.from(
    new Set(resolvedRoles.flatMap((r) => r.permissions || []))
  );

  return {
    id: dbUser.id,
    email: dbUser.email || "",
    roles: resolvedRoles.map((r) => ({
      roleId: r.roleId,
      roleName: r.roleName as RoleName,
      permissions: (r.permissions as string[]) || [],
    })),
    allPermissions,
  };
}
