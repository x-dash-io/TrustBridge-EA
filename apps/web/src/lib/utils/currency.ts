export function formatKES(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseAmount(value: string): number {
  return Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

export function calcFeeRate(amount: number): number {
  if (amount <= 50000) return 2.5;
  if (amount <= 500000) return 2.0;
  if (amount <= 5000000) return 1.5;
  if (amount <= 50000000) return 1.0;
  return 0.75; // 0.3-0.75% negotiated for 50M+; midpoint used as default
}

export function calcFee(amount: number): number {
  return amount * (calcFeeRate(amount) / 100);
}
