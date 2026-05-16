"use client";

import Link from "next/link";
import { useWizardStore } from "@/stores/wizard-store";
import { CheckCircle2, ArrowRight, ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  seller: "Counterparty (Seller)",
  agent: "Verification Agent",
  lawyer: "Legal Counsel",
  observer: "Audit Observer",
};

export function StepSuccess() {
  const { transactionRef, transactionId, parties, reset } = useWizardStore();

  return (
    <div className="text-center max-w-[500px] mx-auto py-20 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-20 h-20 flex items-center justify-center mx-auto mb-8 bg-success text-white">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="mb-10">
        <h2 className="font-display text-[32px] font-bold tracking-tight mb-2">Transaction Registered</h2>
        <p className="font-mono text-[16px] text-muted tracking-wider uppercase">{transactionRef}</p>
      </div>

      <div className="bg-surface border border-border p-8 text-left mb-10">
        <h3 className="kicker mb-6">Dispatched Notifications</h3>
        <div className="space-y-4">
          {parties.map((p) => (
            <div key={p.id} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="text-[11px] font-mono text-muted uppercase tracking-tight">{roleLabels[p.role]}</span>
              <span className="text-[14px] font-bold tabular-nums">{p.email || p.phone}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Link href={`/payments/${transactionId}`} className="w-full">
          <Button variant="primary" size="lg" className="w-full font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            Initiate Funding
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        
        <Link href={`/transactions/${transactionId}`} className="w-full">
          <Button variant="outline" size="lg" className="w-full font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-border text-muted hover:text-accent hover:border-accent">
            Registry Audit
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>

        <button
          type="button"
          onClick={reset}
          className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          <RefreshCcw className="w-3 h-3" />
          Initialize New Transaction
        </button>
      </div>
    </div>
  );
}
