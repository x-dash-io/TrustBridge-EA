export const TRANSACTION_TRANSITIONS = {
  draft: ["pending_funds", "cancelled"],
  pending_funds: ["funded", "cancelled", "requires_review"],
  funded: ["in_progress", "disputed", "cancelled"],
  in_progress: ["in_inspection", "disputed", "completed"],
  in_inspection: ["completed", "disputed"],
  requires_review: ["pending_funds", "cancelled"],
  disputed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_TRANSITIONS;

export function canTransitionTransaction(from: string, to: string) {
  return ((TRANSACTION_TRANSITIONS as Record<string, readonly string[]>)[from] || []).includes(to);
}

export function assertTransactionTransition(from: string, to: string) {
  if (!canTransitionTransaction(from, to)) {
    throw new Error(`Invalid transaction status transition: ${from} -> ${to}`);
  }
}
