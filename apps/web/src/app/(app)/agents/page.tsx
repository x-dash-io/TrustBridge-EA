"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, Shield, Briefcase, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Agent {
  id: string;
  displayName: string;
  counties: string[] | null;
  countries: string[] | null;
  assetClasses: string[] | null;
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean | null;
}

const assetClassLabels: Record<string, string> = {
  digital: "Digital Assets",
  physical: "Physical Goods",
  property: "Real Property",
  legal_data: "Legal Data",
  business: "Business",
  services: "Services",
};

export default function AgentsPage() {
  const [search, setSearch] = useState("");

  const { data: agents, isLoading, error } = useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to load agents");
      return res.json();
    },
  });

  const filtered = (agents || []).filter((a) =>
    a.displayName.toLowerCase().includes(search.toLowerCase()) ||
    a.counties?.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto py-12 px-4">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1000px] mx-auto py-12 px-4">
        <ErrorMessage message="Failed to load verification agent network." />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-4">
      <div className="mb-12">
        <Kicker>Verification Network</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">Agent Directory</h1>
        <p className="text-[14px] text-muted font-sans mt-2">
          Licensed verification agents available for physical inspection and asset verification across East Africa.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-10 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or county..."
          className="w-full bg-surface border border-border pl-12 pr-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface border border-border">
          <EmptyState
            icon={Shield}
            title="No Agents Found"
            description={search ? "No agents match your search." : "No verification agents are currently available in your region."}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {filtered.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.id}`} className="block bg-surface p-8 hover:bg-muted/5 transition-colors group">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-[22px] font-bold tracking-tight">{agent.displayName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    {agent.rating && (
                      <div className="flex items-center gap-1 text-[12px] font-mono">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="font-bold">{agent.rating}</span>
                        <span className="text-muted">({agent.reviewCount || 0})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-muted font-mono">
                      <MapPin className="w-3 h-3" />
                      {agent.counties?.join(", ") || agent.countries?.join(", ") || "Nairobi"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
              </div>

              <div className="flex flex-wrap gap-2">
                {(agent.assetClasses || []).map((ac) => (
                  <span key={ac} className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 bg-accent/5 text-accent border border-accent/20">
                    {assetClassLabels[ac] || ac}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
