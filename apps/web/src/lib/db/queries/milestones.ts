import { db } from "@/lib/db";
import { milestones, type NewMilestone } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { assertMilestoneTransition } from "@/lib/state/milestones";

type DbMilestoneStatus = NonNullable<typeof milestones.$inferSelect.status>;

export async function getMilestonesByTransactionId(transactionId: string) {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.transactionId, transactionId))
    .orderBy(asc(milestones.orderIndex));
}

export async function getMilestoneById(id: string) {
  const result = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createMilestone(data: NewMilestone) {
  const result = await db
    .insert(milestones)
    .values(data)
    .returning();

  return result[0];
}

export async function updateMilestoneStatus(id: string, status: DbMilestoneStatus, additionalData: Partial<typeof milestones.$inferInsert> = {}) {
  const current = await getMilestoneById(id);
  if (!current) return null;
  const currentStatus = (current.status || "pending") as DbMilestoneStatus;
  assertMilestoneTransition(currentStatus, status);

  const result = await db
    .update(milestones)
    .set({ 
      status,
      ...additionalData,
    })
    .where(and(eq(milestones.id, id), eq(milestones.status, currentStatus)))
    .returning();

  return result[0] || null;
}

export async function transitionMilestoneStatus(
  id: string,
  expectedStatus: DbMilestoneStatus,
  nextStatus: DbMilestoneStatus,
  additionalData: Partial<typeof milestones.$inferInsert> = {}
) {
  assertMilestoneTransition(expectedStatus || "pending", nextStatus);
  const result = await db
    .update(milestones)
    .set({ status: nextStatus, ...additionalData })
    .where(and(eq(milestones.id, id), eq(milestones.status, expectedStatus)))
    .returning();

  return result[0] || null;
}
