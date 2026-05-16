"use client";

import { useEffect, useState } from "react";
import { Kicker } from "@/components/ui/kicker";
import { Loader2, Scale, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TransactionStatusBadge } from "@/components/transactions/status-badge";

interface DisputeRow {
  id: string;
  reference: string;
  transactionId: string;
  status: string;
  resolutionTier: number;
  assignedMediatorId: string | null;
  openedBy: string;
  openedAt: string;
  transactionReference: string | null;
  transactionTitle: string | null;
  openerName: string | null;
}

export default function AdminDisputesPage() {
  const [disputesList, setDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("open");
  const [agents, setAgents] = useState<{ id: string; displayName: string }[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20", status: statusFilter });
    const res = await fetch(`/api/admin/disputes?${params}`);
    const data = await res.json();
    setDisputes(data.data || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  const fetchAgents = async () => {
    const res = await fetch("/api/admin/agents");
    const data = await res.json();
    setAgents(data.data || []);
  };

  useEffect(() => { fetchDisputes(); fetchAgents(); }, [page, statusFilter]);

  const handleAssign = async (disputeId: string, agentId: string) => {
    setAssigning(disputeId);
    await fetch(`/api/admin/disputes/${disputeId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });
    setAssigning(null);
    fetchDisputes();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <Kicker>Administration</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">Dispute Management</h1>
      </div>

      <div className="flex gap-2 mb-8">
        {["open", "resolved", ""].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn("px-6 py-3 text-[11px] font-mono uppercase tracking-widest border transition-all",
              statusFilter === s ? "bg-accent text-white border-accent" : "bg-surface text-muted border-border hover:border-accent"
            )}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted py-12"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[12px] font-mono">Loading disputes...</span></div>
      ) : (
        <>
          <div className="bg-surface border border-border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-widest text-muted">
                  <th className="p-4 font-normal">Reference</th>
                  <th className="p-4 font-normal">Transaction</th>
                  <th className="p-4 font-normal">Opened By</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal">Mediator</th>
                  <th className="p-4 font-normal" />
                </tr>
              </thead>
              <tbody>
                {disputesList.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                    <td className="p-4 font-mono text-[12px]">{d.reference}</td>
                    <td className="p-4">
                      <p className="text-[13px] font-bold">{d.transactionTitle || "N/A"}</p>
                      <p className="text-[10px] font-mono text-muted">{d.transactionReference}</p>
                    </td>
                    <td className="p-4 text-[13px]">{d.openerName || "Unknown"}</td>
                    <td className="p-4"><TransactionStatusBadge status={d.status} /></td>
                    <td className="p-4">
                      {d.status === "open" ? (
                        <select
                          defaultValue=""
                          onChange={(e) => e.target.value && handleAssign(d.id, e.target.value)}
                          disabled={assigning === d.id}
                          className="bg-bg border border-border px-2 py-1 text-[11px] font-mono outline-none"
                        >
                          <option value="">{assigning === d.id ? "Assigning..." : "Assign..."}</option>
                          {agents.map((a) => (
                            <option key={a.id} value={a.id}>{a.displayName}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[12px] font-mono text-muted">Resolved</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link href={`/disputes/${d.id}`} className="text-[11px] font-mono uppercase tracking-wider text-accent hover:underline">View</Link>
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
