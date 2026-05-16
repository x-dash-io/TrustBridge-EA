import { db } from "@/lib/db";
import { roles, users, userRoles } from "@/lib/db/schema";
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

async function seedRoles() {
  console.log("Seeding roles...");
  const created: string[] = [];
  for (const def of roleDefinitions) {
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, def.name))
      .limit(1);

    if (existing.length === 0) {
      const [role] = await db.insert(roles).values({
        name: def.name,
        description: def.description,
        permissions: def.permissions,
        isSystem: def.isSystem,
      }).returning();
      created.push(def.name);
      console.log(`  Created role: ${def.name} (${role.id})`);
    } else {
      console.log(`  Role exists: ${def.name}`);
    }
  }
  return created;
}

async function seedAdminUser() {
  console.log("\nSeeding admin user...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@trustbridge.co.ke";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@TrustBridge2026";

  const superAdminRole = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "super_admin"))
    .limit(1)
    .then((r) => r[0] || null);

  const complianceRole = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "compliance_officer"))
    .limit(1)
    .then((r) => r[0] || null);

  if (!superAdminRole || !complianceRole) {
    console.log("  SKIP: Roles not seeded yet. Run seed again after roles exist.");
    return;
  }

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1)
    .then((r) => r[0] || null);

  if (existingAdmin) {
    console.log(`  Admin user exists: ${adminEmail}`);

    const hasSuperAdmin = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, existingAdmin.id))
      .limit(1)
      .then((r) => r.length > 0);

    if (!hasSuperAdmin) {
      await db.insert(userRoles).values({
        userId: existingAdmin.id,
        roleId: superAdminRole.id,
      });
      await db.insert(userRoles).values({
        userId: existingAdmin.id,
        roleId: complianceRole.id,
      });
      console.log("  Assigned roles to existing admin.");
    }
    return;
  }

  // Use Supabase Admin API to create the user
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authUser, error } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: "System Administrator",
    },
  });

  if (error) {
    console.log(`  Could not create via Supabase Admin (${error.message}). Creating DB record only.`);
  }

  if (authUser?.user) {
    const [dbUser] = await db.insert(users).values({
      id: authUser.user.id,
      email: adminEmail,
      fullName: "System Administrator",
      kycTier: 4,
      kycStatus: "verified",
      role: "individual",
      preferredCurrency: "KES",
    }).returning();

    await db.insert(userRoles).values({
      userId: dbUser.id,
      roleId: superAdminRole.id,
      assignedById: dbUser.id,
    });
    await db.insert(userRoles).values({
      userId: dbUser.id,
      roleId: complianceRole.id,
      assignedById: dbUser.id,
    });

    console.log(`  Created admin user: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
  } else {
    // DB-only fallback: insert user record if we have an ID
    const [dbUser] = await db.insert(users).values({
      email: adminEmail,
      fullName: "System Administrator",
      kycTier: 4,
      kycStatus: "verified",
      role: "individual",
      preferredCurrency: "KES",
    }).returning();

    await db.insert(userRoles).values({
      userId: dbUser.id,
      roleId: superAdminRole.id,
      assignedById: dbUser.id,
    });
    await db.insert(userRoles).values({
      userId: dbUser.id,
      roleId: complianceRole.id,
      assignedById: dbUser.id,
    });

    console.log(`  Created admin DB record: ${adminEmail}`);
    console.log(`  WARNING: Create this user in Supabase Auth manually with password: ${adminPassword}`);
  }
}

async function main() {
  console.log("=== TrustBridge EA Seed ===\n");

  try {
    await seedRoles();
    await seedAdminUser();
    console.log("\n=== Seed complete ===");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

main();
