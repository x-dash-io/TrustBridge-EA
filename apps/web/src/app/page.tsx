import Link from "next/link";
import { ArrowRight, Shield, Scale, FileCheck, Building, Landmark, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Regulated Escrow",
    description: "CBK-regulated trust accounts with institutional-grade security. Every transaction is audited and insured.",
  },
  {
    icon: Scale,
    title: "Multi-Asset Support",
    description: "Digital assets, physical goods, real property, legal documents, business acquisitions, and professional services.",
  },
  {
    icon: FileCheck,
    title: "Smart Milestones",
    description: "Phased fund release with deliverable-based verification. Funds are only released when conditions are met.",
  },
  {
    icon: Building,
    title: "M-Pesa Integration",
    description: "Native M-Pesa STK Push and B2C disbursement. Pay and get paid via your mobile money wallet.",
  },
  {
    icon: Landmark,
    title: "Bank-Grade Security",
    description: "PCI-DSS compliant infrastructure with end-to-end encryption, audit trails, and multi-party signing.",
  },
  {
    icon: Globe,
    title: "East Africa Focus",
    description: "Purpose-built for Kenya, Uganda, Tanzania, Rwanda. Multi-currency support (KES, UGX, TZS, RWF).",
  },
];

const assetClasses = [
  { name: "Digital Assets", items: "Domains, Software, IP, Code, Digital Art" },
  { name: "Physical Goods", items: "Equipment, Inventory, Commodities, Machinery" },
  { name: "Real Property", items: "Land, Commercial, Residential, Leases" },
  { name: "Legal Data", items: "Contracts, Title Deeds, Court Records, IP Filings" },
  { name: "Business", items: "Equity, Revenue Share, Revenue-Based Financing" },
  { name: "Services", items: "Consulting, Construction, Logistics, Professional" },
];

export default function LandingPage() {
  return (
    <div className="bg-bg">
      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-32 md:py-48">
          <div className="max-w-[800px]">
            <p className="kicker mb-6">
              <span className="text-accent font-bold">CBK Regulated</span>
              {" / "}Multi-Asset Escrow
            </p>
            <h1 className="font-display text-[56px] md:text-[72px] font-bold leading-[0.95] tracking-tight mb-8">
              Trusted Escrow for
              <br />
              <span className="italic text-accent">East African Commerce</span>
            </h1>
            <p className="text-[18px] text-muted max-w-[600px] leading-relaxed mb-12 font-sans">
              Institutional-grade escrow for every asset class. M-Pesa native, CBK-regulated, 
              and built for Kenya, Uganda, Tanzania, and Rwanda.
            </p>
            <div className="flex gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 bg-accent text-white px-8 py-4 text-[13px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-accent/90 transition-colors"
              >
                Start Secure Transaction
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-3 bg-transparent text-fg px-8 py-4 text-[13px] font-mono uppercase tracking-[0.2em] font-bold border border-border hover:border-accent hover:text-accent transition-colors"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ASSET CLASSES ───────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-24">
          <div className="mb-16">
            <p className="kicker mb-3">Asset Classes</p>
            <h2 className="font-display text-[42px] font-bold tracking-tight">
              Six Asset Classes.
              <br />
              <span className="text-muted italic">One Escrow Standard.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {assetClasses.map((ac) => (
              <div key={ac.name} className="bg-surface p-8">
                <h3 className="font-display text-[22px] font-bold mb-3">{ac.name}</h3>
                <p className="text-[13px] text-muted font-sans leading-relaxed">{ac.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-24">
          <div className="mb-16">
            <p className="kicker mb-3">Institutional Features</p>
            <h2 className="font-display text-[42px] font-bold tracking-tight">
              Banking Infrastructure
              <br />
              <span className="text-muted italic">for the Digital Economy.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {features.map((f) => (
              <div key={f.title} className="bg-surface p-8">
                <div className="w-10 h-10 bg-accent/10 flex items-center justify-center mb-6">
                  <f.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display text-[20px] font-bold mb-3">{f.title}</h3>
                <p className="text-[13px] text-muted font-sans leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section>
        <div className="max-w-[1200px] mx-auto px-8 py-24">
          <div className="bg-accent text-white p-16 md:p-24 text-center">
            <p className="kicker text-fg mb-4">Get Started</p>
            <h2 className="font-display text-[42px] font-bold tracking-tight mb-6">
              Ready to Secure Your Transaction?
            </h2>
            <p className="text-[16px] text-accent-fg/80 max-w-[500px] mx-auto mb-10 font-sans leading-relaxed">
              Join leading East African institutions using TrustBridge for their high-value transactions.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-white text-accent px-10 py-5 text-[13px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-white/90 transition-colors"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
