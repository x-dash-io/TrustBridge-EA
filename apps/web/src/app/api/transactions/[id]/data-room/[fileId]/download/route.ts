import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDataRoomFileById, getDataRoomNda, getDataRoomByTransactionId } from "@/lib/db/queries/data-room";
import { getTransactionParties } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { createHash } from "crypto";

/**
 * FIX BUG-08: The previous download handler verified authentication but did NOT:
 *   1. Check whether the caller is a party to the transaction
 *   2. Check whether the caller has signed the data room NDA
 *
 * Any authenticated user could enumerate file UUIDs and download sensitive
 * due-diligence documents from any transaction's data room.
 *
 * Fix: enforce party membership + NDA signature before issuing download.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id: transactionId, fileId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verify the file exists and belongs to this transaction's data room
    const file = await getDataRoomFileById(fileId);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const dataRoom = await getDataRoomByTransactionId(transactionId);
    if (!dataRoom || (file as unknown as { dataRoomId: string }).dataRoomId !== dataRoom.id) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 2. Verify caller is a named party on the transaction
    const parties = await getTransactionParties(transactionId);
    const party = parties.find((p) => p.userId === user.id);
    if (!party) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 3. Verify NDA signature — buyers must sign before accessing data room docs
    if (party.role === "buyer" || party.role === "observer") {
      const ndaSig = await getDataRoomNda(dataRoom.id, user.id);
      if (!ndaSig || !ndaSig.signedAt) {
        return NextResponse.json(
          {
            error: "NDA_REQUIRED",
            message: "You must sign the Non-Disclosure Agreement before accessing data room files",
          },
          { status: 403 }
        );
      }
    }

    // 4. Download from storage
    const { data, error: downloadError } = await supabase.storage
      .from("data-rooms")
      .download((file as unknown as { filePath: string }).filePath);

    if (downloadError || !data) {
      return NextResponse.json(
        { error: "File not available for download" },
        { status: 404 }
      );
    }

    // 5. Optionally verify integrity via stored hash
    const buffer = Buffer.from(await data.arrayBuffer());
    const actualHash = createHash("sha256").update(buffer).digest("hex");
    const storedHash = (file as unknown as { fileHash: string }).fileHash;
    if (storedHash && storedHash !== "" && actualHash !== storedHash) {
      console.error(`Data room file integrity failure: fileId=${fileId}`);
      await logAuditEvent({
        transactionId,
        actorId: user.id,
        actorRole: party.role,
        action: "DATA_ROOM_FILE_INTEGRITY_FAILURE",
        metadata: { fileId, expectedHash: storedHash, actualHash },
      });
      return NextResponse.json(
        { error: "File integrity check failed — contact support" },
        { status: 500 }
      );
    }

    await logAuditEvent({
      transactionId,
      actorId: user.id,
      actorRole: party.role,
      action: "DATA_ROOM_FILE_DOWNLOADED",
      metadata: {
        fileId,
        fileName: (file as unknown as { fileName: string }).fileName,
        fileHash: actualHash,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    const fileName = (file as unknown as { fileName: string }).fileName;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("File Download Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
