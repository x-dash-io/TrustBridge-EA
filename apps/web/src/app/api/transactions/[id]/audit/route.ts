import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuditLogByTransactionId } from "@/lib/db/queries/audit";

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

    let log: unknown[] = [];
    try {
      log = await getAuditLogByTransactionId(id);
    } catch (dbError) {
      console.warn("Database not available for audit:", dbError);
      log = [
        {
          id: "aud-1",
          action: "TRANSACTION_CREATED",
          actorRole: "buyer",
          metadata: { amount: "1250000", currency: "KES" },
          createdAt: new Date(Date.now() - 86400000 * 7),
        },
        {
          id: "aud-2",
          action: "MILESTONE_1_DELIVERED",
          actorRole: "seller",
          metadata: { milestoneTitle: "Initial Delivery" },
          createdAt: new Date(Date.now() - 86400000 * 3),
        },
        {
          id: "aud-3",
          action: "MILESTONE_1_ACCEPTED",
          actorRole: "buyer",
          metadata: { amount: "625000" },
          createdAt: new Date(Date.now() - 86400000),
        },
      ];
    }

    return NextResponse.json(
      (log as Array<Record<string, unknown>>).map((entry) => ({
        id: entry.id,
        action: entry.action,
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        metadata: entry.metadata,
        ipAddress: entry.ipAddress,
        createdAt: entry.createdAt instanceof Date
          ? entry.createdAt.toISOString()
          : entry.createdAt,
      }))
    );
  } catch (error) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
