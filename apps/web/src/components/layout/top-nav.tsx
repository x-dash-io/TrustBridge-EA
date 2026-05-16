"use client";

import { usePathname } from "next/navigation";
import { Search, Plus, Bell, ChevronRight, X, ArrowRight, Clock, CheckCircle2, AlertTriangle, DollarSign, Shield, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openCommandCentre } from "@/components/layout/command-centre";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof Bell> = {
  transaction_created: FileText,
  milestone_delivered: Shield,
  milestone_accepted: CheckCircle2,
  payment_received: DollarSign,
  dispute_opened: AlertTriangle,
  dispute_resolved: CheckCircle2,
  message: MessageSquare,
  kyc_verified: CheckCircle2,
  default: Bell,
};

export function TopNav() {
  const pathname = usePathname();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative p-2 text-muted hover:text-accent transition-colors"
            >
              <Bell className="w-5 h-5" />
              <BellDot />
            </button>

            {bellOpen && <NotificationDropdown onClose={() => setBellOpen(false)} />}
          </div>
          
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

function BellDot() {
  const { data } = useQuery<{ unreadCount: number }>({
    queryKey: ["notification-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=1");
      if (!res.ok) return { unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (!data?.unreadCount) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white flex items-center justify-center text-[8px] font-mono font-bold">
      {data.unreadCount > 9 ? "9+" : data.unreadCount}
    </span>
  );
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  transactionId: string | null;
  createdAt: string | null;
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data } = useQuery<{ notifications: NotificationItem[]; unreadCount: number }>({
    queryKey: ["notifications-bell"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=5");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-bell"] });
    },
  });

  const notifications = data?.notifications || [];

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-surface border border-border shadow-sm z-50">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <p className="kicker">Notifications</p>
        <Link href="/notifications" onClick={onClose} className="text-[10px] font-mono uppercase tracking-widest text-accent hover:underline">
          View All
        </Link>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-6 h-6 text-muted mx-auto mb-3" />
            <p className="text-[12px] text-muted font-mono">No new notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = typeIcons[n.type] || typeIcons.default;
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 p-4 border-b border-border last:border-0 hover:bg-muted/5 transition-colors cursor-pointer",
                  !n.isRead && "bg-accent/[0.02]"
                )}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n.id);
                  onClose();
                }}
              >
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center flex-shrink-0",
                  n.isRead ? "bg-muted/10 text-muted" : "bg-accent/10 text-accent"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[12px]", n.isRead ? "font-medium text-fg" : "font-bold text-fg")}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-muted truncate mt-0.5">{n.body}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-2.5 h-2.5 text-muted" />
                    <span className="text-[9px] font-mono text-muted uppercase">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-accent flex-shrink-0 mt-1" />}
              </div>
            );
          })
        )}
      </div>

      <Link
        href="/notifications"
        onClick={onClose}
        className="flex items-center justify-center gap-2 p-4 border-t border-border text-[11px] font-mono uppercase tracking-widest text-muted hover:text-accent transition-colors"
      >
        Open Notification Center
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
