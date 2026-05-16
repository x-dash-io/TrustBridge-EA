"use client";

import { useEffect, useState } from "react";
import { Users, ShieldQuestion, Scale, ArrowLeftRight, Loader2 } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  pendingKyc: number;
  openDisputes: number;
  totalTransactions: number;
  totalVolume: string;
}

export function AdminStatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted py-12">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-[12px] font-mono">Loading metrics...</span>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users },
    { label: "Pending KYC", value: stats.pendingKyc.toLocaleString(), icon: ShieldQuestion },
    { label: "Open Disputes", value: stats.openDisputes.toLocaleString(), icon: Scale },
    { label: "Transactions", value: stats.totalTransactions.toLocaleString(), icon: ArrowLeftRight },
  ];

  const volume = Number.parseFloat(stats.totalVolume);
  const formattedVolume = volume >= 1_000_000
    ? `KES ${(volume / 1_000_000).toFixed(1)}M`
    : `KES ${volume.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-surface border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="kicker">{card.label}</p>
                <Icon className="w-5 h-5 text-muted" />
              </div>
              <p className="font-display text-[28px] font-bold tabular-nums tracking-tight">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-surface border border-border p-6">
        <p className="kicker mb-2">Total Escrow Volume (Non-Draft)</p>
        <p className="font-display text-[32px] font-bold tabular-nums tracking-tight">
          {formattedVolume}
        </p>
      </div>
    </div>
  );
}
