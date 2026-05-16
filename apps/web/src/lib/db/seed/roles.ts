import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const roleDefinitions = [
  {
    name: "super_admin",
    description: "Full system access — user management, configuration, role assignment, all data",
    permissions: ["*"],
    isSystem: true,
  },
  {
    name: "compliance_officer",
    description: "KYC/AML review, transaction monitoring, user lookup, audit viewing",
    permissions: [
      "kyc:review",
      "kyc:approve",
      "kyc:reject",
      "transactions:view_all",
      "transactions:flag",
      "users:view",
      "audit:view",
    ],
    isSystem: true,
  },
  {
    name: "mediator",
    description: "Dispute resolution — assigned disputes, messaging, binding decisions",
    permissions: [
      "disputes:assign",
      "disputes:resolve",
      "disputes:message",
      "transactions:view_assigned",
    ],
    isSystem: true,
  },
  {
    name: "support_agent",
    description: "Customer support — user lookup, dispute read/message, send notifications",
    permissions: [
      "users:view",
      "disputes:read",
      "disputes:message",
      "notifications:send",
    ],
    isSystem: true,
  },
  {
    name: "auditor",
    description: "Read-only access — all transactions, audit logs, data rooms",
    permissions: [
      "transactions:view_all",
      "audit:view",
      "data_rooms:view_all",
    ],
    isSystem: true,
  },
  {
    name: "user",
    description: "Standard platform user — own transactions, own KYC, own disputes",
    permissions: [
      "transactions:own",
      "kyc:own",
      "disputes:own",
      "data_rooms:own",
    ],
    isSystem: true,
  },
];

export async function seedRoles() {
  for (const def of roleDefinitions) {
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, def.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(roles).values({
        name: def.name,
        description: def.description,
        permissions: def.permissions,
        isSystem: def.isSystem,
      });
    }
  }

  console.log(`Seeded ${roleDefinitions.length} roles`);
}
