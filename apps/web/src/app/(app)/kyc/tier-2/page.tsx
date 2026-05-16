"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { UploadZone } from "@/components/kyc/upload-zone";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

export default function Tier2KycFlow() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [idType, setIdType] = useState("national_id");
  const [idNumber, setIdNumber] = useState("");
  const [country, setCountry] = useState("KE");
  const [docFront, setDocFront] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);

  const nextStep = () => setStep((s) => (s + 1) as Step);
  const prevStep = () => setStep((s) => (s - 1) as Step);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Logic for API submission will go here
    setTimeout(() => {
      window.location.href = "/kyc?status=pending";
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      {/* Progress Header */}
      <div className="mb-16">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="kicker mb-1">Tier 2 Enrollment</p>
            <h1 className="font-display text-[32px] font-bold">Identity Verification</h1>
          </div>
          <p className="font-mono text-[13px] font-bold text-muted">
            Step {step} of 3
          </p>
        </div>
        <div className="h-[2px] bg-border w-full relative">
          <div 
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-surface border border-border p-12">
        {/* STEP 1: GOVERNMENT ID */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <Select
                kicker="Document Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                options={[
                  { value: "KE", label: "Kenya" },
                  { value: "UG", label: "Uganda" },
                  { value: "TZ", label: "Tanzania" },
                  { value: "RW", label: "Rwanda" },
                ]}
              />
            </div>

            <div>
              <label className="kicker mb-3 block">Document Type</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "national_id", label: "National ID" },
                  { id: "passport", label: "Passport" },
                  { id: "driving_license", label: "Driver's License" },
                  { id: "alien_id", label: "Alien ID" }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setIdType(type.id)}
                    className={cn(
                      "p-4 border text-[13px] font-bold font-mono uppercase tracking-tight text-left transition-all",
                      idType === type.id ? "border-accent bg-accent text-white" : "border-border text-muted hover:border-accent"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UploadZone 
                label="Front of Document" 
                onUpload={setDocFront}
              />
              {idType !== "passport" && (
                <UploadZone 
                  label="Back of Document" 
                  onUpload={setDocBack}
                />
              )}
            </div>

            <div>
              <label className="kicker mb-3 block">ID Number</label>
              <input 
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter document number exactly"
                className="w-full bg-bg border border-border p-4 text-[14px] outline-none focus:border-accent font-mono"
              />
            </div>

            <div className="pt-8 border-t border-border flex justify-end">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={nextStep}
                disabled={!docFront || !idNumber}
              >
                Continue to Liveness Check
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: LIVENESS CHECK */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center py-12">
              <div className="w-32 h-32 bg-bg border-2 border-dashed border-border rounded-full mx-auto mb-8 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-muted">
                  <path d="M15 8V16M9 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="font-display text-[24px] font-bold mb-4">Biometric Liveness Check</h2>
              <p className="text-[14px] text-muted max-w-md mx-auto mb-10">
                We need a short face scan to verify that you are the physical owner of the document provided.
              </p>
              
              <div className="bg-bg border border-border p-8 text-left mb-10">
                <p className="kicker mb-4">Instructions</p>
                <ul className="space-y-3">
                  {["Ensure your face is clearly visible", "Remove glasses or headwear", "Ensure adequate lighting"].map((ins, i) => (
                    <li key={i} className="text-[13px] flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-accent mt-1.5" />
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                className="w-full font-mono uppercase tracking-widest py-6"
                onClick={nextStep}
              >
                Start Face Scan
              </Button>
            </div>

            <div className="pt-8 border-t border-border flex justify-start">
              <button 
                onClick={prevStep}
                className="text-[12px] font-mono uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                Back to Document
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ADDRESS VERIFICATION */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="font-display text-[24px] font-bold mb-2">Proof of Address</h2>
              <p className="text-[14px] text-muted mb-8">
                Upload a document issued within the last 90 days showing your full name and residential address.
              </p>
            </div>

            <UploadZone 
              label="Utility Bill / Bank Statement" 
              onUpload={setProofOfAddress}
            />

            <div className="bg-muted/10 p-6 border border-border">
              <p className="text-[12px] text-muted leading-relaxed italic">
                Accepted documents: Electricity or water bill, Bank or Credit Card statement, Lease agreement, or official Government tax document.
              </p>
            </div>

            <div className="pt-8 border-t border-border flex justify-between items-center">
              <button 
                onClick={prevStep}
                className="text-[12px] font-mono uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                Back
              </button>
              <Button 
                variant="primary" 
                size="lg" 
                disabled={!proofOfAddress || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Submitting Securely..." : "Finalize Submission"}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-center text-[11px] text-muted font-mono uppercase tracking-widest">
        SECURE IDENTITY PORTAL • POWERED BY SMILE ID
      </p>
    </div>
  );
}
