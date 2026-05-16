"use client";

import { Milestone } from "@/lib/db/schema";
import { TransactionStatusBadge } from "./status-badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

interface MilestoneCardProps {
  milestone: Milestone;
  isSeller: boolean;
  isBuyer: boolean;
  isCurrent: boolean;
  isCompleted: boolean;
  isLocked: boolean;
}

export function MilestoneCard({
  milestone,
  isSeller,
  isBuyer,
  isCurrent,
  isCompleted,
  isLocked,
}: MilestoneCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      console.log("Files dropped:", acceptedFiles);
      // Logic for upload will go here
    },
    disabled: !isCurrent || !isSeller || milestone.status === "delivered",
  });

  const formattedAmount = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(Number(milestone.amount)).replace("KES", "KSh");

  return (
    <div className={cn(
      "relative pl-12 pb-12 last:pb-0",
      isLocked && "opacity-50"
    )}>
      {/* Timeline Connector */}
      <div className={cn(
        "absolute left-[5px] top-2 bottom-0 w-[1px] bg-border",
        isCompleted && "bg-accent"
      )} />
      
      {/* Timeline Dot */}
      <div className={cn(
        "absolute left-0 top-2 w-[11px] h-[11px] border border-accent bg-bg flex items-center justify-center z-10",
        isCompleted && "bg-accent text-bg",
        isCurrent && "border-accent shadow-[0_0_0_4px_var(--color-bg)]"
      )}>
        {isCompleted && (
          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className={cn(
        "bg-surface border border-border p-6 md:p-8 transition-all",
        isCurrent && "border-accent ring-1 ring-accent/5",
        isCompleted && "border-border/60"
      )}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-[24px] font-bold leading-none text-muted/30">
                {(milestone.orderIndex + 1).toString().padStart(2, "0")}
              </span>
              <h3 className="font-display text-[20px] font-bold leading-tight">
                {milestone.title}
              </h3>
              <TransactionStatusBadge status={milestone.status || "pending"} />
            </div>
            
            <p className="text-[14px] text-muted mb-6 max-w-[500px]">
              {milestone.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="kicker mb-1">Amount</p>
                <p className="text-[16px] font-bold tabular-nums">{formattedAmount}</p>
                <p className="text-[11px] text-muted">{milestone.percentage}% of total</p>
              </div>
              <div>
                <p className="kicker mb-1">Due Date</p>
                <p className="text-[14px] font-medium">
                  {milestone.dueDate ? format(new Date(milestone.dueDate), "dd MMM yyyy") : "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="kicker mb-1">Action Required</p>
                <p className="text-[13px] font-medium italic">
                  {milestone.status === "pending" && "Awaiting seller delivery"}
                  {milestone.status === "delivered" && "Awaiting buyer approval"}
                  {milestone.status === "accepted" && "Funds released"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SELLER ACTIONS */}
        {isCurrent && isSeller && milestone.status === "pending" && (
          <div className="mt-10 pt-8 border-t border-border">
            <div {...getRootProps()} className={cn(
              "border border-dashed border-border p-8 text-center cursor-pointer hover:border-accent transition-colors mb-6",
              isDragActive && "border-accent bg-accent/5"
            )}>
              <input {...getInputProps()} />
              <p className="kicker mb-2">Deliverables</p>
              <p className="text-[13px] text-muted font-sans">
                {isDragActive ? "Drop files here" : "Click or drag files to upload deliverables"}
              </p>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" size="lg" className="font-mono uppercase tracking-[0.2em] px-10">
                Mark as Delivered
              </Button>
            </div>
          </div>
        )}

        {/* BUYER ACTIONS */}
        {isCurrent && isBuyer && milestone.status === "delivered" && (
          <div className="mt-10 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="kicker mb-2">Inspection Period</p>
                <p className="text-[18px] font-bold tabular-nums">3 days, 4 hours remaining</p>
              </div>
              <div className="flex gap-4">
                <Button variant="danger" size="md" className="font-mono uppercase tracking-[0.1em] px-8">
                  Open Dispute
                </Button>
                <Button variant="primary" size="lg" className="bg-accent hover:bg-accent/90 font-mono uppercase tracking-[0.2em] px-10">
                  Accept & Release {formattedAmount}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
