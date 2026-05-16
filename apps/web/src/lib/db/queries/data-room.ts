import { db } from "@/lib/db";
import { dataRooms, dataRoomFiles, dataRoomNdas, type NewDataRoom, type NewDataRoomFile, type NewDataRoomNda } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getDataRoomByTransactionId(transactionId: string) {
  const result = await db
    .select()
    .from(dataRooms)
    .where(eq(dataRooms.transactionId, transactionId))
    .limit(1);

  return result[0] || null;
}

export async function createDataRoom(data: NewDataRoom) {
  const result = await db.insert(dataRooms).values(data).returning();
  return result[0];
}

export async function getDataRoomFiles(dataRoomId: string) {
  return db
    .select()
    .from(dataRoomFiles)
    .where(eq(dataRoomFiles.dataRoomId, dataRoomId));
}

export async function createDataRoomFile(data: NewDataRoomFile) {
  const result = await db.insert(dataRoomFiles).values(data).returning();
  return result[0];
}

export async function getDataRoomFileById(id: string) {
  const result = await db
    .select()
    .from(dataRoomFiles)
    .where(eq(dataRoomFiles.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getDataRoomNda(dataRoomId: string, userId: string) {
  const result = await db
    .select()
    .from(dataRoomNdas)
    .where(and(
      eq(dataRoomNdas.dataRoomId, dataRoomId),
      eq(dataRoomNdas.userId, userId)
    ))
    .limit(1);

  return result[0] || null;
}

export async function createDataRoomNda(data: NewDataRoomNda) {
  const result = await db.insert(dataRoomNdas).values(data).returning();
  return result[0];
}
