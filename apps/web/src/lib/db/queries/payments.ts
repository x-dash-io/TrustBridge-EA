import { db } from "@/lib/db";
import { payments, type NewPayment } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type DbPaymentStatus = typeof payments.$inferSelect.status;

export async function createPayment(data: NewPayment) {
  const result = await db.insert(payments).values(data).returning();
  return result[0];
}

export async function getPaymentById(id: string) {
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getPaymentByCheckoutId(checkoutRequestId: string) {
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.checkoutRequestId, checkoutRequestId))
    .limit(1);

  return result[0] || null;
}

export async function getPaymentsByTransactionId(transactionId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.transactionId, transactionId));
}

export async function updatePaymentStatus(
  checkoutRequestId: string,
  status: DbPaymentStatus,
  providerReference?: string
) {
  const values: Record<string, unknown> = { status, updatedAt: new Date() };
  if (providerReference) {
    values.providerReference = providerReference;
  }

  const result = await db
    .update(payments)
    .set(values)
    .where(eq(payments.checkoutRequestId, checkoutRequestId))
    .returning();

  return result[0] || null;
}

export async function updatePaymentStatusById(
  id: string,
  status: DbPaymentStatus
) {
  const result = await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.id, id))
    .returning();

  return result[0] || null;
}
