"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatKES } from "@/lib/utils/currency";
import { filterPhoneInput } from "@/lib/validation";

type FlowStatus = "idle" | "sending" | "pending" | "completed" | "failed";

interface MpesaStkFlowProps {
  transactionId: string;
  transactionRef: string;
  amount: number;
  currency: string;
}

function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length >= 12) {
    const m = digits.match(/^(254)(\d{3})(\d{3})(\d{4})/);
    if (m) return `+${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    const d = `254${digits.slice(1)}`;
    const m = d.match(/^(254)(\d{3})(\d{3})(\d{4})/);
    if (m) return `+${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  }
  if (digits.startsWith("7") && digits.length >= 9) {
    const d = `254${digits}`;
    const m = d.match(/^(254)(\d{3})(\d{3})(\d{4})/);
    if (m) return `+${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  }
  return input;
}

function stripPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("7")) return `254${digits}`;
  return digits;
}

function isValidPhone(input: string): boolean {
  const stripped = stripPhone(input);
  return /^2547\d{8}$/.test(stripped);
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function MpesaStkFlow({
  transactionId,
  transactionRef,
  amount,
  currency,
}: MpesaStkFlowProps) {
  const [status, setStatus] = useState<FlowStatus>("idle");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(180);
  const pollActiveRef = useRef(false);

  const { data: pollData } = useQuery({
    queryKey: ["mpesa-status", checkoutRequestId],
    queryFn: async () => {
      const res = await fetch(
        `/api/payments/mpesa/status?checkoutRequestId=${checkoutRequestId}`
      );
      if (!res.ok) throw new Error("Poll failed");
      return res.json() as Promise<{
        status: string;
        receipt: string | null;
      }>;
    },
    enabled: status === "pending" && !!checkoutRequestId && pollActiveRef.current,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (status === "pending") {
      pollActiveRef.current = true;
    }
  }, [status]);

  useEffect(() => {
    if (!pollData) return;
    if (pollData.status === "completed") {
      setStatus("completed");
      setReceipt(pollData.receipt);
      pollActiveRef.current = false;
    } else if (pollData.status === "failed") {
      setStatus("failed");
      setErrorMessage("Payment was declined. Please try again.");
      pollActiveRef.current = false;
    }
  }, [pollData]);

  useEffect(() => {
    if (status !== "pending") return;
    if (countdown <= 0) {
      setStatus("failed");
      setErrorMessage("Payment request timed out. Please try again.");
      pollActiveRef.current = false;
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown]);

  const handleSubmit = useCallback(async () => {
    if (!isValidPhone(phone)) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/payments/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          phoneNumber: stripPhone(phone),
          amount: Math.ceil(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("failed");
        setErrorMessage(data.message || data.error || "Request failed");
        return;
      }

      setCheckoutRequestId(data.checkoutRequestId);
      setCountdown(180);
      setStatus("pending");
    } catch {
      setStatus("failed");
      setErrorMessage("Network error. Please check your connection.");
    }
  }, [phone, amount, transactionId]);

  const handleCancel = useCallback(() => {
    pollActiveRef.current = false;
    setStatus("idle");
    setCheckoutRequestId(null);
    setCountdown(180);
  }, []);

  const handleRetry = useCallback(() => {
    setStatus("idle");
    setCheckoutRequestId(null);
    setErrorMessage("");
    setReceipt(null);
    setCountdown(180);
  }, []);

  if (status === "completed") {
    return (
      <div className="text-center py-8">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          className="mx-auto mb-6"
        >
          <circle cx="32" cy="32" r="32" fill="var(--color-success)" />
          <path
            d="M20 32l8 8 16-16"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-[18px] font-bold mb-1">Payment Successful</p>
        <p className="text-[14px] text-muted tabular-nums mb-1">
          {currency === "KES" ? formatKES(amount) : `${currency} ${amount.toLocaleString()}`}{" "}
          secured in escrow
        </p>
        {receipt && (
          <p className="font-mono text-[11px] text-muted">
            M-Pesa Receipt: {receipt}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {status === "sending" && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-fg)] rounded-none animate-spin mb-4" />
          <p className="text-[14px] text-muted">Sending payment request...</p>
        </div>
      )}

      {status === "pending" && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
            <span className="absolute inline-flex w-12 h-12 bg-[var(--color-accent)] opacity-20 animate-ping" />
            <span className="relative inline-flex w-12 h-12 bg-[var(--color-accent)] items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="2" fill="white" />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="var(--color-accent)"
                >
                  $
                </text>
              </svg>
            </span>
          </div>
          <p className="text-[14px] font-bold mb-2">
            Check your phone — enter M-Pesa PIN to confirm
          </p>
          <p className="text-[13px] text-muted mb-4">
            We sent a payment request to{" "}
            <span className="font-mono">{formatPhone(phone)}</span>
          </p>
          <p className="font-mono text-[24px] tracking-[0.1em] tabular-nums mb-6">
            {formatCountdown(countdown)}
          </p>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-transparent text-muted border-none text-[13px] cursor-pointer hover:text-[var(--color-accent)]"
          >
            Cancel
          </button>
        </div>
      )}

      {status === "failed" && (
        <div className="text-center py-8">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            className="mx-auto mb-6"
          >
            <circle cx="32" cy="32" r="32" fill="var(--color-danger)" />
            <path
              d="M22 22l20 20M42 22l-20 20"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-[14px] text-muted mb-1">{errorMessage}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="bg-[var(--color-accent)] text-white px-8 py-3 text-[14px] font-[600] hover:bg-[var(--color-fg)] transition-colors mt-4"
          >
            Try Again
          </button>
        </div>
      )}

      {status === "idle" && (
        <>
          <div className="mb-6">
            <label className="block text-[13px] font-[600] mb-2">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(filterPhoneInput(e.target.value))}
              placeholder="+254 7XX XXX XXX"
              className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-[var(--color-accent)]"
            />
            {phone && isValidPhone(phone) && (
              <p className="text-[13px] text-muted mt-2">
                Formatted: {formatPhone(phone)}
              </p>
            )}
          </div>
          <p className="text-[12px] text-muted mb-8">
            We&apos;ll send a payment prompt to this number. Open the M-Pesa menu
            on your phone and enter your PIN to confirm.
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValidPhone(phone)}
            className="w-full bg-[var(--color-accent)] text-white p-4 text-[14px] font-[600] hover:bg-[var(--color-fg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send M-Pesa Request
          </button>
        </>
      )}
    </div>
  );
}
