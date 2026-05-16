"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/kyc/upload-zone";
import { ArrowLeft, ArrowRight, Building2, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const kySchema = z.object({
  legalName: z.string().min(3, "Legal business name is required"),
  registrationNumber: z.string().min(3, "Registration number is required"),
  kraPin: z.string().min(11, "Valid KRA PIN is required (11 characters)").max(11),
  country: z.string().min(2, "Country is required"),
  businessType: z.string().min(1, "Business type is required"),
  directorName: z.string().min(3, "Director full name is required"),
  directorIdNumber: z.string().min(6, "Director ID/Passport number is required"),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to proceed" }) }),
});

type KYFormValues = z.infer<typeof kySchema>;

const businessTypes = [
  { value: "private", label: "Private Limited Company" },
  { value: "public", label: "Public Limited Company" },
  { value: "partnership", label: "Partnership" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "ngo", label: "Non-Profit / NGO" },
  { value: "cooperative", label: "Cooperative Society" },
];

export default function Tier4KyFlow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [certificateInc, setCertificateInc] = useState<File | null>(null);
  const [kraCertificate, setKraCertificate] = useState<File | null>(null);
  const [directorId, setDirectorId] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KYFormValues>({
    resolver: zodResolver(kySchema),
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
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
          <h1 className="font-display text-[32px] font-bold mb-4">KYB Submission Complete</h1>
          <p className="text-[14px] text-muted font-sans max-w-md mx-auto mb-8">
            Your business verification (KYB) documents have been received. Our compliance team will review your submission within 2-3 business days.
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
          <p className="kicker">Tier 4 Enrollment</p>
        </div>
        <h1 className="font-display text-[32px] font-bold mb-2">Business Verification (KYB)</h1>
        <p className="text-[14px] text-muted font-sans max-w-xl">
          Corporate account verification for unlimited transaction limits. Requires KRA PIN, business registration, and director identification.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Business Information */}
        <div className="bg-surface border border-border p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-accent" />
            <h2 className="kicker text-accent">Business Profile</h2>
          </div>

          <div className="space-y-2">
            <label className="block kicker">Legal Business Name</label>
            <input
              {...register("legalName")}
              type="text"
              placeholder="As registered with the Registrar of Companies"
              className={cn(
                "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                errors.legalName ? "border-danger focus:border-danger" : "border-border focus:border-accent"
              )}
            />
            {errors.legalName && <p className="text-[11px] text-danger font-mono">{errors.legalName.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block kicker">Registration Number</label>
              <input
                {...register("registrationNumber")}
                type="text"
                placeholder="e.g. CPR/2024/123456"
                className={cn(
                  "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                  errors.registrationNumber ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
              />
              {errors.registrationNumber && <p className="text-[11px] text-danger font-mono">{errors.registrationNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block kicker">KRA PIN</label>
              <input
                {...register("kraPin")}
                type="text"
                placeholder="PXXXXXXXXX"
                className={cn(
                  "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors uppercase",
                  errors.kraPin ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
                maxLength={11}
              />
              {errors.kraPin && <p className="text-[11px] text-danger font-mono">{errors.kraPin.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block kicker">Country of Registration</label>
              <select
                {...register("country")}
                className={cn(
                  "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                  errors.country ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
              >
                <option value="">Select country...</option>
                <option value="KE">Kenya</option>
                <option value="UG">Uganda</option>
                <option value="TZ">Tanzania</option>
                <option value="RW">Rwanda</option>
              </select>
              {errors.country && <p className="text-[11px] text-danger font-mono">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block kicker">Business Type</label>
              <select
                {...register("businessType")}
                className={cn(
                  "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                  errors.businessType ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
              >
                <option value="">Select type...</option>
                {businessTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.businessType && <p className="text-[11px] text-danger font-mono">{errors.businessType.message}</p>}
            </div>
          </div>
        </div>

        {/* Director Information */}
        <div className="bg-surface border border-border p-8 space-y-6">
          <h2 className="kicker text-accent">Director / Beneficial Owner</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block kicker">Full Legal Name</label>
              <input
                {...register("directorName")}
                type="text"
                placeholder="As appears on national ID"
                className={cn(
                  "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                  errors.directorName ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
              />
              {errors.directorName && <p className="text-[11px] text-danger font-mono">{errors.directorName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block kicker">ID / Passport Number</label>
              <input
                {...register("directorIdNumber")}
                type="text"
                placeholder="National ID or Passport"
                className={cn(
                  "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                  errors.directorIdNumber ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
              />
              {errors.directorIdNumber && <p className="text-[11px] text-danger font-mono">{errors.directorIdNumber.message}</p>}
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="bg-surface border border-border p-8 space-y-8">
          <h2 className="kicker text-accent">Required Documents</h2>

          <UploadZone
            label="Certificate of Incorporation"
            onUpload={(file: File) => setCertificateInc(file)}
          />
          <UploadZone
            label="KRA Tax Compliance Certificate"
            onUpload={(file: File) => setKraCertificate(file)}
          />
          <UploadZone
            label="Director's National ID / Passport Copy"
            onUpload={(file: File) => setDirectorId(file)}
          />
        </div>

        {/* Legal Consent */}
        <div className="bg-surface border border-border p-8">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="agreeTerms"
              {...register("agreeTerms")}
              className="w-5 h-5 mt-0.5 accent-accent"
            />
            <label htmlFor="agreeTerms" className="text-[13px] text-muted font-sans leading-relaxed cursor-pointer">
              I confirm that I am an authorized representative of this business and that all provided information is accurate. I understand that this information will be verified against official registries.
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
