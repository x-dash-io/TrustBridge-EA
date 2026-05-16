import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { agentAssignments } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { z } from "zod";

const assignSchema = z.object({
  transactionId: z.string().uuid(),
  notes: z.string().optional(),
});

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

    const assignments = await db
      .select()
      .from(agentAssignments)
      .where(eq(agentAssignments.agentId, id))
      .orderBy(desc(agentAssignments.assignedAt));

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Agent Assignments Error:", error);
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

    const body = await request.json();
    const parsed = assignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const assignment = await db
      .insert(agentAssignments)
      .values({
        agentId: id,
        transactionId: parsed.data.transactionId,
        status: "assigned",
        inspectionNotes: parsed.data.notes || null,
      })
      .returning();

    await logAuditEvent({
      transactionId: parsed.data.transactionId,
      actorId: user.id,
      actorRole: "buyer",
      action: "AGENT_ASSIGNED",
      metadata: { agentId: id, assignmentId: assignment[0]?.id },
    });

    return NextResponse.json(assignment[0]);
  } catch (error) {
    console.error("Agent Assign Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
