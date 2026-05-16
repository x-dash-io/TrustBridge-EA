import { TransactionStatusBadge } from "@/components/transactions/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TierCardProps {
  tier: number;
  limit: string;
  status: "verified" | "pending" | "locked" | "action_required";
  features: string[];
  isActionable?: boolean;
}

function TierCard({ tier, limit, status, features, isActionable }: TierCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "verified": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "action_required": return "bg-accent/10 text-accent border-accent/20";
      default: return "bg-muted/10 text-muted border-muted/20";
    }
  };

  return (
    <div className={`border p-8 transition-all ${status === "locked" ? "opacity-50 grayscale" : "bg-surface border-border shadow-sm"}`}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="kicker mb-1">Verification Level</p>
          <h3 className="font-display text-[24px] font-bold">Tier {tier}</h3>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${getStatusStyles(status)}`}>
          {status.replace("_", " ")}
        </span>
      </div>

      <div className="mb-8 pb-8 border-b border-border">
        <p className="kicker mb-2">Transaction Limit</p>
        <p className="text-[32px] font-bold tabular-nums tracking-tight">{limit}</p>
      </div>

      <div className="space-y-4 mb-10">
        <p className="kicker mb-3">Capabilities</p>
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-success">
              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[13px] font-sans text-fg/80">{feature}</span>
          </div>
        ))}
      </div>

      {isActionable && status !== "verified" && (
        <Link href={`/kyc/tier-${tier}`}>
          <Button variant="primary" size="lg" className="w-full font-mono uppercase tracking-[0.2em]">
            Complete Verification
          </Button>
        </Link>
      )}
      {status === "verified" && (
        <div className="text-center py-3 border border-success/20 bg-success/5">
          <p className="text-[11px] font-mono font-bold text-success uppercase tracking-widest">✓ Verified Access</p>
        </div>
      )}
    </div>
  );
}

export default function KycDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
        <div className="max-w-2xl">
          <h1 className="font-display text-[48px] font-bold leading-tight mb-4 tracking-tight">Identity Verification</h1>
          <p className="text-[16px] text-muted font-sans leading-relaxed">
            As a regulated financial institution, TrustBridge requires identity verification to ensure the security of high-value transactions and comply with Anti-Money Laundering (AML) regulations.
          </p>
        </div>
        <div className="bg-surface border border-border p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-accent text-white flex items-center justify-center font-bold font-mono">?</div>
          <div>
            <p className="kicker">Assistance</p>
            <p className="text-[13px] font-bold">Contact Compliance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <TierCard 
          tier={1}
          limit="KSh 50,000"
          status="verified"
          features={["Basic P2P Escrow", "Mobile Money Collection", "Standard Support"]}
        />
        <TierCard 
          tier={2}
          limit="KSh 1,000,000"
          status="action_required"
          features={["High-Value Transactions", "Bank Wire Support", "Priority Processing", "International Assets"]}
          isActionable
        />
        <TierCard 
          tier={3}
          limit="KSh 10,000,000"
          status="action_required"
          features={["Enhanced Due Diligence", "Source of Funds Declaration", "PEP Screening", "High-Value Transactions", "Manual Review"]}
          isActionable
        />
        <TierCard 
          tier={4}
          limit="Unlimited"
          status="action_required"
          features={["Business Verification (KYB)", "KRA PIN Validation", "Director Verification", "Corporate Account", "Unlimited Limits"]}
          isActionable
        />
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 pt-12 border-t border-border">
        <div className="flex flex-col gap-3">
          <p className="kicker">Security Standards</p>
          <p className="text-[12px] text-muted font-sans">
            Encrypted with bank-grade AES-256 standards. All biometric data is processed through ISO-certified providers.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="kicker">Data Privacy</p>
          <p className="text-[12px] text-muted font-sans">
            Compliant with Kenya Data Protection Act (2019) and GDPR. We never share your data with third parties.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:col-span-2 flex-row justify-end items-center gap-6">
          <div className="opacity-30 flex gap-8 grayscale">
            {/* Regulatory Badges Mock */}
            <div className="font-mono text-[10px] font-bold border border-accent px-2 py-1">CBK REGULATED</div>
            <div className="font-mono text-[10px] font-bold border border-accent px-2 py-1">PCI-DSS COMPLIANT</div>
            <div className="font-mono text-[10px] font-bold border border-accent px-2 py-1">ISO 27001</div>
          </div>
        </div>
      </div>
    </div>
  );
}
