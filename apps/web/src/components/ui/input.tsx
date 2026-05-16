import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  kicker?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, kicker, className, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {(label || kicker) && (
          <label htmlFor={id} className="block">
            {kicker && <span className="kicker">{kicker}</span>}
            {label && <span className="text-[13px] font-bold">{label}</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
            error ? "border-danger focus:border-danger" : "border-border focus:border-accent",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
