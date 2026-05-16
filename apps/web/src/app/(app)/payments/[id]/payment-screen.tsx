"use client";

import Link from "next/link";
import { useState } from "react";
import { MpesaStkFlow } from "@/components/payments/mpesa-stk-flow";
import { formatKES, calcFee } from "@/lib/utils/currency";
import type { Transaction } from "@/lib/db/schema";

type PaymentMethod = "mpesa" | "wire" | "usdc";

interface PaymentScreenProps {
  transaction: Transaction;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "mpesa", label: "M-Pesa STK Push" },
  { value: "wire", label: "Wire Transfer" },
  { value: "usdc", label: "USDC / Stablecoin" },
];

export function PaymentScreen({ transaction }: PaymentScreenProps) {
  const [method, setMethod] = useState<PaymentMethod>("mpesa");

  const numAmount = Number(transaction.amount);
  const fee = calcFee(numAmount);
  const total = numAmount + fee;
  const currency = transaction.currency;

  const formattedAmount =
    currency === "KES" ? formatKES(numAmount) : `${currency} ${numAmount.toLocaleString()}`;
  const formattedFee =
    currency === "KES" ? formatKES(fee) : `${currency} ${fee.toLocaleString()}`;
  const formattedTotal =
    currency === "KES" ? formatKES(total) : `${currency} ${total.toLocaleString()}`;

  return (
    <div className="max-w-[600px] mx-auto px-4 py-12">
      <Link
        href="/dashboard"
        className="font-display text-[20px] font-bold no-underline text-fg block text-center mb-12"
      >
        TrustBridge
      </Link>

      <div className="bg-surface border border-border p-12">
        <p className="kicker text-center mb-2">
          Transaction #{transaction.reference}
        </p>
        <h1 className="font-display text-[28px] font-bold text-center mb-8">
          Fund Escrow
        </h1>

        <div className="bg-bg border border-border p-6 mb-8">
          <div className="flex justify-between text-[14px] mb-2">
            <span className="text-muted">{transaction.title}</span>
            <span className="tabular-nums">{formattedAmount}</span>
          </div>
          <div className="flex justify-between text-[14px] mb-2">
            <span className="text-muted">Escrow Service Fee</span>
            <span className="tabular-nums">{formattedFee}</span>
          </div>
          <div className="flex justify-between text-[18px] font-bold pt-3 mt-3 border-t border-border">
            <span>Total Amount</span>
            <span className="tabular-nums">{formattedTotal}</span>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-[13px] font-[600] mb-3">
            Payment Method
          </label>
          <div className="flex border border-border">
            {paymentMethods.map((pm) => {
              const active = method === pm.value;
              return (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setMethod(pm.value)}
                  className={`flex-1 p-3 text-[12px] font-[600] font-mono uppercase tracking-[0.05em] transition-colors cursor-pointer
                    ${
                      active
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-transparent text-muted hover:text-[var(--color-accent)]"
                    }
                  `}
                >
                  {pm.label}
                </button>
              );
            })}
          </div>
        </div>

        {method === "mpesa" && (
          <div>
            <MpesaStkFlow
              transactionId={transaction.id}
              transactionRef={transaction.reference}
              amount={numAmount}
              currency={currency}
            />
          </div>
        )}

        {method === "wire" && (
          <div>
            <div className="text-[14px] flex flex-col gap-4">
              <div className="bg-bg border border-border p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-3">
                  KCB Bank Kenya
                </p>
                <div className="flex flex-col gap-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-muted">Account Name</span>
                    <span className="font-bold">TrustBridge Escrow Services Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Account Number</span>
                    <span className="font-mono tabular-nums">7213456789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Branch</span>
                    <span>Kencom House, Nairobi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">SWIFT / BIC</span>
                    <span className="font-mono">KCBLKENX</span>
                  </div>
                </div>
              </div>

              <div className="bg-bg border border-border p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-3">
                  Equity Bank Kenya
                </p>
                <div className="flex flex-col gap-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-muted">Account Name</span>
                    <span className="font-bold">TrustBridge Escrow Services Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Account Number</span>
                    <span className="font-mono tabular-nums">0987654321</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Branch</span>
                    <span>Upper Hill, Nairobi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">SWIFT / BIC</span>
                    <span className="font-mono">EQBLKENA</span>
                  </div>
                </div>
              </div>

              <div className="bg-bg border border-border p-4">
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-muted">Your Reference</span>
                  <span className="font-mono">{transaction.reference}</span>
                </div>
              </div>

              <div className="bg-warning/10 border border-warning p-4">
                <p className="text-[12px] text-warning">
                  After making the transfer, email your remittance advice to{" "}
                  <span className="font-mono">payments@trustbridge.co.ke</span>{" "}
                  with reference <span className="font-mono">{transaction.reference}</span>.{" "}
                  Funds will be credited within 1–2 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {method === "usdc" && (
          <div>
            <div className="bg-bg border border-border p-5 mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-3">
                USDC (Solana Network)
              </p>
              <div className="flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted">Network</span>
                  <span className="font-mono">Solana</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Wallet Address</span>
                  <span className="font-mono text-[11px]">
                    F7B3E...9K2X
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-bg border border-border p-5 mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-3">
                USDC (Polygon Network)
              </p>
              <div className="flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted">Network</span>
                  <span className="font-mono">Polygon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Wallet Address</span>
                  <span className="font-mono text-[11px]">
                    0x7B3E...9K2F
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-warning/10 border border-warning p-4">
              <p className="text-[12px] text-warning">
                Send only USDC on the selected network. Ensure your wallet
                supports the correct network. Email confirmation to{" "}
                <span className="font-mono">payments@trustbridge.co.ke</span>.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <p className="font-mono text-[11px] text-muted">
          PCI-DSS COMPLIANT • AES-256 ENCRYPTION • CBK REGULATED ESCROW
        </p>
        <p className="font-mono text-[10px] text-muted mt-1">
          Your session is encrypted and monitored for fraud prevention.
        </p>
      </div>
    </div>
  );
}
