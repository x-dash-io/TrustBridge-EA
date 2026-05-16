"use client";

import { useEffect, useState } from "react";
import { Kicker } from "@/components/ui/kicker";
import { Loader2, ShieldQuestion, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KycRow {
  id: string;
  userId: string;
  tier: number;
  documentType: string;
  documentNumber: string;
  country: string;
  status: string;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  userEmail: string | null;
  userFullName: string | null;
}

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchKyc = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20", status: statusFilter });
    const res = await fetch(`/api/admin/kyc?${params}`);
    const data = await res.json();
    setSubmissions(data.data || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => { fetchKyc(); }, [page, statusFilter]);

  const statusStyles = (s: string) => {
    switch (s) {
      case "verified": return "text-success border-success/20 bg-success/5";
      case "rejected": return "text-danger border-danger/20 bg-danger/5";
      default: return "text-warning border-warning/20 bg-warning/5";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-start mb-10">
        <div>
          <Kicker>Administration</Kicker>
          <h1 className="font-display text-[42px] font-bold tracking-tight italic">KYC Review Queue</h1>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {["pending", "verified", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn(
              "px-6 py-3 text-[11px] font-mono uppercase tracking-widest border transition-all",
              statusFilter === s
                ? "bg-accent text-white border-accent"
                : "bg-surface text-muted border-border hover:border-accent"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted py-12">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-[12px] font-mono">Loading submissions...</span>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-surface border border-border p-12 text-center">
          <ShieldQuestion className="w-8 h-8 text-muted mx-auto mb-4" />
          <p className="text-[14px] font-bold mb-2">No {statusFilter} submissions</p>
          <p className="text-[12px] text-muted font-sans">All KYC submissions have been reviewed.</p>
        </div>
      ) : (
        <>
          <div className="bg-surface border border-border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-widest text-muted">
                  <th className="p-4 font-normal">User</th>
                  <th className="p-4 font-normal">Tier</th>
                  <th className="p-4 font-normal">Document</th>
                  <th className="p-4 font-normal">Country</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal">Submitted</th>
                  <th className="p-4 font-normal" />
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                    <td className="p-4">
                      <p className="text-[14px] font-bold">{s.userFullName || "Unknown"}</p>
                      <p className="text-[11px] font-mono text-muted">{s.userEmail}</p>
                    </td>
                    <td className="p-4 text-[13px] font-mono">Tier {s.tier}</td>
                    <td className="p-4">
                      <p className="text-[13px] font-medium">{s.documentType || "-"}</p>
                      <p className="text-[11px] font-mono text-muted">{s.documentNumber}</p>
                    </td>
                    <td className="p-4 text-[13px] font-mono">{s.country}</td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[10px] font-mono uppercase px-2 py-1 border",
                        statusStyles(s.status)
                      )}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-[12px] font-mono text-muted">
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4">
                      {s.status === "pending" && (
                        <Link
                          href={`/admin/kyc/${s.id}`}
                          className="text-[11px] font-mono uppercase tracking-wider text-accent hover:underline"
                        >
                          Review
                        </Link>
                      )}
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
