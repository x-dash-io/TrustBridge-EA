import { db } from "@/lib/db";
import {
  ledgerAccounts,
  ledgerEntries,
  ledgerPostings,
  type NewLedgerAccount,
} from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function getOrCreateLedgerAccount(data: NewLedgerAccount) {
  const existing = await db
    .select()
    .from(ledgerAccounts)
    .where(
      and(
        eq(ledgerAccounts.type, data.type),
        eq(ledgerAccounts.currency, data.currency || "KES"),
        data.ownerId ? eq(ledgerAccounts.ownerId, data.ownerId) : sql`${ledgerAccounts.ownerId} is null`,
        data.transactionId
          ? eq(ledgerAccounts.transactionId, data.transactionId)
          : sql`${ledgerAccounts.transactionId} is null`
      )
    )
    .limit(1);

  if (existing[0]) return existing[0];
  const [created] = await db.insert(ledgerAccounts).values(data).returning();
  return created;
}

export interface LedgerPostingInput {
  accountId: string;
  direction: "debit" | "credit";
  amountMinor: bigint;
  currency: string;
}

export function assertBalancedPostings(postings: LedgerPostingInput[]) {
  const debit = postings
    .filter((p) => p.direction === "debit")
    .reduce((sum, p) => sum + p.amountMinor, BigInt(0));
  const credit = postings
    .filter((p) => p.direction === "credit")
    .reduce((sum, p) => sum + p.amountMinor, BigInt(0));

  if (debit !== credit) {
    throw new Error("Ledger entry is not balanced");
  }
  if (postings.length < 2) {
    throw new Error("Ledger entry requires at least two postings");
  }
}

export async function postLedgerEntry(input: {
  sourceType: string;
  sourceId: string;
  idempotencyKey: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string | null;
  postings: LedgerPostingInput[];
}) {
  assertBalancedPostings(input.postings);

  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.idempotencyKey, input.idempotencyKey))
      .limit(1);
    if (existing[0]) return existing[0];

    const [entry] = await tx
      .insert(ledgerEntries)
      .values({
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        idempotencyKey: input.idempotencyKey,
        description: input.description,
        metadata: input.metadata,
        createdBy: input.createdBy || null,
      })
      .returning();

    await tx.insert(ledgerPostings).values(
      input.postings.map((posting) => ({
        entryId: entry.id,
        accountId: posting.accountId,
        direction: posting.direction,
        amountMinor: posting.amountMinor,
        currency: posting.currency,
      }))
    );

    return entry;
  });
}

export async function getLedgerImbalances() {
  return db.execute(sql`
    select entry_id
    from ledger_postings
    group by entry_id, currency
    having sum(case when direction = 'debit' then amount_minor else -amount_minor end) != 0
  `);
}

export async function getEscrowBalanceByTransaction(transactionId: string) {
  return db.execute(sql`
    select coalesce(sum(case when lp.direction = 'credit' then lp.amount_minor else -lp.amount_minor end), 0) as balance_minor
    from ledger_postings lp
    join ledger_accounts la on la.id = lp.account_id
    where la.transaction_id = ${transactionId}
      and la.type = 'escrow'
  `);
}
