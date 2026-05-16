"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, ArrowLeftRight, ShieldCheck, Scale, Bell, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  label: string;
  href: string;
  icon: React.ElementType;
  keywords: string[];
}

const commands: CommandItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "overview", "stats"] },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight, keywords: ["escrow", "deals", "list"] },
  { label: "New Transaction", href: "/transactions/new", icon: Plus, keywords: ["create", "escrow", "new deal", "wizard"] },
  { label: "Identity & KYC", href: "/kyc", icon: ShieldCheck, keywords: ["verification", "kyc", "identity", "tier"] },
  { label: "Disputes", href: "/disputes", icon: Scale, keywords: ["resolution", "mediation", "conflict"] },
  { label: "Notifications", href: "/notifications", icon: Bell, keywords: ["alerts", "bell", "updates"] },
  { label: "Settings", href: "/settings", icon: Settings, keywords: ["preferences", "profile", "config"] },
];

export function openCommandCentre() {
  const event = new CustomEvent("opencode-command-centre");
  window.dispatchEvent(event);
}

export function CommandCentre() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);
  const router = useRouter();

  const handleOpen = useCallback(() => {
    openRef.current = true;
    setOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    setQuery("");
  }, []);

  // Listen for keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (openRef.current) {
          handleClose();
        } else {
          handleOpen();
        }
      }
      if (e.key === "Escape" && openRef.current) {
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleOpen, handleClose]);

  // Listen for custom event from TopNav button
  useEffect(() => {
    const onCustomOpen = () => handleOpen();
    window.addEventListener("opencode-command-centre", onCustomOpen);
    return () => window.removeEventListener("opencode-command-centre", onCustomOpen);
  }, [handleOpen]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query.trim()
    ? commands.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.keywords.some((k) => k.includes(q))
        );
      })
    : commands;

  const navigate = (href: string) => {
    handleClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].href);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-50"
        onClick={handleClose}
      />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-[560px] z-50 bg-surface border border-accent shadow-none">
        <div className="flex items-center border-b border-border px-6">
          <Search className="w-4 h-4 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, actions, and more..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-5 text-[14px] text-fg placeholder-muted"
          />
          <kbd className="text-[10px] font-mono text-muted border border-border px-2 py-1 flex-shrink-0">
            ESC
          </kbd>
        </div>

        <div className="p-3 max-h-[320px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-muted font-mono">No results found</p>
            </div>
          ) : (
            <ul className="space-y-1 list-none">
              {filtered.map((cmd, i) => {
                const Icon = cmd.icon;
                return (
                  <li key={cmd.href}>
                    <button
                      onClick={() => navigate(cmd.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-[13px] text-left transition-colors rounded-none",
                        i === selectedIndex
                          ? "bg-accent text-white"
                          : "text-fg hover:bg-muted/5"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", i === selectedIndex ? "text-white" : "text-muted")} />
                      <span className="font-medium">{cmd.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-[10px] font-mono text-muted px-1">
            <span><kbd className="border border-border px-1">↑</kbd> <kbd className="border border-border px-1">↓</kbd> navigate</span>
            <span><kbd className="border border-border px-2">↵</kbd> select</span>
            <span><kbd className="border border-border px-2">Esc</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}
