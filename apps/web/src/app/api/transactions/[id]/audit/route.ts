import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuditLogByTransactionId } from "@/lib/db/queries/audit";
import { rateLimit } from "@/lib/security/rate-limit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limited = await rateLimit(_request, "general", "audit:get");
    if (limited) return limited;

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
      if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEMO_DATA !== "true") {
        console.error("Audit query failed:", dbError);
        return NextResponse.json({ error: "Audit log unavailable" }, { status: 503 });
      }
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
