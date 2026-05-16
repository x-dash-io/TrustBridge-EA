"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Star, Briefcase, Shield, Calendar, Phone, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorMessage } from "@/components/ui/error-message";

interface Agent {
  id: string;
  displayName: string;
  counties: string[] | null;
  assetClasses: string[] | null;
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean | null;
  createdAt: string | null;
}

const assetClassLabels: Record<string, string> = {
  digital: "Digital Assets",
  physical: "Physical Goods",
  property: "Real Property",
  legal_data: "Legal Data",
  business: "Business",
  services: "Services",
};

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: agent, isLoading, error } = useQuery<Agent>({
    queryKey: ["agent", id],
    queryFn: async () => {
      const res = await fetch(`/api/agents`);
      const all: Agent[] = await res.json();
      const found = all.find((a) => a.id === id);
      if (!found) throw new Error("Agent not found");
      return found;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto py-12 px-4">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="max-w-[800px] mx-auto py-12 px-4">
        <ErrorMessage message="Verification agent not found." />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto py-12 px-4">
      <Link
        href="/agents"
        className="inline-flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Agent Directory
      </Link>

      <div className="bg-surface border border-border p-10 mb-10">
        <div className="flex items-start justify-between gap-8">
          <div>
            <div className="w-16 h-16 bg-accent/10 flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-display text-[36px] font-bold tracking-tight mb-2">{agent.displayName}</h1>
            <div className="flex items-center gap-4 text-[13px] text-muted font-mono">
              {agent.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  {agent.rating} ({agent.reviewCount || 0} reviews)
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {agent.counties?.join(", ") || "Nairobi"}
              </span>
            </div>
          </div>

          <Button variant="primary" className="font-mono uppercase tracking-[0.2em] flex-shrink-0">
            Assign to Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border mb-10">
        <div className="bg-surface p-8">
          <h2 className="kicker mb-4">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {(agent.assetClasses || []).map((ac) => (
              <span key={ac} className="text-[11px] font-mono font-bold uppercase px-4 py-2 bg-accent/5 text-accent border border-accent/20">
                {assetClassLabels[ac] || ac}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-surface p-8">
          <h2 className="kicker mb-4">Availability</h2>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-success" />
            <span className="text-[14px] font-bold">Available for Assignments</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border p-8 text-center">
        <Shield className="w-10 h-10 text-muted mx-auto mb-4" />
        <h2 className="font-display text-[20px] font-bold mb-2">Request Verification Agent</h2>
        <p className="text-[13px] text-muted font-sans max-w-md mx-auto mb-6">
          Assign this agent to perform physical inspection and verification for your transaction.
        </p>
        <Link href="/transactions">
          <Button variant="primary" className="font-mono uppercase tracking-[0.2em]">
            Select Transaction
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
