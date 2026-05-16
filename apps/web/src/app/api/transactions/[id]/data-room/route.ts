import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getDataRoomByTransactionId,
  createDataRoom,
  getDataRoomFiles,
  createDataRoomFile,
  getDataRoomNda,
} from "@/lib/db/queries/data-room";
import { getTransactionById, getTransactionParties } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { validateFile, computeFileHash, sanitizeFileName } from "@/lib/utils/file-validation";

async function assertPartyAccess(transactionId: string, userId: string) {
  const parties = await getTransactionParties(transactionId);
  const party = parties.find((p) => p.userId === userId);
  if (!party) throw new Error("FORBIDDEN");
  return party;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await getTransactionById(id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    try {
      await assertPartyAccess(id, user.id);
    } catch {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    let dataRoom = await getDataRoomByTransactionId(id);
    if (!dataRoom) {
      dataRoom = await createDataRoom({ transactionId: id, status: "locked" });
    }

    const files = await getDataRoomFiles(dataRoom.id);

    return NextResponse.json({
      dataRoom: {
        id: dataRoom.id,
        status: dataRoom.status,
        transactionId: dataRoom.transactionId,
      },
      files: files.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        fileSize: f.fileSize,
        uploadedBy: f.uploadedBy,
        createdAt: f.createdAt?.toISOString(),
        deliveredAt: f.deliveredAt?.toISOString(),
        // filePath withheld — use signed download endpoint
      })),
    });
  } catch (error) {
    console.error("Data Room GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await getTransactionById(id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    let party;
    try {
      party = await assertPartyAccess(id, user.id);
    } catch {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Only sellers (and agents) may upload to the data room
    if (!["seller", "agent"].includes(party.role)) {
      return NextResponse.json(
        { error: "Only the seller or agent may upload documents to the data room" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // FIX BUG-07: validate file
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateFile(buffer, file.type, file.name);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // FIX BUG-09: compute real hash
    const fileHash = computeFileHash(buffer);
    const safeFileName = sanitizeFileName(file.name);
    const filePath = `data-rooms/${id}/${Date.now()}-${safeFileName}`;

    let dataRoom = await getDataRoomByTransactionId(id);
    if (!dataRoom) {
      dataRoom = await createDataRoom({ transactionId: id, status: "locked" });
    }

    const { error: storageError } = await supabase.storage
      .from("data-rooms")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (storageError) {
      console.error("Storage upload failed:", storageError);
      return NextResponse.json({ error: "File storage failed" }, { status: 500 });
    }

    const fileRecord = await createDataRoomFile({
      dataRoomId: dataRoom.id,
      uploadedBy: user.id,
      fileName: safeFileName,
      filePath,
      fileHash, // now a real SHA-256
      fileSize: file.size,
    });

    await logAuditEvent({
      transactionId: id,
      actorId: user.id,
      actorRole: party.role,
      action: "DATA_ROOM_FILE_UPLOADED",
      metadata: { fileName: safeFileName, fileSize: file.size, fileHash },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({
      id: fileRecord.id,
      fileName: fileRecord.fileName,
      fileSize: fileRecord.fileSize,
    });
  } catch (error) {
    console.error("Data Room Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
