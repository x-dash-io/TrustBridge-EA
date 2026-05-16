"use client";

import { useWizardStore, type Currency } from "@/stores/wizard-store";
import { parseAmount, calcFee, calcFeeRate, formatKES } from "@/lib/utils/currency";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const detailsSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters for legal clarity"),
  description: z.string().optional(),
  currency: z.string(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive numerical value",
  }),
  inspectionPeriodDays: z.number().min(1, "Inspection period is required"),
  terms: z.string().optional(),
});

type DetailsFormValues = z.infer<typeof detailsSchema>;

const currencies: { value: Currency; label: string }[] = [
  { value: "KES", label: "KES — Kenyan Shilling" },
  { value: "UGX", label: "UGX — Ugandan Shilling" },
  { value: "TZS", label: "TZS — Tanzanian Shilling" },
  { value: "RWF", label: "RWF — Rwandan Franc" },
  { value: "USD", label: "USD — US Dollar" },
];

const inspectionOptions = [3, 5, 7, 14, 30];

export function StepDetails() {
  const {
    title, setTitle,
    description, setDescription,
    currency, setCurrency,
    amount, setAmount,
    inspectionPeriodDays, setInspectionPeriodDays,
    terms, setTerms,
    includeDataRoom, setIncludeDataRoom,
    assetClass,
    markStepComplete, setStep,
  } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      title,
      description,
      currency,
      amount,
      inspectionPeriodDays,
      terms,
    },
  });

  const watchCurrency = watch("currency");
  const watchInspection = watch("inspectionPeriodDays");
  const watchAmount = watch("amount");
  const numAmount = parseAmount(watchAmount || "0");
  const fee = calcFee(numAmount);
  const feeRate = calcFeeRate(numAmount);

  const onSubmit = (values: DetailsFormValues) => {
    setTitle(values.title);
    setDescription(values.description || "");
    setCurrency(values.currency as Currency);
    setAmount(values.amount);
    setInspectionPeriodDays(values.inspectionPeriodDays);
    setTerms(values.terms || "");
    
    markStepComplete(1);
    setStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <div className="mb-10">
        <p className="kicker mb-2">Step 02 / 06</p>
        <h2 className="font-display text-[32px] font-bold tracking-tight">Transaction Parameters</h2>
      </div>

      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <label className="block kicker">Institutional Title *</label>
          <input
            {...register("title")}
            type="text"
            placeholder="e.g. Acquisition of Digital IP: scale.ai"
            className={cn(
              "w-full bg-surface border p-4 text-[14px] outline-none transition-colors",
              errors.title ? "border-danger" : "border-border focus:border-accent"
            )}
          />
          {errors.title && (
            <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{errors.title.message}</p>
          )}
        </div>

        {/* Amount & Currency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Select
              kicker="Base Currency"
              options={currencies}
              value={watchCurrency}
              {...register("currency")}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block kicker">Escrow Amount *</label>
            <div className="relative">
              <input
                {...register("amount")}
                type="text"
                placeholder="0.00"
                className={cn(
                  "w-full bg-surface border p-4 text-[14px] outline-none transition-colors tabular-nums",
                  errors.amount ? "border-danger" : "border-border focus:border-accent"
                )}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-mono font-bold text-muted uppercase">
                {watch("currency")}
              </div>
            </div>
            {errors.amount && (
              <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{errors.amount.message}</p>
            )}
          </div>
        </div>

        {/* Fee Audit Card */}
        {numAmount > 0 && (
          <div className="bg-accent text-white p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-white/80" />
              <p className="kicker text-white/80">Institutional Fee Audit</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[12px] font-mono text-white/60 mb-1">Processing Rate</p>
                <p className="text-[16px] font-bold tabular-nums">{feeRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-mono text-white/60 mb-1">Computed Service Fee</p>
                <p className="text-[16px] font-bold tabular-nums">
                  {formatKES(fee)}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/20 flex justify-between items-center">
              <p className="font-display text-[14px] font-bold">Total Settlement Amount</p>
              <p className="text-[24px] font-bold tabular-nums tracking-tighter">
                {formatKES(numAmount + fee)}
              </p>
            </div>
          </div>
        )}

        {/* Inspection Period */}
        <div className="space-y-2">
          <Select
            kicker="Inspection Period"
            options={inspectionOptions.map((d) => ({ value: String(d), label: `${d} Business Days` }))}
            value={String(watchInspection ?? "")}
            {...register("inspectionPeriodDays", { valueAsNumber: true })}
          />
          <p className="text-[12px] text-muted font-sans italic">
            The duration the buyer has to verify deliverables before funds are released.
          </p>
        </div>

        {/* Data Room Toggle */}
        {assetClass === "legal_data" && (
          <div className="p-6 border border-border bg-surface flex items-center justify-between group cursor-pointer" onClick={() => setIncludeDataRoom(!includeDataRoom)}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 flex items-center justify-center transition-colors",
                includeDataRoom ? "bg-accent text-white" : "bg-muted/10 text-muted"
              )}>
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold">Enable Secure Data Room</p>
                <p className="text-[12px] text-muted">Include NDA-gated document vault for this transaction.</p>
              </div>
            </div>
            <div className={cn(
              "w-12 h-6 border-2 transition-all relative",
              includeDataRoom ? "border-accent bg-accent" : "border-border bg-muted/10"
            )}>
              <div className={cn(
                "absolute top-1 w-3 h-3 transition-all",
                includeDataRoom ? "right-1 bg-white" : "left-1 bg-muted-foreground"
              )} />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-border">
        <button
          type="button"
          onClick={() => setStep(0)}
          className="flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <Button
          variant="primary"
          size="lg"
          type="submit"
          className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
        >
          Structure Milestones
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
