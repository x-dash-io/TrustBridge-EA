import Link from "next/link";
import { ArrowRight, Monitor, Package, Building2, FileText, Briefcase, Handshake } from "lucide-react";

const assetTypes = [
  {
    icon: Monitor,
    id: "digital",
    title: "Digital Assets",
    description: "Domain names, software licenses, source code, intellectual property, digital art, and virtual goods.",
    examples: ["Domain name acquisitions", "Software license transfers", "IP rights assignments", "NFT/ Digital art sales"],
    fee: "From 1.5%",
  },
  {
    icon: Package,
    id: "physical",
    title: "Physical Goods",
    description: "High-value equipment, inventory, commodities, machinery, and manufactured goods.",
    examples: ["Industrial equipment", "Bulk commodity trading", "Vehicle transactions", "Medical equipment"],
    fee: "From 1.5%",
  },
  {
    icon: Building2,
    id: "property",
    title: "Real Property",
    description: "Land, commercial property, residential real estate, and lease assignments.",
    examples: ["Land title transfers", "Commercial leases", "Property development", "Fractional ownership"],
    fee: "From 1.0%",
  },
  {
    icon: FileText,
    id: "legal_data",
    title: "Legal Data Packages",
    description: "Contract portfolios, title deeds, court records, and intellectual property filings.",
    examples: ["M&A due diligence", "Title deed verification", "Contract portfolio transfer", "IP filing packages"],
    fee: "From 2.0%",
  },
  {
    icon: Briefcase,
    id: "business",
    title: "Business Acquisitions",
    description: "Equity transfers, revenue share agreements, revenue-based financing, and business assets.",
    examples: ["SME acquisitions", "Revenue share agreements", "Asset purchases", "Business financing"],
    fee: "From 1.0%",
  },
  {
    icon: Handshake,
    id: "services",
    title: "Professional Services",
    description: "Consulting engagements, construction contracts, logistics agreements, and service level agreements.",
    examples: ["Consulting retainers", "Construction milestones", "Logistics contracts", "SLA-based payments"],
    fee: "From 2.0%",
  },
];

export default function AssetTypesPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-24">
      <div className="mb-16">
        <p className="kicker mb-3">Asset Directory</p>
        <h1 className="font-display text-[48px] font-bold tracking-tight mb-4">
          Supported Asset Classes
        </h1>
        <p className="text-[16px] text-muted max-w-[600px] font-sans leading-relaxed">
          TrustBridge supports six distinct asset classes. Each class has specialized escrow workflows 
          designed for the unique requirements of that asset type.
        </p>
      </div>

      <div className="space-y-px bg-border">
        {assetTypes.map((at) => (
          <div key={at.id} className="bg-surface p-10 md:p-16">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
              <div className="md:w-16 flex-shrink-0">
                <div className="w-14 h-14 bg-accent/10 flex items-center justify-center">
                  <at.icon className="w-7 h-7 text-accent" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="font-display text-[28px] font-bold">{at.title}</h2>
                  <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/5 px-4 py-2">
                    {at.fee}
                  </span>
                </div>
                <p className="text-[15px] text-muted mb-6 font-sans leading-relaxed max-w-[600px]">
                  {at.description}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {at.examples.map((ex) => (
                    <li key={ex} className="flex items-center gap-3 text-[13px]">
                      <span className="w-1.5 h-1.5 bg-accent" />
                      <span className="text-fg/80">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-surface border border-border p-12 text-center">
        <h2 className="font-display text-[28px] font-bold mb-4">Not Sure Which Class?</h2>
        <p className="text-[14px] text-muted mb-8 max-w-[500px] mx-auto font-sans">
          Our onboarding team can help classify your transaction. Most assets fit within one of our six classes.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-3 bg-accent text-white px-10 py-5 text-[13px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-accent/90 transition-colors"
        >
          Start Onboarding
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
