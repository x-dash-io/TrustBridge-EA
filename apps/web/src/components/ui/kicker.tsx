import { type ReactNode } from "react";

interface KickerProps {
  children: ReactNode;
  className?: string;
  as?: "span" | "p" | "div";
}

export function Kicker({ children, className = "", as: Tag = "p" }: KickerProps) {
  return (
    <Tag className={`kicker ${className}`}>
      {children}
    </Tag>
  );
}
