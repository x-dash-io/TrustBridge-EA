import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMilestoneById, transitionMilestoneStatus } from "@/lib/db/queries/milestones";
import { getTransactionParties } from "@/lib/db/queries/transactions";
import { logAuditEvent } from "@/lib/db/queries/audit";
import { getUserById } from "@/lib/db/queries/users";
import { initiateB2CRequest } from "@/lib/mpesa/b2c";
import { createDisbursement } from "@/lib/db/queries/disbursements";
import { assertRealMoneyEnabled } from "@/lib/compliance/limits";
import { parseMoney } from "@/lib/money";
import { getOrCreateLedgerAccount, postLedgerEntry } from "@/lib/db/queries/ledger";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limited = await rateLimit(request, "strict", "milestone:accept");
  if (limited) return limited;

  try {
    assertRealMoneyEnabled("Milestone release");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Real money disabled" },
      { status: 503 }
    );
  }

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

  if (milestone.status !== "delivered") {
    return NextResponse.json({ error: "Milestone must be delivered before acceptance" }, { status: 400 });
  }

  const parties = await getTransactionParties(milestone.transactionId!);
  const buyerParty = parties.find(p => p.role === "buyer");
  const sellerParty = parties.find(p => p.role === "seller");

  // 3. Verify Sender is Buyer
  if (buyerParty?.userId !== user.id) {
    return NextResponse.json({ error: "Only the buyer can accept milestones" }, { status: 403 });
  }

  try {
    // 4. Atomically update Milestone Status to 'accepted'
    const transitioned = await transitionMilestoneStatus(id, "delivered", "accepted", {
      acceptedAt: new Date(),
    });
    if (!transitioned) {
      return NextResponse.json({ error: "Milestone status changed; retry with latest state" }, { status: 409 });
    }

    // 5. Fetch Seller Contact for Disbursement
    const seller = await getUserById(sellerParty!.userId!);
    if (!seller || !seller.phone) {
      throw new Error("Seller contact information (phone) missing for disbursement");
    }

    // 6. Initiate M-Pesa B2C Disbursement
    const b2cRes = await initiateB2CRequest({
      phone: seller.phone,
      amount: Number(milestone.amount),
      remarks: `Release for Milestone: ${milestone.title}`,
      occasion: "Milestone Release",
    });

    // 7. Record Disbursement
    await createDisbursement({
      transactionId: milestone.transactionId,
      milestoneId: id,
      recipientId: seller.id,
      amount: milestone.amount,
      currency: "KES",
      method: "mpesa_b2c",
      status: "pending",
      mpesaPhone: seller.phone,
      providerReference: b2cRes.ConversationID,
    });

    const money = parseMoney(milestone.amount, "KES");
    const escrowAccount = await getOrCreateLedgerAccount({
      transactionId: milestone.transactionId,
      type: "escrow",
      currency: "KES",
      name: `Escrow ${milestone.transactionId}`,
      isSystem: true,
    });
    const sellerPayable = await getOrCreateLedgerAccount({
      ownerId: seller.id,
      transactionId: milestone.transactionId,
      type: "seller_payable",
      currency: "KES",
      name: `Seller payable ${seller.id}`,
      isSystem: false,
    });
    await postLedgerEntry({
      sourceType: "milestone_acceptance",
      sourceId: id,
      idempotencyKey: `milestone_acceptance:${id}`,
      description: `Release milestone ${id}`,
      createdBy: user.id,
      postings: [
        { accountId: escrowAccount.id, direction: "debit", amountMinor: money.amountMinor, currency: "KES" },
        { accountId: sellerPayable.id, direction: "credit", amountMinor: money.amountMinor, currency: "KES" },
      ],
    });

    // 8. Audit Log
    await logAuditEvent({
      transactionId: milestone.transactionId,
      actorId: user.id,
      actorRole: "buyer",
      action: "MILESTONE_ACCEPTED_DISBURSEMENT_INITIATED",
      metadata: { 
        milestoneId: id, 
        disbursementRef: b2cRes.ConversationID,
        amount: milestone.amount
      },
    });

    return NextResponse.json({ success: true, conversationId: b2cRes.ConversationID });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
