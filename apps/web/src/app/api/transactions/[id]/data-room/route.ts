import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDataRoomByTransactionId, createDataRoom, getDataRoomFiles } from "@/lib/db/queries/data-room";
import { getTransactionById } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await getTransactionById(id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    let dataRoom = await getDataRoomByTransactionId(id);
    if (!dataRoom) {
      dataRoom = await createDataRoom({
        transactionId: id,
        status: "locked",
      });
    }

    const files = await getDataRoomFiles(dataRoom.id);

    return NextResponse.json({
      dataRoom,
      files: files.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        filePath: f.filePath,
        fileSize: f.fileSize,
        fileType: null,
        uploadedBy: f.uploadedBy,
        createdAt: f.createdAt?.toISOString(),
        deliveredAt: f.deliveredAt?.toISOString(),
        accessedAt: f.accessedAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Data Room API Error:", error);
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await getTransactionById(id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let dataRoom = await getDataRoomByTransactionId(id);
    if (!dataRoom) {
      dataRoom = await createDataRoom({
        transactionId: id,
        status: "locked",
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `data-rooms/${id}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const supabaseStorage = supabase.storage
      ? await supabase.storage.from("data-rooms").upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })
      : null;

    if (supabaseStorage?.error) {
      console.warn("Supabase Storage not available, saving file metadata only:", supabaseStorage.error);
    }

    // Save file record to DB
    const { createDataRoomFile } = await import("@/lib/db/queries/data-room");
    const fileRecord = await createDataRoomFile({
      dataRoomId: dataRoom.id,
      uploadedBy: user.id,
      fileName: file.name,
      filePath,
      fileHash: "",
      fileSize: file.size,
    });

    await logAuditEvent({
      transactionId: id,
      actorId: user.id,
      actorRole: "buyer",
      action: "DATA_ROOM_FILE_UPLOADED",
      metadata: { fileName: file.name, fileSize: file.size },
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
