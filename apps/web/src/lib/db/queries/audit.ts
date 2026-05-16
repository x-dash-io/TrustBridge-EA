import { db } from "@/lib/db";
import { auditLog, type NewAuditLogEntry } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function logAuditEvent(data: NewAuditLogEntry) {
  const result = await db.insert(auditLog).values(data).returning();
  return result[0];
}

export async function getAuditLogByTransactionId(transactionId: string) {
  return db
    .select()
    .from(auditLog)
    .where(eq(auditLog.transactionId, transactionId))
    .orderBy(auditLog.createdAt);
}
