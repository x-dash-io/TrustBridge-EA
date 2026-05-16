import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMilestoneById, transitionMilestoneStatus } from "@/lib/db/queries/milestones";
import { getTransactionParties } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { db } from "@/lib/db";
import { disputes } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limited = await rateLimit(request, "strict", "milestone:dispute");
  if (limited) return limited;

  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch Milestone
  const milestone = await getMilestoneById(id);
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  const parties = await getTransactionParties(milestone.transactionId!);
  const isParty = parties.some(p => p.userId === user.id);

  // 3. Verify Sender is a Party
  if (!isParty) {
    return NextResponse.json({ error: "Only transaction parties can open disputes" }, { status: 403 });
  }

  try {
    const { reason } = await request.json();

    // 4. Create Dispute Record
    const [newDispute] = await db.insert(disputes).values({
      reference: `DIS-${uuidv4().slice(0, 8).toUpperCase()}`,
      transactionId: milestone.transactionId,
      milestoneId: id,
      openedBy: user.id,
      status: "open",
    }).returning();

    // 5. Update Milestone Status to 'disputed'
    const transitioned = await transitionMilestoneStatus(
      id,
      milestone.status || "pending",
      "disputed"
    );
    if (!transitioned) {
      return NextResponse.json({ error: "Milestone status changed; retry with latest state" }, { status: 409 });
    }

    // 6. Audit Log
    await logAuditEvent({
      transactionId: milestone.transactionId,
      actorId: user.id,
      action: "DISPUTE_OPENED",
      metadata: { milestoneId: id, disputeId: newDispute.id, reason },
    });

    return NextResponse.json({ success: true, disputeId: newDispute.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
