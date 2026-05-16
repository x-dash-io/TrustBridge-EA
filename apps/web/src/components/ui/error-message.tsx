"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: "inline" | "block";
}

export function ErrorMessage({
  title = "System Alert",
  message,
  onRetry,
  className,
  variant = "block",
}: ErrorMessageProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-danger p-3 bg-danger/5 border border-danger/10", className)}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-[12px] font-mono font-bold uppercase tracking-tight">{message}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center bg-danger/5 border border-danger/20 min-h-[300px]",
      className
    )}>
      <div className="w-12 h-12 bg-danger/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-6 h-6 text-danger" />
      </div>
      <h3 className="font-display text-[20px] font-bold text-danger mb-2 tracking-tight">{title}</h3>
      <p className="text-[14px] text-fg/70 max-w-[400px] mb-8 font-sans leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="font-mono uppercase tracking-[0.2em] border-danger/20 text-danger hover:bg-danger/5"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reconnect System
        </Button>
      )}
    </div>
  );
}
