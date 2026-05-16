"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { formatKES, parseAmount, calcFee } from "@/lib/utils/currency";
import { generateReference } from "@/lib/utils/reference";
import { 
  FileText, 
  ArrowLeftRight, 
  Users, 
  ShieldCheck, 
  ChevronLeft,
  CheckSquare,
  Lock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const assetLabels: Record<string, string> = {
  digital: "Digital Assets",
  physical: "Physical Goods",
  property: "Real Property",
  legal_data: "Legal Data Package",
  business: "Business Acquisition",
  services: "Professional Services",
};

const roleLabels: Record<string, string> = {
  seller: "Counterparty (Seller)",
  agent: "Verification Agent",
  lawyer: "Legal Counsel",
  observer: "Audit Observer",
};

export function StepReview() {
  const {
    assetClass, assetSubclass, title, description, currency,
    amount, inspectionPeriodDays, terms, includeDataRoom,
    milestones, parties, agreedToTerms, setAgreedToTerms,
    setTransactionRef, setTransactionId,
    markStepComplete, setStep,
  } = useWizardStore();

  const numAmount = parseAmount(amount);
  const fee = calcFee(numAmount);

  const handleCreate = async () => {
    const ref = generateReference();
    setTransactionRef(ref);
    setTransactionId("new-" + Date.now());

    markStepComplete(4);
    setStep(5);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 pb-20">
      <div className="mb-10">
        <p className="kicker mb-2">Step 05 / 06</p>
        <h2 className="font-display text-[32px] font-bold tracking-tight">Executive Summary</h2>
      </div>

      <div className="space-y-6">
        {/* Asset & Classification */}
        <div className="bg-surface border border-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-4 h-4 text-muted" />
            <h3 className="kicker">Asset Classification</h3>
          </div>
          <div className="flex justify-between items-baseline">
            <p className="text-[20px] font-bold">{assetClass ? assetLabels[assetClass] : ""}</p>
            <p className="text-[12px] font-mono font-bold uppercase text-muted">{assetSubclass || "Standard"}</p>
          </div>
        </div>

        {/* Financial & Terms */}
        <div className="bg-surface border border-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <ArrowLeftRight className="w-4 h-4 text-muted" />
            <h3 className="kicker">Transaction Parameters</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-muted font-mono uppercase text-[11px]">Subject</span>
              <span className="font-bold">{title}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-muted font-mono uppercase text-[11px]">Inspection</span>
              <span className="font-bold">{inspectionPeriodDays} Business Days</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-muted font-mono uppercase text-[11px]">Security</span>
              <span className="font-bold text-success flex items-center gap-2">
                <Lock className="w-3 h-3" />
                {includeDataRoom ? "Encrypted Data Room Active" : "Standard Escrow"}
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Audit */}
        <div className="bg-surface border border-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-4 h-4 text-muted" />
            <h3 className="kicker">Milestone Disbursement Schedule</h3>
          </div>
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-muted">0{i + 1}</span>
                  <span className="text-[14px] font-bold">{m.title}</span>
                </div>
                <span className="text-[14px] font-mono font-bold tabular-nums">
                  {formatKES(parseAmount(m.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Party Registry */}
        <div className="bg-surface border border-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-4 h-4 text-muted" />
            <h3 className="kicker">Involved Entities</h3>
          </div>
          <div className="space-y-3">
            {parties.map((p) => (
              <div key={p.id} className="flex justify-between items-center">
                <span className="text-[12px] font-mono uppercase text-muted tracking-tight">{roleLabels[p.role]}</span>
                <span className="text-[14px] font-bold tabular-nums">{p.email || p.phone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final Settlement Audit */}
        <div className="bg-accent text-white p-8">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <h3 className="kicker text-white/60">Institutional Settlement Audit</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-white/50 font-mono text-[11px] uppercase">Base Amount</span>
              <span className="font-bold tabular-nums">{formatKES(numAmount)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white/50 font-mono text-[11px] uppercase">Compliance Fee</span>
              <span className="font-bold tabular-nums">{formatKES(fee)}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[11px] font-mono text-white/50 uppercase mb-1">Final Settlement</p>
                <p className="font-display text-[18px] font-bold">Total Funding Required</p>
              </div>
              <p className="text-[32px] font-bold tabular-nums tracking-tighter">
                {formatKES(numAmount + fee)}
              </p>
            </div>
          </div>
        </div>

        {/* Legal Consent */}
        <div className="p-8 border border-border bg-muted/5 space-y-6">
          <div className="flex gap-4">
            <div 
              className={cn(
                "w-6 h-6 border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0",
                agreedToTerms ? "border-accent bg-accent text-white" : "border-border bg-white"
              )}
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && <CheckSquare className="w-4 h-4" />}
            </div>
            <p className="text-[13px] text-muted leading-relaxed">
              I certify that all transaction parameters provided are accurate and that I have the legal authority to initiate this escrow. I agree to the <span className="text-fg font-bold underline underline-offset-4 cursor-pointer">TrustBridge Terms of Service</span> and the <span className="text-fg font-bold underline underline-offset-4 cursor-pointer">Standard Multi-Asset Escrow Agreement</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-border">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleCreate}
          disabled={!agreedToTerms}
          className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
        >
          Authorize & Dispatch
          <ArrowLeftRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
