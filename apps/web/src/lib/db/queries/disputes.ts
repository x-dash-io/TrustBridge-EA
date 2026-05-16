import { db } from "@/lib/db";
import { disputes, disputeMessages, disputeEvidence, type NewDispute, type NewDisputeMessage, type NewDisputeEvidence } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getDisputeById(id: string) {
  const result = await db
    .select()
    .from(disputes)
    .where(eq(disputes.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getDisputesByUserId(userId: string) {
  return db
    .select()
    .from(disputes)
    .where(eq(disputes.openedBy, userId))
    .orderBy(desc(disputes.openedAt));
}

export async function getDisputesByTransactionId(transactionId: string) {
  return db
    .select()
    .from(disputes)
    .where(eq(disputes.transactionId, transactionId))
    .orderBy(desc(disputes.openedAt));
}

export async function createDispute(data: NewDispute) {
  const result = await db.insert(disputes).values(data).returning();
  return result[0];
}

export async function getDisputeMessages(disputeId: string) {
  return db
    .select()
    .from(disputeMessages)
    .where(eq(disputeMessages.disputeId, disputeId))
    .orderBy(desc(disputeMessages.createdAt));
}

export async function createDisputeMessage(data: NewDisputeMessage) {
  const result = await db.insert(disputeMessages).values(data).returning();
  return result[0];
}

export async function getDisputeEvidence(disputeId: string) {
  return db
    .select()
    .from(disputeEvidence)
    .where(eq(disputeEvidence.disputeId, disputeId))
    .orderBy(desc(disputeEvidence.createdAt));
}

export async function createDisputeEvidence(data: NewDisputeEvidence) {
  const result = await db.insert(disputeEvidence).values(data).returning();
  return result[0];
}
