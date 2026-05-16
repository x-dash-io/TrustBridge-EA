import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { db } from "@/lib/db";
import { disputes, agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { z } from "zod";

const assignSchema = z.object({
  agentId: z.string().uuid(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    requirePermission(user, "*", "disputes:assign");
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const body = await request.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { agentId } = parsed.data;

    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1)
      .then((r) => r[0] || null);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    await db
      .update(disputes)
      .set({ assignedMediatorId: agent.userId })
      .where(eq(disputes.id, id));

    await logAuditEvent({
      transactionId: null,
      actorId: user.id,
      actorRole: "mediator",
      action: "MEDIATOR_ASSIGNED",
      metadata: { disputeId: id, agentId, agentName: agent.displayName },
    });

    return NextResponse.json({ success: true, mediatorId: agent.userId });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error) {
      const authErr = error as { status: number; message: string };
      return NextResponse.json({ error: authErr.message }, { status: authErr.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
