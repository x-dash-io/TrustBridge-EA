"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-muted/10", className)} />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full border border-border bg-white overflow-hidden">
      <div className="h-[60px] bg-muted/5 border-b border-border flex items-center px-8">
        <Skeleton className="h-4 w-[200px]" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[80px] border-b border-border last:border-0 flex items-center px-8 gap-8">
          <Skeleton className="h-8 w-8" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-3 w-[20%]" />
          </div>
          <Skeleton className="h-6 w-[100px]" />
          <Skeleton className="h-8 w-[120px]" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-border p-8 bg-surface space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-6 w-[180px]" />
        </div>
        <Skeleton className="h-6 w-[60px]" />
      </div>
      <Skeleton className="h-[120px] w-full" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[80%]" />
        <Skeleton className="h-3 w-[90%]" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="space-y-4 mb-12">
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-12 w-[400px]" />
      <Skeleton className="h-4 w-[600px]" />
    </div>
  );
}
