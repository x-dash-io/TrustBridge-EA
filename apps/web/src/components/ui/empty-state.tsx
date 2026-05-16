"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center bg-surface border border-dashed border-border min-h-[400px]",
      className
    )}>
      <div className="w-16 h-16 bg-muted/5 flex items-center justify-center mb-6">
        {Icon ? <Icon className="w-8 h-8 text-muted" strokeWidth={1.5} /> : <div className="w-8 h-8 border-2 border-muted/20 rotate-45" />}
      </div>
      <h3 className="font-display text-[24px] font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-[14px] text-muted max-w-[320px] mb-8 leading-relaxed font-sans">
        {description}
      </p>
      {action && (
        <Link href={action.href}>
          <Button variant="primary" className="font-mono uppercase tracking-[0.2em] px-8">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
