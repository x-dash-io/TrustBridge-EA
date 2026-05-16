import { type RoleName, hasAnyPermission, type Permission } from "./roles";

export interface AuthUser {
  id: string;
  email: string;
  roles: {
    roleId: string;
    roleName: RoleName;
    permissions: string[];
  }[];
  allPermissions: string[];
}

export class AuthorizationError extends Error {
  status: number;
  constructor(message = "Forbidden", status = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

export function requireRole(user: AuthUser | null, ...roles: RoleName[]) {
  if (!user) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  const userRoleNames = user.roles.map((r) => r.roleName);
  const hasRole = userRoleNames.some((r) => roles.includes(r));
  if (!hasRole) {
    throw new AuthorizationError(
      `Required one of roles: ${roles.join(", ")}`
    );
  }
}

export function requirePermission(
  user: AuthUser | null,
  ...permissions: Permission[]
) {
  if (!user) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  if (!hasAnyPermission(user.allPermissions, permissions)) {
    throw new AuthorizationError(
      `Required one of permissions: ${permissions.join(", ")}`
    );
  }
}
