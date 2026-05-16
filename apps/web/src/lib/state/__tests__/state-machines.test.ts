import { describe, expect, it } from "vitest";
import { canTransitionMilestone } from "@/lib/state/milestones";
import { canTransitionTransaction } from "@/lib/state/transactions";

describe("state machines", () => {
  it("allows only explicit milestone transitions", () => {
    expect(canTransitionMilestone("pending", "delivered")).toBe(true);
    expect(canTransitionMilestone("delivered", "accepted")).toBe(true);
    expect(canTransitionMilestone("accepted", "disputed")).toBe(false);
    expect(canTransitionMilestone("released", "pending")).toBe(false);
  });

  it("allows only explicit transaction transitions", () => {
    expect(canTransitionTransaction("pending_funds", "funded")).toBe(true);
    expect(canTransitionTransaction("funded", "in_progress")).toBe(true);
    expect(canTransitionTransaction("completed", "disputed")).toBe(false);
    expect(canTransitionTransaction("cancelled", "funded")).toBe(false);
  });
});
