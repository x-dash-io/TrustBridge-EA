import { NextResponse, type NextRequest } from "next/server";
import { and, lte, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { milestones } from "@/lib/db/schema";
import { transitionMilestoneStatus } from "@/lib/db/queries/milestones";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { rateLimit, requireCronSecret } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;
  const limited = await rateLimit(request, "cron", "inspection:auto-release");
  if (limited) return limited;

  const now = new Date();
  const eligible = await db
    .select()
    .from(milestones)
    .where(and(eq(milestones.status, "delivered"), lte(milestones.autoReleaseEligibleAt, now)));

  let released = 0;
  for (const milestone of eligible) {
    const transitioned = await transitionMilestoneStatus(
      milestone.id,
      "delivered",
      "accepted",
      { acceptedAt: now }
    );
    if (!transitioned) continue;
    released += 1;
    await logAuditEvent({
      transactionId: milestone.transactionId,
      actorId: null,
      actorRole: "system",
      action: "MILESTONE_AUTO_ACCEPTED_AFTER_INSPECTION",
      metadata: {
        milestoneId: milestone.id,
        autoReleaseEligibleAt: milestone.autoReleaseEligibleAt,
      },
    });
  }

  return NextResponse.json({ success: true, released });
}
