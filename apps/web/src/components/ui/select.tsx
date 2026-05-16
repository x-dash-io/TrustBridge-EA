"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onBlur?: (e: { target: unknown; type?: unknown }) => Promise<void | boolean> | void;
  name?: string;
  options: SelectOption[];
  kicker?: string;
  label?: string;
  error?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  [key: string]: unknown;
}

export function Select({
  value,
  onChange,
  onBlur,
  name,
  options,
  kicker,
  label,
  error,
  id,
  className,
  placeholder,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const handleSelect = useCallback((option: SelectOption) => {
    onChange?.({ target: { value: option.value, name } });
    setOpen(false);
    onBlur?.({ target: { value: option.value, name } });
  }, [onChange, name, onBlur]);

  return (
    <div className="space-y-2" ref={ref}>
      {(label || kicker) && (
        <label htmlFor={id} className="block">
          {kicker && <span className="kicker">{kicker}</span>}
          {label && <span className="text-[13px] font-bold">{label}</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors text-left font-mono tracking-wider",
            error ? "border-danger" : "border-border",
            open && "border-accent",
            className
          )}
        >
          {selected ? (
            selected.label
          ) : (
            <span className="text-muted">{placeholder || "Select..."}</span>
          )}
        </button>
        <div className={cn(
          "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-transform",
          open && "rotate-180",
          "text-muted"
        )}>
          <ChevronDown className="w-4 h-4" />
        </div>
        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-0 border border-border bg-surface max-h-[240px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt)}
                className={cn(
                  "w-full text-left px-4 py-3 text-[13px] font-mono tracking-wider transition-colors border-b border-border last:border-0",
                  opt.value === value
                    ? "bg-accent text-white"
                    : "text-fg hover:bg-accent/10"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{error}</p>
      )}
    </div>
  );
}
