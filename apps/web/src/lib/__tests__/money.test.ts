import { describe, expect, it } from "vitest";
import { formatMoneyMinor, minorToDecimalString, parseMoney, sumMoney } from "@/lib/money";

describe("money helpers", () => {
  it("parses decimal strings into minor units exactly", () => {
    expect(parseMoney("1250.50", "KES")).toEqual({
      amountMinor: BigInt(125050),
      currency: "KES",
    });
    expect(minorToDecimalString(BigInt(125050))).toBe("1250.50");
  });

  it("rejects unsafe amount formats", () => {
    expect(() => parseMoney("1.234", "KES")).toThrow();
    expect(() => parseMoney("-1", "KES")).toThrow();
    expect(() => parseMoney("1,000", "KES")).toThrow();
  });

  it("sums only matching currencies", () => {
    const total = sumMoney([parseMoney("10", "KES"), parseMoney("0.25", "KES")]);
    expect(formatMoneyMinor(total.amountMinor, total.currency)).toBe("KES 10.25");
    expect(() => sumMoney([parseMoney("10", "KES"), parseMoney("10", "USD")])).toThrow();
  });
});
