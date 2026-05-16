"use client";

import { useEffect, useState } from "react";
import { Kicker } from "@/components/ui/kicker";
import { Loader2, ArrowLeftRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TransactionStatusBadge } from "@/components/transactions/status-badge";

interface TxRow {
  id: string;
  reference: string;
  title: string;
  assetClass: string;
  status: string;
  currency: string;
  amount: string;
  createdBy: string;
  createdAt: string;
  creatorEmail: string | null;
  creatorName: string | null;
}

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchTxs = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/transactions?${params}`);
    const data = await res.json();
    setTxs(data.data || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => { fetchTxs(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTxs();
  };

  const statuses = ["", "draft", "pending_funds", "funded", "in_progress", "completed", "disputed", "cancelled"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <Kicker>Administration</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">All Transactions</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or title..."
            className="w-full bg-bg border border-border pl-12 pr-4 py-3 text-[14px] outline-none focus:border-accent" />
        </div>
        <button type="submit" className="bg-accent text-white px-6 font-mono text-[12px] uppercase tracking-widest font-bold">Search</button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {statuses.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn("px-4 py-2 text-[10px] font-mono uppercase tracking-wider border transition-all",
              statusFilter === s ? "bg-accent text-white border-accent" : "bg-surface text-muted border-border hover:border-accent"
            )}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted py-12"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[12px] font-mono">Loading transactions...</span></div>
      ) : (
        <>
          <div className="bg-surface border border-border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-widest text-muted">
                  <th className="p-4 font-normal">Reference</th>
                  <th className="p-4 font-normal">Title</th>
                  <th className="p-4 font-normal">Creator</th>
                  <th className="p-4 font-normal">Amount</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal">Created</th>
                  <th className="p-4 font-normal" />
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                    <td className="p-4 font-mono text-[12px]">{t.reference}</td>
                    <td className="p-4 text-[14px] font-bold">{t.title}</td>
                    <td className="p-4">
                      <p className="text-[13px]">{t.creatorName || "Unknown"}</p>
                      <p className="text-[10px] font-mono text-muted">{t.creatorEmail}</p>
                    </td>
                    <td className="p-4 font-mono text-[13px] tabular-nums">{t.currency} {Number(t.amount).toLocaleString()}</td>
                    <td className="p-4"><TransactionStatusBadge status={t.status} /></td>
                    <td className="p-4 text-[12px] font-mono text-muted">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="p-4">
                      <Link href={`/transactions/${t.id}`} className="text-[11px] font-mono uppercase tracking-wider text-accent hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-[12px] font-mono text-muted">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className={cn("flex items-center gap-1 px-4 py-2 border border-border text-[12px] font-mono uppercase tracking-wider",
                    page <= 1 ? "text-muted/30" : "text-muted hover:border-accent")}>
                  <ChevronLeft className="w-3 h-3" /> Previous
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className={cn("flex items-center gap-1 px-4 py-2 border border-border text-[12px] font-mono uppercase tracking-wider",
                    page >= totalPages ? "text-muted/30" : "text-muted hover:border-accent")}>
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
