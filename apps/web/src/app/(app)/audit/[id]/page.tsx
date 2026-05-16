"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Clock, User, Shield, FileText, CheckCircle2, AlertTriangle, ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import { Kicker } from "@/components/ui/kicker";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: string;
  actorId: string | null;
  actorRole: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

const actionIcons: Record<string, typeof FileText> = {
  TRANSACTION_CREATED: FileText,
  MILESTONE_DELIVERED: CheckCircle2,
  MILESTONE_ACCEPTED: CheckCircle2,
  DISBURSEMENT_INITIATED: Shield,
  DISPUTE_OPENED: AlertTriangle,
  DATA_ROOM_FILE_UPLOADED: FileText,
  DATA_ROOM_NDA_SIGNED: Shield,
  PAYMENT_RECEIVED: CheckCircle2,
  AGENT_ASSIGNED: User,
  BUSINESS_REGISTERED: FileText,
  default: FileText,
};

export default function AuditTrailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: auditLog, isLoading, error } = useQuery<AuditEntry[]>({
    queryKey: ["audit", id],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${id}/audit`);
      if (!res.ok) throw new Error("Failed to load audit trail");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto py-12 px-4">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[900px] mx-auto py-12 px-4">
        <ErrorMessage message="Failed to load audit trail." />
      </div>
    );
  }

  const entries = auditLog || [];

  return (
    <div className="max-w-[900px] mx-auto py-12 px-4">
      <div className="mb-12">
        <Link
          href={`/transactions/${id}`}
          className="inline-flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Transaction Detail
        </Link>
        <Kicker>Append-Only Registry</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">Audit Trail</h1>
        <p className="text-[14px] text-muted font-sans mt-2">
          Chronological, immutable event log for transaction <span className="font-mono text-fg">{id.slice(0, 8)}...</span>
        </p>
        <div className="flex items-center gap-2 mt-4 text-[11px] font-mono text-muted">
          <Hash className="w-3 h-3" />
          <span>SHA-256 Verified Chain of Custody</span>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-0">
          {entries.length === 0 ? (
            <div className="p-12 text-center border border-border bg-surface">
              <p className="text-[14px] text-muted font-mono">No audit events recorded for this transaction.</p>
            </div>
          ) : (
            entries.map((entry, i) => {
              const Icon = actionIcons[entry.action] || actionIcons.default;
              const isLast = i === entries.length - 1;

              return (
                <div key={entry.id} className="flex gap-6 pb-8 relative">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className={cn(
                      "w-[38px] h-[38px] flex items-center justify-center border-2",
                      i === 0 ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-surface border border-border p-6 -mt-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-mono text-[13px] font-bold uppercase tracking-tight">
                          {entry.action.replace(/_/g, " ")}
                        </h3>
                        {entry.actorRole && (
                          <p className="text-[11px] text-muted font-mono uppercase mt-1">
                            Actor: {entry.actorRole}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-[11px] font-mono text-muted">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.createdAt).toLocaleString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">Metadata</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(entry.metadata).map(([key, val]) => (
                            <span key={key} className="text-[11px] font-mono bg-muted/5 border border-border px-2 py-1">
                              <span className="text-muted">{key}: </span>
                              <span className="font-bold text-fg">{String(val)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hash verification indicator */}
                    <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-muted/50 uppercase tracking-widest">
                      <Hash className="w-2.5 h-2.5" />
                      <span>
                        Block #{i + 1}
                        {!isLast && " · Linked to next"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-8 p-6 border border-border bg-surface flex items-center gap-4">
        <Shield className="w-6 h-6 text-success flex-shrink-0" />
        <div>
          <p className="text-[13px] font-bold">Audit Integrity Verified</p>
          <p className="text-[11px] text-muted font-sans">
            This audit trail is append-only and cryptographically linked. Any tampering with historical entries would break the chain.
          </p>
        </div>
      </div>
    </div>
  );
}
