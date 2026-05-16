import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  kicker?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, kicker, options, className, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {(label || kicker) && (
          <label htmlFor={id} className="block">
            {kicker && <span className="kicker">{kicker}</span>}
            {label && <span className="text-[13px] font-bold">{label}</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-bg border px-5 py-4 text-[14px] outline-none transition-colors appearance-none font-sans pr-12",
              error ? "border-danger focus:border-danger" : "border-border focus:border-accent"
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
