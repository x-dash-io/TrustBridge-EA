import { describe, expect, it } from "vitest";
import { assertKycTierAllowsAmount } from "@/lib/compliance/limits";

describe("KYC transaction limits", () => {
  it("rejects tier 0 and tier 1 users above KES 50,000", () => {
    expect(() => assertKycTierAllowsAmount(0, "50000.01", "KES")).toThrow(/limit exceeded/i);
    expect(() => assertKycTierAllowsAmount(1, "50000.01", "KES")).toThrow(/limit exceeded/i);
  });

  it("allows tier 2 up to KES 1,000,000 and tier 3 up to KES 10,000,000", () => {
    expect(assertKycTierAllowsAmount(2, "1000000", "KES").tier).toBe(2);
    expect(() => assertKycTierAllowsAmount(2, "1000000.01", "KES")).toThrow();
    expect(assertKycTierAllowsAmount(3, "10000000", "KES").tier).toBe(3);
  });

  it("marks high value transactions for manual review", () => {
    expect(assertKycTierAllowsAmount(4, "1000000.01", "KES").requiresManualReview).toBe(true);
  });
});
