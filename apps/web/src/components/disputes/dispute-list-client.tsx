"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  AlertTriangle, 
  Scale, 
  MessageSquare, 
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Dispute {
  id: string;
  transactionRef: string;
  title: string;
  status: string;
  severity: "low" | "medium" | "high";
  updatedAt: string;
}

export function DisputeListClient() {
  const { data: disputes, isLoading, error } = useQuery<Dispute[]>({
    queryKey: ["disputes"],
    queryFn: async () => {
      const res = await fetch("/api/disputes");
      if (!res.ok) throw new Error("Failed to load disputes");
      return res.json();
    },
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <ErrorMessage message="An institutional error occurred while accessing the Resolution Center." />;
  }

  const hasDisputes = disputes && disputes.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {!hasDisputes ? (
        <div className="bg-surface border border-border">
          <EmptyState 
            title="Registry Clear"
            description="No active disputes or mediation cases identified for your account."
            icon={Scale}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-surface border border-border p-8 hover:border-danger transition-all group cursor-pointer">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center transition-colors",
                    dispute.severity === "high" ? "bg-danger text-white" : "bg-muted/10 text-muted"
                  )}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="kicker text-muted mb-1">Case Ref: {dispute.transactionRef}</p>
                    <h3 className="font-display text-[20px] font-bold tracking-tight">{dispute.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-muted uppercase">
                        <Clock className="w-3 h-3" />
                        Updated {new Date(dispute.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-muted uppercase">
                        <MessageSquare className="w-3 h-3" />
                        4 Messages
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="text-right flex-1 md:flex-none">
                    <p className="text-[10px] font-mono font-bold uppercase text-muted tracking-widest mb-1">Status</p>
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-tight border",
                      dispute.status === "mediation" ? "bg-accent/5 border-accent text-accent" : "bg-muted/5 border-border text-muted"
                    )}>
                      {dispute.status}
                    </span>
                  </div>
                  
                  <Link href={`/disputes/${dispute.id}`}>
                    <Button variant="outline" className="border-border group-hover:border-danger group-hover:text-danger font-mono text-[11px] uppercase tracking-widest">
                      Enter Arbitration
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Policy Footer */}
      <div className="p-8 border border-border bg-muted/5 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-muted" />
          <div>
            <p className="text-[14px] font-bold">Standard Resolution Protocol</p>
            <p className="text-[12px] text-muted max-w-md">
              Mediation is handled by neutral institutional nodes. Final arbitration decisions are binding and will execute smart contract reversals.
            </p>
          </div>
        </div>
        <Button variant="ghost" className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accent">
          Resolution Guidelines
        </Button>
      </div>
    </div>
  );
}
