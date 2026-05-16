export type RoleName =
  | "super_admin"
  | "compliance_officer"
  | "mediator"
  | "support_agent"
  | "auditor"
  | "user";

export type Permission = string;

export const ROLE_NAMES = {
  SUPER_ADMIN: "super_admin" as RoleName,
  COMPLIANCE_OFFICER: "compliance_officer" as RoleName,
  MEDIATOR: "mediator" as RoleName,
  SUPPORT_AGENT: "support_agent" as RoleName,
  AUDITOR: "auditor" as RoleName,
  USER: "user" as RoleName,
};

export const PERMISSIONS = {
  // KYC
  KYC_REVIEW: "kyc:review",
  KYC_APPROVE: "kyc:approve",
  KYC_REJECT: "kyc:reject",
  // Transactions
  TRANSACTIONS_VIEW_ALL: "transactions:view_all",
  TRANSACTIONS_VIEW_ASSIGNED: "transactions:view_assigned",
  TRANSACTIONS_OWN: "transactions:own",
  TRANSACTIONS_FLAG: "transactions:flag",
  // Users
  USERS_VIEW: "users:view",
  // Disputes
  DISPUTES_ASSIGN: "disputes:assign",
  DISPUTES_RESOLVE: "disputes:resolve",
  DISPUTES_MESSAGE: "disputes:message",
  DISPUTES_READ: "disputes:read",
  DISPUTES_OWN: "disputes:own",
  // Notifications
  NOTIFICATIONS_SEND: "notifications:send",
  // Audit
  AUDIT_VIEW: "audit:view",
  // Data Rooms
  DATA_ROOMS_VIEW_ALL: "data_rooms:view_all",
  DATA_ROOMS_OWN: "data_rooms:own",
  // KYC own
  KYC_OWN: "kyc:own",
} as const;

export function hasPermission(
  rolePermissions: string[],
  required: string
): boolean {
  return rolePermissions.includes("*") || rolePermissions.includes(required);
}

export function hasAnyPermission(
  rolePermissions: string[],
  required: string[]
): boolean {
  return required.some((p) => hasPermission(rolePermissions, p));
}

export function hasAllPermissions(
  rolePermissions: string[],
  required: string[]
): boolean {
  return required.every((p) => hasPermission(rolePermissions, p));
}
