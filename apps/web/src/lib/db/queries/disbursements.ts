import { db } from "@/lib/db";
import { disbursements, type Disbursement } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type NewDisbursement = typeof disbursements.$inferInsert;

export async function createDisbursement(data: NewDisbursement) {
  const result = await db.insert(disbursements).values(data).returning();
  return result[0];
}

export async function getDisbursementsByMilestoneId(milestoneId: string) {
  return db
    .select()
    .from(disbursements)
    .where(eq(disbursements.milestoneId, milestoneId));
}
