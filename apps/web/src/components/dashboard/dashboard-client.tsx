"use client";

import { useQuery } from "@tanstack/react-query";
import { formatKES } from "@/lib/utils/currency";
import { 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ShieldCheck,
  FileText,
  Activity
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  reference: string;
  title: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

export function DashboardClient() {
  // In a real app, we'd fetch this from an API route
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions/recent");
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface animate-pulse border border-border" />
          ))}
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="An institutional error occurred while synchronizing your dashboard data." />;
  }

  const hasTransactions = transactions && transactions.length > 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-8">
          <p className="kicker mb-2">Total Volume</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[28px] font-bold tabular-nums">KES 0.00</h2>
            <span className="text-[11px] font-mono font-bold text-muted uppercase">Processed</span>
          </div>
        </div>
        <div className="bg-surface border border-border p-8">
          <p className="kicker mb-2">Active Escrows</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[28px] font-bold tabular-nums">0</h2>
            <span className="text-[11px] font-mono font-bold text-accent uppercase">In Progress</span>
          </div>
        </div>
        <div className="bg-surface border border-border p-8">
          <p className="kicker mb-2">Compliance Rating</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[28px] font-bold tabular-nums">98%</h2>
            <span className="text-[11px] font-mono font-bold text-success uppercase">Secured</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-display text-[20px] font-bold tracking-tight">Recent Ledger</h3>
              <p className="text-[12px] text-muted">Your latest synchronized escrow movements.</p>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-widest border-border">
                View Archive
              </Button>
            </Link>
          </div>

          {!hasTransactions ? (
            <div className="bg-surface border border-border">
              <EmptyState 
                title="Empty Ledger"
                description="No transactions identified. Initiate your first institutional escrow to begin."
                action={{
                  label: "Initiate Escrow",
                  href: "/transactions/new"
                }}
              />
            </div>
          ) : (
            <div className="bg-surface border border-border overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="text-left p-4 font-mono text-[10px] uppercase tracking-widest text-muted">Reference</th>
                    <th className="text-left p-4 font-mono text-[10px] uppercase tracking-widest text-muted">Beneficiary/Subject</th>
                    <th className="text-right p-4 font-mono text-[10px] uppercase tracking-widest text-muted">Settlement</th>
                    <th className="text-center p-4 font-mono text-[10px] uppercase tracking-widest text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/5 transition-colors group cursor-pointer">
                      <td className="p-4 font-mono text-[12px] font-bold">{tx.reference}</td>
                      <td className="p-4">
                        <p className="text-[14px] font-bold">{tx.title}</p>
                        <p className="text-[11px] text-muted">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-[14px] font-bold tabular-nums">{formatKES(Number(tx.amount))}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span className={cn(
                            "px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-tight border",
                            tx.status === "completed" ? "bg-success/5 border-success text-success" :
                            tx.status === "active" ? "bg-accent/5 border-accent text-accent" :
                            "bg-muted/5 border-border text-muted"
                          )}>
                            {tx.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <div className="bg-accent text-white p-8">
            <ShieldCheck className="w-8 h-8 text-white/80 mb-6" />
            <h3 className="font-display text-[20px] font-bold mb-2">Institutional KYC</h3>
            <p className="text-white/60 text-[13px] leading-relaxed mb-6">
              Your entity is currently at <span className="text-white font-bold underline">Tier 1</span> (KSh 50,000 limit). Complete verification to increase your transaction capacity.
            </p>
            <Link href="/kyc">
              <Button variant="secondary" className="w-full font-mono text-[11px] uppercase tracking-widest bg-white hover:bg-white/90 border-white">
                Upgrade KYC Tier
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <h4 className="kicker">Quick Actions</h4>
            <div className="grid gap-3">
              <Link href="/transactions/new">
                <div className="flex items-center justify-between p-4 bg-surface border border-border hover:border-accent transition-all group">
                  <div className="flex items-center gap-3">
                    <Plus className="w-4 h-4 text-muted group-hover:text-accent" />
                    <span className="text-[13px] font-bold">New Escrow</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-muted group-hover:text-accent" />
                </div>
              </Link>
              <Link href="/kyc">
                <div className="flex items-center justify-between p-4 bg-surface border border-border hover:border-accent transition-all group">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-muted group-hover:text-accent" />
                    <span className="text-[13px] font-bold">Verify Entity</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-muted group-hover:text-accent" />
                </div>
              </Link>
              <Link href="/disputes">
                <div className="flex items-center justify-between p-4 bg-surface border border-border hover:border-accent transition-all group">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-muted group-hover:text-accent" />
                    <span className="text-[13px] font-bold">Resolution Center</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-muted group-hover:text-accent" />
                </div>
              </Link>
            </div>
          </div>

          <div className="p-8 border border-border bg-muted/5">
            <Activity className="w-6 h-6 text-muted mb-4" />
            <h4 className="text-[14px] font-bold mb-2">Network Health</h4>
            <p className="text-[12px] text-muted leading-relaxed">
              Global payment rails operational. Average settlement time: <span className="text-fg font-bold">4.2 mins</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
