import { parseMoney } from "@/lib/money";

export const KYC_TIER_LIMITS_KES_MINOR = {
  0: BigInt(5_000_000),
  1: BigInt(5_000_000),
  2: BigInt(100_000_000),
  3: BigInt(1_000_000_000),
  4: null,
} as const;

export const HIGH_VALUE_REVIEW_KES_MINOR = BigInt(100_000_000);

export function assertKycTierAllowsAmount(kycTier: number | null | undefined, amount: string, currency: string) {
  if (currency !== "KES") {
    throw new Error("Non-KES transaction limits require FX conversion before creation");
  }

  const tier = Math.max(0, Math.min(4, kycTier ?? 0)) as keyof typeof KYC_TIER_LIMITS_KES_MINOR;
  const limit = KYC_TIER_LIMITS_KES_MINOR[tier];
  const money = parseMoney(amount, currency);

  if (limit !== null && money.amountMinor > limit) {
    throw new Error(`KYC tier ${tier} limit exceeded for ${currency}`);
  }

  return {
    tier,
    amountMinor: money.amountMinor,
    requiresManualReview: money.amountMinor > HIGH_VALUE_REVIEW_KES_MINOR,
  };
}

export function isRealMoneyEnabled() {
  return (
    process.env.ENABLE_REAL_MONEY === "true" &&
    process.env.COMPLIANCE_APPROVED === "true" &&
    !!process.env.MPESA_CONSUMER_KEY &&
    !!process.env.MPESA_CONSUMER_SECRET &&
    !!process.env.MPESA_PASSKEY &&
    !!process.env.MPESA_SHORTCODE &&
    !!process.env.MPESA_WEBHOOK_SECRET &&
    !!process.env.MPESA_B2C_WEBHOOK_SECRET
  );
}

export function assertRealMoneyEnabled(action: string) {
  if (process.env.NODE_ENV === "production" && !isRealMoneyEnabled()) {
    throw new Error(`${action} is disabled until real-money compliance and PSP credentials are configured`);
  }
}

export function assertSmileIdConfigured() {
  if (!process.env.SMILE_ID_PARTNER_ID || !process.env.SMILE_ID_API_KEY) {
    throw new Error("Smile ID credentials are not configured");
  }
}
