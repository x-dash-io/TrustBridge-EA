"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/kyc/upload-zone";
import { ErrorMessage } from "@/components/ui/error-message";
import { ArrowLeft, ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tier3Schema = z.object({
  occupation: z.string().min(3, "Occupation is required"),
  sourceOfFunds: z.string().min(3, "Source of funds declaration is required"),
  annualIncome: z.string().min(1, "Annual income range is required"),
  politicallyExposed: z.enum(["yes", "no"], { required_error: "This declaration is required" }),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to proceed" }) }),
});

type Tier3FormValues = z.infer<typeof tier3Schema>;

const incomeRanges = [
  { value: "0-500k", label: "KSh 0 – 500,000" },
  { value: "500k-2m", label: "KSh 500,000 – 2,000,000" },
  { value: "2m-10m", label: "KSh 2,000,000 – 10,000,000" },
  { value: "10m-50m", label: "KSh 10,000,000 – 50,000,000" },
  { value: "50m+", label: "KSh 50,000,000+" },
];

export default function Tier3KycFlow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [supportingDoc, setSupportingDoc] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Tier3FormValues>({
    resolver: zodResolver(tier3Schema),
    defaultValues: { politicallyExposed: "no" },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    // Tier 3 KYC submission will call the API
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="bg-surface border border-border p-16 text-center">
          <div className="w-16 h-16 bg-success/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display text-[32px] font-bold mb-4">Enhanced Verification Submitted</h1>
          <p className="text-[14px] text-muted font-sans max-w-md mx-auto mb-8">
            Your Tier 3 verification documents have been received. A compliance officer will review your submission within 1-2 business days.
          </p>
          <Link href="/kyc">
            <Button variant="outline" className="font-mono uppercase tracking-[0.2em]">
              Return to Verification Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/kyc" className="text-muted hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <p className="kicker">Tier 3 Enrollment</p>
        </div>
        <h1 className="font-display text-[32px] font-bold mb-2">Enhanced Due Diligence</h1>
        <p className="text-[14px] text-muted font-sans max-w-xl">
          Enhanced due diligence requires source of wealth declaration, business ownership attestation, and supporting documentation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Professional Information */}
        <div className="bg-surface border border-border p-8 space-y-6">
          <h2 className="kicker text-accent">Professional Profile</h2>

          <div className="space-y-2">
            <label className="block kicker">Occupation / Business Role</label>
            <input
              {...register("occupation")}
              type="text"
              placeholder="e.g. Director, CEO, Consultant"
              className={cn(
                "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                errors.occupation ? "border-danger focus:border-danger" : "border-border focus:border-accent"
              )}
            />
            {errors.occupation && <p className="text-[11px] text-danger font-mono">{errors.occupation.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block kicker">Source of Funds Declaration</label>
            <textarea
              {...register("sourceOfFunds")}
              rows={3}
              placeholder="Describe the primary source of funds for your transactions (e.g., business revenue, investment returns, salary)"
              className={cn(
                "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors resize-none font-sans",
                errors.sourceOfFunds ? "border-danger focus:border-danger" : "border-border focus:border-accent"
              )}
            />
            {errors.sourceOfFunds && <p className="text-[11px] text-danger font-mono">{errors.sourceOfFunds.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block kicker">Annual Income Range</label>
            <select
              {...register("annualIncome")}
              className={cn(
                "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                errors.annualIncome ? "border-danger focus:border-danger" : "border-border focus:border-accent"
              )}
            >
              <option value="">Select income range...</option>
              {incomeRanges.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.annualIncome && <p className="text-[11px] text-danger font-mono">{errors.annualIncome.message}</p>}
          </div>
        </div>

        {/* Politically Exposed Person Declaration */}
        <div className="bg-surface border border-border p-8 space-y-6">
          <h2 className="kicker text-accent">Regulatory Declaration</h2>
          <p className="text-[13px] text-muted font-sans">
            Under the Proceeds of Crime and Anti-Money Laundering Act (POCAMLA), we are required to determine if you are a Politically Exposed Person (PEP).
          </p>

          <div className="space-y-3">
            <label className="block kicker">Are you a Politically Exposed Person?</label>
            <div className="flex gap-6">
              {["yes", "no"].map((value) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    {...register("politicallyExposed")}
                    className="w-4 h-4 accent-accent"
                  />
                  <span className="text-[14px] font-medium">{value === "yes" ? "Yes" : "No"}</span>
                </label>
              ))}
            </div>
            {errors.politicallyExposed && <p className="text-[11px] text-danger font-mono">{errors.politicallyExposed.message}</p>}
          </div>
        </div>

        {/* Supporting Documents */}
        <div className="bg-surface border border-border p-8 space-y-6">
          <h2 className="kicker text-accent">Supporting Documentation</h2>
          <p className="text-[13px] text-muted font-sans">
            Upload a document supporting your source of funds declaration (bank statement, tax return, audited financials, etc.).
          </p>
          <UploadZone
            label="Supporting Document (PDF, max 10MB)"
            onUpload={(file: File) => setSupportingDoc(file)}
          />
        </div>

        {/* Legal Consent */}
        <div className="bg-surface border border-border p-8 space-y-6">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="agreeTerms"
              {...register("agreeTerms")}
              className="w-5 h-5 mt-0.5 accent-accent"
            />
            <label htmlFor="agreeTerms" className="text-[13px] text-muted font-sans leading-relaxed cursor-pointer">
              I certify that all information provided is accurate and complete. I understand that providing false information may result in account suspension and legal action under Kenyan law.
            </label>
          </div>
          {errors.agreeTerms && <p className="text-[11px] text-danger font-mono">{errors.agreeTerms.message}</p>}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit for Review
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
