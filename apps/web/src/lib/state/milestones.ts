export const MILESTONE_TRANSITIONS = {
  pending: ["delivered", "disputed", "cancelled"],
  delivered: ["accepted", "disputed"],
  accepted: ["released"],
  released: [],
  disputed: ["accepted", "released", "cancelled"],
  cancelled: [],
} as const;

export type MilestoneStatus = keyof typeof MILESTONE_TRANSITIONS;

export function canTransitionMilestone(from: string, to: string) {
  return ((MILESTONE_TRANSITIONS as Record<string, readonly string[]>)[from] || []).includes(to);
}

export function assertMilestoneTransition(from: string, to: string) {
  if (!canTransitionMilestone(from, to)) {
    throw new Error(`Invalid milestone status transition: ${from} -> ${to}`);
  }
}
