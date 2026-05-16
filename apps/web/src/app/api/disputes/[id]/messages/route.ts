import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDisputeMessages, createDisputeMessage } from "@/lib/db/queries/disputes";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { z } from "zod";

const messageSchema = z.object({
  body: z.string().min(1, "Message body is required"),
  senderRole: z.string().optional(),
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

    let messages: unknown[] = [];
    try {
      messages = await getDisputeMessages(id);
    } catch (dbError) {
      console.warn("Database error fetching messages:", dbError);
    }

    return NextResponse.json((messages as Array<Record<string, unknown>>).map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderRole: m.senderRole,
      body: m.body,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    })));
  } catch (error) {
    console.error("Dispute Messages API Error:", error);
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
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const message = await createDisputeMessage({
      disputeId: id,
      senderId: user.id,
      senderRole: parsed.data.senderRole || "buyer",
      body: parsed.data.body,
    });

    await logAuditEvent({
      transactionId: null,
      actorId: user.id,
      actorRole: parsed.data.senderRole || "buyer",
      action: "DISPUTE_MESSAGE_SENT",
      metadata: { disputeId: id, messageId: message.id },
    });

    return NextResponse.json({
      id: message.id,
      senderId: message.senderId,
      senderRole: message.senderRole,
      body: message.body,
      createdAt: message.createdAt?.toISOString(),
    });
  } catch (error) {
    console.error("Dispute Message Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
