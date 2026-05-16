import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/" className="font-display text-[22px] font-bold tracking-tight text-fg no-underline">
            TrustBridge
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/pricing" className="kicker text-muted hover:text-accent transition-colors no-underline">Pricing</Link>
            <Link href="/how-it-works" className="kicker text-muted hover:text-accent transition-colors no-underline">How It Works</Link>
            <Link href="/assets" className="kicker text-muted hover:text-accent transition-colors no-underline">Asset Types</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border mt-24">
        <div className="max-w-[1200px] mx-auto px-8 py-12">
          <div className="flex justify-between items-center">
            <p className="font-display text-[18px] font-bold tracking-tight">TrustBridge</p>
            <p className="text-[11px] font-mono text-muted uppercase tracking-widest">
              Regulated Escrow for East Africa
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex justify-between text-[12px] text-muted">
            <p>&copy; {new Date().getFullYear()} TrustBridge EA. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="font-mono uppercase text-[10px] tracking-wider">Compliance Ready</span>
              <span className="font-mono uppercase text-[10px] tracking-wider">PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
