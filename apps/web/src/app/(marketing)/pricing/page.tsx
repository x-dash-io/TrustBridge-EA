import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const tiers = [
  {
    name: "Standard",
    price: "2.5%",
    range: "Up to KSh 50,000",
    color: "text-fg",
    features: [
      "Full escrow protection",
      "M-Pesa STK Push funding",
      "Basic milestone tracking",
      "Email notifications",
      "Standard support",
    ],
  },
  {
    name: "Professional",
    price: "1.5%",
    range: "KSh 50K – 5M",
    color: "text-accent",
    popular: true,
    features: [
      "All Standard features",
      "M-Pesa + Wire + USDC",
      "Advanced milestone engine",
      "Data room with NDA gate",
      "Multi-party invites",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "0.75%",
    range: "KSh 5M – 50M+",
    color: "text-fg",
    features: [
      "All Professional features",
      "Dedicated account manager",
      "Custom legal frameworks",
      "Bulk transaction API",
      "On-site verification agents",
      "SLA guarantee",
      "Negotiated rates above 50M",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-24">
      <div className="mb-16">
        <p className="kicker mb-3">Institutional Pricing</p>
        <h1 className="font-display text-[48px] font-bold tracking-tight mb-4">
          Transparent Fee Structure
        </h1>
        <p className="text-[16px] text-muted max-w-[600px] font-sans leading-relaxed">
          Volume-based pricing with no hidden fees. Funds are designed for segregated escrow accounts subject to licensing.
          Fees are deducted from the funding amount upon transaction creation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
        {tiers.map((tier) => (
          <div key={tier.name} className={`bg-surface p-10 flex flex-col ${tier.popular ? "relative" : ""}`}>
            {tier.popular && (
              <div className="absolute top-0 left-0 right-0 bg-accent text-white text-center py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                Most Popular
              </div>
            )}
            <div className={`mb-8 ${tier.popular ? "mt-10" : ""}`}>
              <h2 className="font-display text-[24px] font-bold mb-1">{tier.name}</h2>
              <p className="text-[13px] text-muted font-sans">{tier.range}</p>
            </div>
            <div className="mb-10">
              <span className={`font-display text-[56px] font-bold tracking-tight ${tier.color}`}>{tier.price}</span>
              <span className="text-muted font-mono text-[13px]"> / transaction</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[14px]">
                  <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-fg/80">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={`block w-full text-center py-4 text-[13px] font-mono uppercase tracking-[0.2em] font-bold transition-colors ${
                tier.popular
                  ? "bg-accent text-white hover:bg-accent/90"
                  : "bg-transparent text-fg border border-border hover:border-accent hover:text-accent"
              }`}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 border border-border bg-surface">
        <p className="text-[12px] text-muted font-sans leading-relaxed">
          <strong className="text-fg">Regulatory Note:</strong> All fees are exclusive of applicable taxes and 
          regulatory levies. Large transactions (above KSh 50M) qualify for negotiated fee rates. 
          Contact our institutional desk for custom pricing. TrustBridge EA is regulated by the 
          Capital Markets Authority (CMA) under the Kenya Capital Markets Act.
        </p>
      </div>
    </div>
  );
}
