import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, userRoles, roles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { type AuthUser } from "./authorize";
import { type RoleName } from "./roles";

let _currentUser: AuthUser | null = null;

export function setCurrentUser(user: AuthUser | null) {
  _currentUser = user;
}

export function getCachedCurrentUser(): AuthUser | null {
  return _currentUser;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (_currentUser) return _currentUser;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)
    .then((r) => r[0] || null);

  if (!dbUser) return null;

  // Fallback: if user has no roles in user_roles, assign "user" role
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

  // If no roles assigned, create a default "user" role assignment
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

  const user: AuthUser = {
    id: dbUser.id,
    email: dbUser.email || "",
    roles: resolvedRoles.map((r) => ({
      roleId: r.roleId,
      roleName: r.roleName as RoleName,
      permissions: (r.permissions as string[]) || [],
    })),
    allPermissions,
  };

  _currentUser = user;
  return user;
}
