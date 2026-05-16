"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function parseInput(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function formatDisplay(year: number, month: number, day: number): string {
  return `${String(day).padStart(2, "0")} ${MONTHS[month]} ${year}`;
}

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  kicker?: string;
  label?: string;
  error?: string;
  id?: string;
}

export function DatePicker({ value, onChange, kicker, label, error, id }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = parseInput(value || "");
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = useCallback((day: number) => {
    const formatted = formatDate(viewYear, viewMonth, day);
    onChange?.(formatted);
    setOpen(false);
  }, [viewYear, viewMonth, onChange]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(v => v - 1); setViewMonth(11); }
    else setViewMonth(v => v - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(v => v + 1); setViewMonth(0); }
    else setViewMonth(v => v + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedDay = parsed ? parsed.getDate() : null;
  const selectedMonth = parsed ? parsed.getMonth() : null;
  const selectedYear = parsed ? parsed.getFullYear() : null;

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
          onClick={() => setOpen(o => !o)}
          className={cn(
            "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors text-left font-mono tracking-wider",
            error ? "border-danger" : "border-border",
            open && "border-accent"
          )}
        >
          {parsed ? formatDisplay(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) : (
            <span className="text-muted">DD MMM YYYY</span>
          )}
        </button>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
          <CalendarDays className="w-4 h-4" />
        </div>
        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-0 border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="p-1 text-muted hover:text-accent transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[13px] font-bold tracking-wider uppercase">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button type="button" onClick={nextMonth} className="p-1 text-muted hover:text-accent transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-px">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={`dh-${i}`} className="text-center text-[10px] font-mono uppercase tracking-widest text-muted py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(viewYear, viewMonth, day);
                const isSelected = day === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;
                const isToday = dateStr === todayStr;
                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleSelect(day)}
                    className={cn(
                      "text-center py-1.5 text-[12px] font-mono transition-colors hover:bg-accent/10",
                      isSelected ? "bg-accent text-white hover:bg-accent" : "",
                      isToday && !isSelected ? "font-bold underline underline-offset-2 decoration-accent decoration-2" : "",
                      !isSelected && !isToday ? "text-fg" : ""
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{error}</p>
      )}
    </div>
  );
}
