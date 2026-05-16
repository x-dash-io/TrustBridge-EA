import { db } from "@/lib/db";
import { milestones, type NewMilestone } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

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

export async function updateMilestoneStatus(id: string, status: string, additionalData: Partial<typeof milestones.$inferInsert> = {}) {
  const result = await db
    .update(milestones)
    .set({ 
      status, 
      ...additionalData,
    })
    .where(eq(milestones.id, id))
    .returning();

  return result[0] || null;
}
