"use client";

import { useEffect, useState } from "react";
import { Kicker } from "@/components/ui/kicker";
import { Loader2, ScrollText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  transactionId: string | null;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actorEmail: string | null;
  actorName: string | null;
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchLog = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/audit-log?${params}`);
    const data = await res.json();
    setEntries(data.data || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => { fetchLog(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLog();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <Kicker>Administration</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">Audit Log</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action type..."
            className="w-full bg-bg border border-border pl-12 pr-4 py-3 text-[14px] outline-none focus:border-accent" />
        </div>
        <button type="submit" className="bg-accent text-white px-6 font-mono text-[12px] uppercase tracking-widest font-bold">Search</button>
      </form>

      {loading ? (
        <div className="flex items-center gap-3 text-muted py-12"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[12px] font-mono">Loading audit log...</span></div>
      ) : (
        <>
          <div className="bg-surface border border-border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-widest text-muted">
                  <th className="p-4 font-normal">Timestamp</th>
                  <th className="p-4 font-normal">Actor</th>
                  <th className="p-4 font-normal">Role</th>
                  <th className="p-4 font-normal">Action</th>
                  <th className="p-4 font-normal">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                    <td className="p-4 text-[12px] font-mono tabular-nums">
                      {e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-4">
                      <p className="text-[13px] font-bold">{e.actorName || "System"}</p>
                      <p className="text-[10px] font-mono text-muted">{e.actorEmail}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-muted/10 border border-border">{e.actorRole || "-"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-[12px] font-mono font-bold">{e.action}</span>
                    </td>
                    <td className="p-4 text-[11px] font-mono text-muted max-w-[200px] truncate">
                      {e.metadata ? JSON.stringify(e.metadata) : "-"}
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
