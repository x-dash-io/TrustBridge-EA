"use client";

import { useState } from "react";
import { Lock, FileSignature, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NDAGateProps {
  transactionTitle: string;
  onAccept: () => void;
}

export function NDAGate({ transactionTitle, onAccept }: NDAGateProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-[700px] mx-auto py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="bg-surface border border-border p-12 relative overflow-hidden">
        {/* Background Shield Decor */}
        <ShieldCheck className="absolute -right-12 -top-12 w-48 h-48 text-muted/5 rotate-12" />
        
        <div className="relative z-10">
          <div className="w-12 h-12 bg-accent text-white flex items-center justify-center mb-8">
            <Lock className="w-6 h-6" />
          </div>
          
          <p className="kicker mb-2 text-accent">Access Restricted</p>
          <h2 className="font-display text-[32px] font-bold tracking-tight mb-6">
            Confidential Data Room
          </h2>
          
          <div className="space-y-6 mb-10 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              You are attempting to access sensitive legal and financial documentation associated with the transaction: 
              <span className="text-fg font-bold"> {transactionTitle}</span>.
            </p>
            <p>
              Access to this Data Room is strictly governed by a <span className="text-fg font-bold">Mutual Non-Disclosure Agreement (MNDA)</span>. By proceeding, you acknowledge that all information contained herein is proprietary and must not be disclosed to any unauthorized third parties.
            </p>
          </div>

          <div 
            className={cn(
              "p-6 border transition-all cursor-pointer flex gap-4 mb-10",
              agreed ? "border-accent bg-muted/5" : "border-border bg-bg hover:border-muted-foreground/30"
            )}
            onClick={() => setAgreed(!agreed)}
          >
            <div className={cn(
              "w-6 h-6 border-2 flex items-center justify-center transition-all flex-shrink-0",
              agreed ? "border-accent bg-accent text-white" : "border-border bg-white"
            )}>
              {agreed && <FileSignature className="w-4 h-4" />}
            </div>
            <p className="text-[13px] font-bold leading-snug">
              I certify that I have read the MNDA and agree to be legally bound by its terms during and after this transaction.
            </p>
          </div>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            disabled={!agreed}
            onClick={onAccept}
          >
            Authorize Access
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <p className="text-center mt-8 text-[11px] font-mono text-muted uppercase tracking-widest">
            Institutional Encryption: AES-256 Enabled
          </p>
        </div>
      </div>
    </div>
  );
}
