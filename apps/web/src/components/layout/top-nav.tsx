"use client";

import { usePathname } from "next/navigation";
import { Search, Plus, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openCommandCentre } from "@/components/layout/command-centre";
import Link from "next/link";

export function TopNav() {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, index) => {
      const href = "/" + parts.slice(0, index + 1).join("/");
      const label = part.charAt(0).toUpperCase() + part.slice(1);
      return { label, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-[80px] border-b border-border bg-white flex items-center justify-between px-12 sticky top-0 z-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-widest text-muted">
        <Link href="/dashboard" className="hover:text-accent transition-colors">TrustBridge</Link>
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3" />
            <Link 
              href={crumb.href} 
              className={i === breadcrumbs.length - 1 ? "text-fg font-bold" : "hover:text-accent transition-colors"}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="relative hidden md:flex items-center gap-2 bg-muted/5 border border-border pl-10 pr-4 py-2 text-[13px] w-[300px] transition-all cursor-text hover:border-accent group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-hover:text-accent" />
          <input
            type="text"
            onFocus={openCommandCentre}
            onClick={openCommandCentre}
            placeholder="Search pages and actions..."
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-fg placeholder-muted/60 cursor-text"
          />
          <kbd className="ml-auto text-[10px] font-mono text-muted border border-border px-1.5 py-0.5 leading-none flex-shrink-0">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </div>

        <div className="flex items-center gap-4 border-l border-border pl-6">
          <button className="relative p-2 text-muted hover:text-accent transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent" />
          </button>
          
          <Link href="/transactions/new">
            <Button variant="primary" size="sm" className="font-mono uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Escrow
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
