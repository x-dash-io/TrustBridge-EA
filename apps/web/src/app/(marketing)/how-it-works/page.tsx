import Link from "next/link";
import { ArrowRight, FileText, Users, Shield, CheckCircle2, Wallet, Scale, FileSignature } from "lucide-react";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Create Transaction",
    description: "Select your asset class, set terms, define milestones, and add parties. Our wizard guides you through every parameter.",
  },
  {
    icon: Users,
    step: "02",
    title: "Invite Parties",
    description: "Invite sellers, agents, lawyers, and observers. Each party receives secure access to review and sign the escrow agreement.",
  },
  {
    icon: Wallet,
    step: "03",
    title: "Fund Escrow",
    description: "Deposit funds via M-Pesa STK Push, wire transfer, or USDC. Funds are designed to be held in a segregated escrow account.",
  },
  {
    icon: Shield,
    step: "04",
    title: "Milestone Execution",
    description: "Seller delivers against each milestone. Buyer inspects and approves. Funds are released per the agreed schedule.",
  },
  {
    icon: Scale,
    step: "05",
    title: "Dispute Resolution",
    description: "If a dispute arises, our tiered resolution process kicks in — from mediation to binding arbitration.",
  },
  {
    icon: CheckCircle2,
    step: "06",
    title: "Transaction Complete",
    description: "All milestones accepted. Final disbursement made. Full audit trail generated for regulatory compliance.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-24">
      <div className="mb-20">
        <p className="kicker mb-3">The TrustBridge Process</p>
        <h1 className="font-display text-[48px] font-bold tracking-tight mb-4">
          How Escrow Works
        </h1>
        <p className="text-[16px] text-muted max-w-[600px] font-sans leading-relaxed">
          From agreement to completion. Every transaction follows a regulated, auditable process 
          designed for institutional-grade security.
        </p>
      </div>

      <div className="space-y-px bg-border">
        {steps.map((s, i) => (
          <div key={s.step} className="bg-surface p-10 md:p-16 flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="md:w-32 flex-shrink-0">
              <div className="w-16 h-16 bg-accent/10 flex items-center justify-center mb-4">
                <s.icon className="w-8 h-8 text-accent" />
              </div>
              <p className="kicker text-accent font-bold">{s.step}</p>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-[28px] font-bold mb-4">{s.title}</h2>
              <p className="text-[15px] text-muted max-w-[500px] font-sans leading-relaxed">{s.description}</p>
            </div>
            <div className="hidden md:flex items-start">
              {i < steps.length - 1 && (
                <ArrowRight className="w-6 h-6 text-muted/30" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-accent text-white p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="font-display text-[32px] font-bold mb-2">Ready to Begin?</h2>
          <p className="text-accent-fg/80 font-sans">Create your first secure transaction in minutes.</p>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-3 bg-white text-accent px-10 py-5 text-[13px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-white/90 transition-colors flex-shrink-0"
        >
          Create Free Account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
        <div className="bg-surface p-8">
          <FileSignature className="w-6 h-6 text-accent mb-4" />
          <h3 className="font-display text-[18px] font-bold mb-2">Legal Framework</h3>
          <p className="text-[13px] text-muted font-sans leading-relaxed">
            Every transaction is governed by the TrustBridge Escrow Service Agreement, compliant with Kenyan contract law and CMA regulations.
          </p>
        </div>
        <div className="bg-surface p-8">
          <Shield className="w-6 h-6 text-accent mb-4" />
          <h3 className="font-display text-[18px] font-bold mb-2">Audit Trail</h3>
          <p className="text-[13px] text-muted font-sans leading-relaxed">
            Every action is logged in an append-only audit trail with cryptographic hash verification for regulatory compliance.
          </p>
        </div>
        <div className="bg-surface p-8">
          <Scale className="w-6 h-6 text-accent mb-4" />
          <h3 className="font-display text-[18px] font-bold mb-2">Dispute Protection</h3>
          <p className="text-[13px] text-muted font-sans leading-relaxed">
            Multi-tier mediation and arbitration process ensures fair resolution for all parties.
          </p>
        </div>
      </div>
    </div>
  );
}
