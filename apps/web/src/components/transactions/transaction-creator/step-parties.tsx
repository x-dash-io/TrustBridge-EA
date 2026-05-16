"use client";

import { useEffect, useState } from "react";
import { useWizardStore, type PartyDraft } from "@/stores/wizard-store";
import { createClient } from "@/lib/supabase/client";
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
  Phone,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filterPhoneInput } from "@/lib/validation";

function createParty(role: PartyDraft["role"]): PartyDraft {
  return { id: crypto.randomUUID(), role, name: "", email: "", phone: "" };
}

const roleConfig: { role: PartyDraft["role"]; label: string; required: boolean; icon: any }[] = [
  { role: "seller", label: "Counterparty (Seller)", required: true, icon: UserCircle },
  { role: "agent", label: "Verification Agent", required: false, icon: ShieldCheck },
  { role: "lawyer", label: "Legal Counsel", required: false, icon: Scale },
  { role: "observer", label: "Audit Observer", required: false, icon: Eye },
];

export function StepParties() {
  const { parties, setParties, markStepComplete, setStep, creatorRole, setCreatorRole } = useWizardStore();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata ?? {};
      const email = data.user?.email ?? "";
      setUserEmail(meta.email || email);
      setUserPhone(meta.phone || "");
      const name = meta.name || meta.full_name || meta.legal_name || "";
      setUserName(name);

      if (!parties.some((p) => p.role === creatorRole)) {
        const selfParty: PartyDraft = {
          id: "creator-self",
          role: creatorRole,
          name: name || "You",
          email: meta.email || email,
          phone: meta.phone || "",
        };
        // Remove old self if it exists from previous toggle
        const otherParties = parties.filter((p) => p.id !== "creator-self");
        setParties([selfParty, ...otherParties]);
      }
    }
    loadUser();
  }, [creatorRole]); // Re-run if creatorRole changes

  const selfParty = parties.find((p) => p.id === "creator-self" && p.role === creatorRole);
  const counterpartyRole = creatorRole === "buyer" ? "seller" : "buyer";

  const handleChange = (id: string, field: "name" | "email" | "phone", value: string) => {
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

  const counterparty = parties.find((p) => p.role === counterpartyRole);
  const counterpartyValid = counterparty && counterparty.name && (counterparty.email.includes("@") || counterparty.phone.length >= 10);

  const handleNext = () => {
    if (counterpartyValid) {
      markStepComplete(3);
      setStep(4);
    }
  };

  const dynamicRoleConfig = [
    { role: counterpartyRole as PartyDraft["role"], label: `Counterparty (${counterpartyRole === "seller" ? "Seller" : "Buyer"})`, required: true, icon: UserCircle },
    { role: "agent" as PartyDraft["role"], label: "Verification Agent", required: false, icon: ShieldCheck },
    { role: "lawyer" as PartyDraft["role"], label: "Legal Counsel", required: false, icon: Scale },
    { role: "observer" as PartyDraft["role"], label: "Audit Observer", required: false, icon: Eye },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <div className="mb-10">
        <p className="kicker mb-2">Step 04 / 06</p>
        <h2 className="font-display text-[32px] font-bold tracking-tight">Party Manifest</h2>
        <p className="text-[13px] text-muted font-sans mt-2 max-w-2xl">
          Register all legal entities participating in this escrow. The buyer is pre-populated from your account — verify and complete the counterparty details.
        </p>
      </div>

      {/* Creator (You) — always present */}
      {selfParty && (
        <div className="bg-surface border border-accent p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent text-white flex items-center justify-center">
                <UserCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-[16px] font-bold uppercase tracking-tight">
                  {creatorRole === "buyer" ? "Buyer" : "Seller"} (You)
                </h3>
                <p className="text-[11px] font-mono text-muted uppercase">Initiating Party</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block kicker flex items-center gap-2">
                <Building2 className="w-3 h-3 text-muted" />
                Entity Name
              </label>
              <input
                type="text"
                value={selfParty.name}
                onChange={(e) => handleChange("creator-self", "name", e.target.value)}
                placeholder="Your Institution / Full Name"
                className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="block kicker flex items-center gap-2">
                <Mail className="w-3 h-3 text-muted" />
                Email Address
              </label>
              <input
                type="email"
                value={selfParty.email}
                onChange={(e) => handleChange("creator-self", "email", e.target.value)}
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
                value={selfParty.phone}
                onChange={(e) => handleChange("creator-self", "phone", e.target.value)}
                placeholder="+254..."
                className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-accent tabular-nums"
              />
            </div>
          </div>
        </div>
      )}

      {/* Other parties */}
      <div className="space-y-6">
        {dynamicRoleConfig.map((rc) => {
          const party = parties.find((p) => p.role === rc.role);
          const active = !!party;
          const Icon = rc.icon;

          return (
            <div
              key={rc.role}
              className={cn(
                "bg-surface border transition-all p-8",
                active ? "border-accent" : "border-border opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
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
                      active
                        ? "text-danger border-danger/20 hover:bg-danger/5"
                        : "text-muted border-border hover:border-accent hover:text-accent"
                    )}
                  >
                    {active ? "Remove Entry" : "Append Party"}
                  </button>
                )}
              </div>

              {active && party && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block kicker flex items-center gap-2">
                      <Building2 className="w-3 h-3 text-muted" />
                      Entity Name
                    </label>
                    <input
                      type="text"
                      value={party.name}
                      onChange={(e) => handleChange(party.id, "name", e.target.value)}
                      placeholder={rc.role === counterpartyRole ? "Counterparty Institution" : "Entity Name"}
                      className={cn(
                        "w-full bg-bg border p-3 text-[14px] outline-none focus:border-accent",
                        rc.role === counterpartyRole && !party.name ? "border-warning/50" : "border-border"
                      )}
                    />
                  </div>
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
          disabled={!counterpartyValid}
          className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
        >
          Final Review
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
