import { db } from "@/lib/db";
import {
  transactions,
  transactionParties,
  type NewTransaction,
  type NewTransactionParty,
} from "@/lib/db/schema";
import { eq, and, or, desc, inArray } from "drizzle-orm";

export async function getTransactionById(id: string) {
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getTransactionByReference(reference: string) {
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.reference, reference))
    .limit(1);

  return result[0] || null;
}

export async function getTransactionsByUserId(userId: string) {
  const partyTxIds = db
    .select({ transactionId: transactionParties.transactionId })
    .from(transactionParties)
    .where(eq(transactionParties.userId, userId));

  return db
    .select()
    .from(transactions)
    .where(
      or(
        eq(transactions.createdBy, userId),
        inArray(transactions.id, partyTxIds)
      )
    )
    .orderBy(desc(transactions.updatedAt));
}

export async function getTransactionsByPartyId(userId: string) {
  return db
    .select({
      transaction: transactions,
      party: transactionParties,
    })
    .from(transactionParties)
    .innerJoin(
      transactions,
      eq(transactionParties.transactionId, transactions.id)
    )
    .where(eq(transactionParties.userId, userId))
    .orderBy(desc(transactions.updatedAt));
}

export async function createTransaction(data: NewTransaction) {
  const result = await db
    .insert(transactions)
    .values(data)
    .returning();

  return result[0];
}

export async function updateTransactionStatus(
  id: string,
  status: string
) {
  const result = await db
    .update(transactions)
    .set({ status, updatedAt: new Date() })
    .where(eq(transactions.id, id))
    .returning();

  return result[0] || null;
}

export async function addTransactionParty(data: NewTransactionParty) {
  const result = await db
    .insert(transactionParties)
    .values(data)
    .returning();

  return result[0];
}

export async function getTransactionParties(transactionId: string) {
  return db
    .select()
    .from(transactionParties)
    .where(eq(transactionParties.transactionId, transactionId));
}

export async function getTransactionIdsByRole(
  userId: string,
  role: string
) {
  const results = await db
    .select({ transactionId: transactionParties.transactionId })
    .from(transactionParties)
    .where(
      and(
        eq(transactionParties.userId, userId),
        eq(transactionParties.role, role)
      )
    );

  return results.map((r) => r.transactionId);
}
