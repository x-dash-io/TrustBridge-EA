"use client";

import { useWizardStore, type PartyDraft } from "@/stores/wizard-store";
import { 
  UserCircle, 
  ShieldCheck, 
  Scale, 
  Eye, 
  Trash2, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filterPhoneInput } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const partySchema = z.object({
  email: z.string().email("Invalid institutional email").or(z.literal("")),
  phone: z.string().min(10, "Invalid phone number").or(z.literal("")),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required for notification dispatch",
  path: ["email"]
});

function createParty(role: PartyDraft["role"]): PartyDraft {
  return { id: crypto.randomUUID(), role, email: "", phone: "" };
}

const roleConfig: { role: PartyDraft["role"]; label: string; required: boolean; icon: any }[] = [
  { role: "seller", label: "Counterparty (Seller)", required: true, icon: UserCircle },
  { role: "agent", label: "Verification Agent", required: false, icon: ShieldCheck },
  { role: "lawyer", label: "Legal Counsel", required: false, icon: Scale },
  { role: "observer", label: "Audit Observer", required: false, icon: Eye },
];

export function StepParties() {
  const { parties, setParties, markStepComplete, setStep } = useWizardStore();

  const handleChange = (id: string, field: "email" | "phone", value: string) => {
    const sanitized = field === "phone" ? filterPhoneInput(value) : value;
    setParties(parties.map((p) => (p.id === id ? { ...p, [field]: sanitized } : p)));
  };

  const toggleRole = (role: PartyDraft["role"]) => {
    if (parties.some((p) => p.role === role)) {
      setParties(parties.filter((p) => p.role !== role));
    } else {
      setParties([...parties, createParty(role)]);
    }
  };

  const seller = parties.find((p) => p.role === "seller");
  const sellerValid = seller && (seller.email.includes("@") || seller.phone.length >= 10);

  const handleNext = () => {
    if (sellerValid) {
      markStepComplete(3);
      setStep(4);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <div className="mb-10">
        <p className="kicker mb-2">Step 04 / 06</p>
        <h2 className="font-display text-[32px] font-bold tracking-tight">Party Manifest</h2>
      </div>

      <div className="space-y-6">
        {roleConfig.map((rc) => {
          const party = parties.find((p) => p.role === rc.role);
          const active = !!party;
          const Icon = rc.icon;
          
          return (
            <div
              key={rc.role}
              className={cn(
                "bg-surface border transition-all p-8",
                active ? "border-accent shadow-sm" : "border-border opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
              )}
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center transition-colors",
                    active ? "bg-accent text-white" : "bg-muted/10 text-muted"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-[16px] font-bold uppercase tracking-tight">
                      {rc.label}
                      {rc.required && <span className="text-danger ml-1">*</span>}
                    </h3>
                    <p className="text-[11px] font-mono text-muted uppercase">Notification Channel Required</p>
                  </div>
                </div>
                {!rc.required && (
                  <button
                    type="button"
                    onClick={() => toggleRole(rc.role)}
                    className={cn(
                      "text-[11px] font-mono font-bold uppercase tracking-widest px-3 py-1 border transition-all",
                      active ? "text-danger border-danger/20 hover:bg-danger/5" : "text-muted border-border hover:border-accent hover:text-accent"
                    )}
                  >
                    {active ? "Remove Entry" : "Append Party"}
                  </button>
                )}
              </div>

              {active && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block kicker flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={party.email}
                      onChange={(e) => handleChange(party.id, "email", e.target.value)}
                      placeholder="entity@institution.com"
                      className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block kicker flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted" />
                      Phone Dispatch
                    </label>
                    <input
                      type="tel"
                      value={party.phone}
                      onChange={(e) => handleChange(party.id, "phone", e.target.value)}
                      placeholder="+254..."
                      className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-accent tabular-nums"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-border">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!sellerValid}
          className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
        >
          Final Review
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
