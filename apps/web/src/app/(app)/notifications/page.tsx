"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Clock, ArrowRight, MessageSquare, AlertTriangle, DollarSign, Shield, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  transactionId: string | null;
  createdAt: string | null;
}

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

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) throw new Error("Failed to mark all read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to mark as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto py-12 px-4">
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[800px] mx-auto py-12 px-4">
        <ErrorMessage message="Failed to synchronize notification registry." />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-12">
        <div>
          <Kicker>Messaging Node</Kicker>
          <h1 className="font-display text-[42px] font-bold tracking-tight italic">
            Notification Center
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accent"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              {markAllRead.isPending ? "Processing..." : "Mark All Read"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-surface border border-border">
            <EmptyState
              icon={Bell}
              title="All Clear"
              description="No notifications at this time. You will be alerted of any transaction activity here."
            />
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || typeIcons.default;

            return (
              <div
                key={notification.id}
                className={cn(
                  "bg-surface border border-border p-6 flex items-start gap-6 transition-all hover:border-accent",
                  !notification.isRead && "border-l-accent border-l-4"
                )}
              >
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center flex-shrink-0",
                  notification.isRead ? "bg-muted/10 text-muted" : "bg-accent/10 text-accent"
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={cn(
                      "text-[15px]",
                      notification.isRead ? "font-medium" : "font-bold"
                    )}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <button
                        onClick={() => markRead.mutate(notification.id)}
                        className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-accent transition-colors flex-shrink-0"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                  <p className="text-[13px] text-muted font-sans leading-relaxed mb-3">
                    {notification.body}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-muted uppercase">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Pending"}
                    </span>
                    {notification.transactionId && (
                      <Link
                        href={`/transactions/${notification.transactionId}`}
                        className="flex items-center gap-1 text-accent hover:underline"
                      >
                        View Transaction
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
