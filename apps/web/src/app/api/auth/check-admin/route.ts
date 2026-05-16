import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ROLE_NAMES } from "@/lib/auth/roles";

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ isAdmin: false, roles: [] });
    }

    const adminRoles = [
      ROLE_NAMES.SUPER_ADMIN,
      ROLE_NAMES.COMPLIANCE_OFFICER,
      ROLE_NAMES.MEDIATOR,
      ROLE_NAMES.SUPPORT_AGENT,
      ROLE_NAMES.AUDITOR,
    ];

    const userRoleNames = user.roles.map((r) => r.roleName);
    const matchingRoles = userRoleNames.filter((r) =>
      adminRoles.includes(r as typeof adminRoles[number])
    );

    return NextResponse.json({
      isAdmin: matchingRoles.length > 0,
      roles: matchingRoles,
      allPermissions: user.allPermissions,
    });
  } catch {
    return NextResponse.json({ isAdmin: false, roles: [] });
  }
}
