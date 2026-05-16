const DECIMAL_RE = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

export interface Money {
  amountMinor: bigint;
  currency: string;
}

export function parseMoney(value: string | number, currency = "KES"): Money {
  const raw = typeof value === "number" ? value.toString() : value.trim();
  if (!DECIMAL_RE.test(raw)) {
    throw new Error("Amount must be a positive decimal with at most 2 decimal places");
  }

  const [whole, fraction = ""] = raw.split(".");
  const amountMinor = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  if (amountMinor <= BigInt(0)) {
    throw new Error("Amount must be greater than zero");
  }

  return { amountMinor, currency };
}

export function formatMoneyMinor(amountMinor: bigint, currency = "KES"): string {
  const sign = amountMinor < BigInt(0) ? "-" : "";
  const absolute = amountMinor < BigInt(0) ? -amountMinor : amountMinor;
  const whole = absolute / BigInt(100);
  const fraction = (absolute % BigInt(100)).toString().padStart(2, "0");
  return `${sign}${currency} ${whole.toString()}.${fraction}`;
}

export function minorToDecimalString(amountMinor: bigint): string {
  const whole = amountMinor / BigInt(100);
  const fraction = (amountMinor % BigInt(100)).toString().padStart(2, "0");
  return `${whole.toString()}.${fraction}`;
}

export function assertSameCurrency(a: Money, b: Money) {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} != ${b.currency}`);
  }
}

export function sumMoney(values: Money[]): Money {
  if (values.length === 0) {
  return { amountMinor: BigInt(0), currency: "KES" };
  }

  const currency = values[0].currency;
  return {
    currency,
    amountMinor: values.reduce((sum, item) => {
      if (item.currency !== currency) {
        throw new Error(`Currency mismatch: ${item.currency} != ${currency}`);
      }
    return sum + item.amountMinor;
    }, BigInt(0)),
  };
}
