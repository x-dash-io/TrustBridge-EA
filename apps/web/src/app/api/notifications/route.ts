import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNotificationsByUserId, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from "@/lib/db/queries/notifications";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let notifications: unknown[] = [];
    let unreadCount = 0;

    try {
      notifications = await getNotificationsByUserId(user.id, limit, offset);
      unreadCount = await getUnreadNotificationCount(user.id);
    } catch (dbError) {
      console.warn("Database connection failed for notifications:", dbError);
    }

    return NextResponse.json({
      notifications: (notifications as Array<Record<string, unknown>>).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        isRead: n.isRead,
        transactionId: n.transactionId,
        createdAt: String(n.createdAt || ""),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.markAll) {
      await markAllNotificationsRead(user.id);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      await markNotificationRead(body.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Notifications Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
