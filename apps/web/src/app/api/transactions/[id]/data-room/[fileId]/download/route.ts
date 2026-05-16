import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDataRoomFileById } from "@/lib/db/queries/data-room";
import { logAuditEvent } from "@/lib/db/queries/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = await getDataRoomFileById(fileId);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await logAuditEvent({
      transactionId: id,
      actorId: user.id,
      actorRole: "buyer",
      action: "DATA_ROOM_FILE_DOWNLOADED",
      metadata: { fileId, fileName: file.fileName },
    });

    // Try Supabase Storage download
    if (supabase.storage) {
      const { data } = await supabase.storage
        .from("data-rooms")
        .download(file.filePath);

      if (data) {
        return new NextResponse(data, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${file.fileName}"`,
          },
        });
      }
    }

    return NextResponse.json({ error: "File not available for download" }, { status: 404 });
  } catch (error) {
    console.error("File Download Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
