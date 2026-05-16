"use client";

import { useWizardStore, type MilestoneDraft } from "@/stores/wizard-store";
import { parseAmount, formatKES } from "@/lib/utils/currency";
import { Plus, Trash2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function createMilestone(overrides?: Partial<MilestoneDraft>): MilestoneDraft {
  return {
    id: crypto.randomUUID(),
    title: "Final Delivery",
    amount: "",
    dueDate: "",
    description: "",
    ...overrides,
  };
}

export function StepMilestones() {
  const { milestones, setMilestones, amount, markStepComplete, setStep } = useWizardStore();
  const totalAmount = parseAmount(amount);
  const items = milestones.length > 0 ? milestones : [createMilestone()];

  const sumAmounts = items.reduce((s, m) => s + parseAmount(m.amount), 0);
  const remaining = totalAmount - sumAmounts;
  const amountsMatch = Math.abs(remaining) < 0.01;
  const canProceed = items.every((m) => m.title && parseAmount(m.amount) > 0) && amountsMatch;

  const handleChange = (id: string, field: keyof MilestoneDraft, value: string) => {
    setMilestones(
      items.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const addMilestone = () => {
    setMilestones([...items, createMilestone({
      title: `Phase ${items.length + 1}`,
      amount: remaining > 0 ? remaining.toString() : ""
    })]);
  };

  const removeMilestone = (id: string) => {
    if (items.length <= 1) return;
    setMilestones(items.filter((m) => m.id !== id));
  };

  const handleNext = () => {
    if (canProceed) {
      markStepComplete(2);
      setStep(3);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <div className="mb-10">
        <p className="kicker mb-2">Step 03 / 06</p>
        <h2 className="font-display text-[32px] font-bold tracking-tight">Milestone Structure</h2>
      </div>

      {/* Allocation Auditor */}
      <div className={cn(
        "sticky top-[80px] z-20 p-6 border mb-10 transition-colors flex justify-between items-center",
        amountsMatch ? "bg-success/5 border-success/20" : "bg-bg border-border shadow-sm"
      )}>
        <div>
          <p className="kicker text-muted mb-1">Total Allocated</p>
          <p className="text-[20px] font-bold tabular-nums">{formatKES(sumAmounts)}</p>
        </div>
        <div className="text-right">
          <p className="kicker text-muted mb-1">Unallocated Balance</p>
          <p className={cn(
            "text-[20px] font-bold tabular-nums",
            remaining > 0 ? "text-accent" : remaining < 0 ? "text-danger" : "text-success"
          )}>
            {formatKES(remaining)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((m, i) => (
          <div key={m.id} className="group bg-surface border border-border p-8 relative transition-all hover:border-muted-foreground/30">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-accent text-white flex items-center justify-center font-mono text-[10px] font-bold">
                  0{i + 1}
                </div>
                <h3 className="font-display text-[16px] font-bold uppercase tracking-tight">Milestone Entity</h3>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(m.id)}
                  className="text-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="block kicker">Deliverable Title</label>
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => handleChange(m.id, "title", e.target.value)}
                  className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-accent"
                  placeholder="e.g. Completion of Domain Transfer"
                />
              </div>

              <div className="space-y-2">
                <label className="block kicker">Payout Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    value={m.amount}
                    onChange={(e) => handleChange(m.id, "amount", e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-accent tabular-nums"
                    placeholder="0.00"
                  />
                  {totalAmount > 0 && parseAmount(m.amount) > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-muted bg-bg px-2">
                      {((parseAmount(m.amount) / totalAmount) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block kicker">Target Delivery Date</label>
                <input
                  type="date"
                  value={m.dueDate}
                  onChange={(e) => handleChange(m.id, "dueDate", e.target.value)}
                  className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-accent font-mono uppercase text-[12px]"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block kicker">Verification Criteria</label>
                <textarea
                  value={m.description}
                  onChange={(e) => handleChange(m.id, "description", e.target.value)}
                  rows={2}
                  className="w-full bg-bg border border-border p-3 text-[14px] outline-none focus:border-accent resize-none"
                  placeholder="Describe the objective evidence required for acceptance..."
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addMilestone}
          className="w-full py-4 border-2 border-dashed border-border text-muted hover:border-accent hover:text-accent transition-all font-mono text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Append Milestone Stage
        </button>
      </div>

      {!amountsMatch && (
        <div className="mt-8 p-4 bg-danger/5 border border-danger/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger" />
          <p className="text-[12px] text-danger font-mono font-bold uppercase tracking-tight">
            Error: Allocated total must match transaction value ({formatKES(totalAmount)})
          </p>
        </div>
      )}

      {amountsMatch && canProceed && (
        <div className="mt-8 p-4 bg-success/5 border border-success/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <p className="text-[12px] text-success font-mono font-bold uppercase tracking-tight">
            Audit Passed: All funds successfully allocated
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-border">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!canProceed}
          className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
        >
          Verify Parties
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
