import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTransactionById } from "@/lib/db/queries/transactions";
import { getDataRoomByTransactionId, createDataRoom, createDataRoomNda, getDataRoomNda } from "@/lib/db/queries/data-room";
import { logAuditEvent } from "@/lib/db/queries/audit";

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

    let dataRoom = await getDataRoomByTransactionId(id);
    if (!dataRoom) {
      dataRoom = await createDataRoom({
        transactionId: id,
        status: "locked",
      });
    }

    // Check if NDA already signed
    const existingNda = await getDataRoomNda(dataRoom.id, user.id);
    if (existingNda) {
      return NextResponse.json({ message: "NDA already signed", nda: existingNda });
    }

    const body = await request.json().catch(() => ({}));
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const nda = await createDataRoomNda({
      dataRoomId: dataRoom.id,
      userId: user.id,
      signedAt: new Date(),
      signatureData: body.signatureData || "electronic-consent",
      ipAddress,
      userAgent,
    });

    // Unlock the data room
    const { dataRooms } = await import("@/lib/db/schema");
    const { db } = await import("@/lib/db");
    const { eq } = await import("drizzle-orm");
    await db
      .update(dataRooms)
      .set({ status: "unlocked" })
      .where(eq(dataRooms.id, dataRoom.id));

    await logAuditEvent({
      transactionId: id,
      actorId: user.id,
      actorRole: "buyer",
      action: "DATA_ROOM_NDA_SIGNED",
      metadata: { dataRoomId: dataRoom.id, ipAddress },
    });

    return NextResponse.json({ success: true, nda });
  } catch (error) {
    console.error("NDA Sign Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
