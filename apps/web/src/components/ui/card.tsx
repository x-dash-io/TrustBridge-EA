import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "bordered" | "accent";
}

const paddingStyles = {
  sm: "p-5",
  md: "p-8",
  lg: "p-10",
};

const variantStyles = {
  default: "bg-surface border border-border",
  bordered: "bg-surface border-2 border-accent",
  accent: "bg-accent/5 border border-accent/20",
};

export function Card({ children, className = "", padding = "lg", variant = "default" }: CardProps) {
  return (
    <div
      className={cn(
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
