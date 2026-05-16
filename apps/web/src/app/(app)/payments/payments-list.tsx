"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeftRight, CircleSlash } from "lucide-react";
import { TransactionStatusBadge } from "@/components/transactions/status-badge";

interface PendingPayment {
  id: string;
  reference: string;
  title: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

export function PaymentsList() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions?status=pending_funds&limit=50")
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted py-12">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-[12px] font-mono">Loading pending payments...</span>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-surface border border-border p-16 text-center">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
          <CircleSlash className="w-8 h-8 text-muted" />
        </div>
        <p className="text-[14px] font-bold mb-2">No Pending Payments</p>
        <p className="text-[12px] text-muted font-sans max-w-sm mx-auto">
          All transactions are either funded or in draft. Create a new transaction to begin an escrow.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border text-[11px] font-mono uppercase tracking-widest text-muted">
            <th className="p-4 font-normal">Reference</th>
            <th className="p-4 font-normal">Description</th>
            <th className="p-4 font-normal">Amount</th>
            <th className="p-4 font-normal">Status</th>
            <th className="p-4 font-normal">Created</th>
            <th className="p-4 font-normal" />
          </tr>
        </thead>
        <tbody>
          {payments.map((tx) => (
            <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/5">
              <td className="p-4 font-mono text-[12px]">{tx.reference}</td>
              <td className="p-4 text-[14px] font-bold">{tx.title}</td>
              <td className="p-4 font-mono text-[13px] tabular-nums">
                {tx.currency} {Number(tx.amount).toLocaleString()}
              </td>
              <td className="p-4">
                <TransactionStatusBadge status={tx.status} />
              </td>
              <td className="p-4 text-[12px] font-mono text-muted">
                {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "-"}
              </td>
              <td className="p-4">
                <Link
                  href={`/payments/${tx.id}`}
                  className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 font-mono text-[11px] uppercase tracking-wider font-bold hover:bg-accent/90 transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  Fund Escrow
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
