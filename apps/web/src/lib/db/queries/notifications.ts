import { db } from "@/lib/db";
import { notifications, type NewNotification } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getNotificationsByUserId(userId: string, limit = 50, offset = 0) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUnreadNotificationCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));

  return Number(result[0]?.count || 0);
}

export async function markNotificationRead(id: string) {
  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id))
    .returning();

  return result[0] || null;
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function createNotification(data: NewNotification) {
  const result = await db.insert(notifications).values(data).returning();
  return result[0];
}
