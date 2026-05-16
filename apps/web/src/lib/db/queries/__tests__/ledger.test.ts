import { describe, expect, it } from "vitest";
import { assertBalancedPostings } from "@/lib/db/queries/ledger";

describe("ledger posting validation", () => {
  it("accepts balanced double-entry postings", () => {
    expect(() =>
      assertBalancedPostings([
        { accountId: "a", direction: "debit", amountMinor: BigInt(100), currency: "KES" },
        { accountId: "b", direction: "credit", amountMinor: BigInt(100), currency: "KES" },
      ])
    ).not.toThrow();
  });

  it("rejects unbalanced postings", () => {
    expect(() =>
      assertBalancedPostings([
        { accountId: "a", direction: "debit", amountMinor: BigInt(100), currency: "KES" },
        { accountId: "b", direction: "credit", amountMinor: BigInt(99), currency: "KES" },
      ])
    ).toThrow(/not balanced/i);
  });
});
