"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function VerifyContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const [status, setStatus] = useState<"verifying" | "verified" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifySession = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        if (data.session) {
          setStatus("verified");
          setMessage("Your identity has been verified successfully.");
        } else if (type === "recovery") {
          setStatus("verified");
          setMessage("Recovery link is valid. You may now close this window and return to login.");
        } else {
          setStatus("verified");
          setMessage("Email verification complete. You may close this window.");
        }
      } catch {
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
      }
    };

    verifySession();
  }, [type]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-surface border border-border p-12 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-8 text-accent animate-spin" />
            <h1 className="font-display text-[28px] font-bold mb-4">Verifying Identity</h1>
            <p className="text-[14px] text-muted">Please wait while we confirm your credentials.</p>
          </>
        )}

        {status === "verified" && (
          <>
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8 bg-success text-white">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-display text-[28px] font-bold mb-4">Verification Complete</h1>
            <p className="text-[14px] text-muted mb-8 leading-relaxed">{message}</p>
            <Link href="/login">
              <Button variant="outline" className="font-mono uppercase tracking-[0.2em]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Proceed to Login
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8 bg-danger/10">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <h1 className="font-display text-[28px] font-bold mb-4">Verification Failed</h1>
            <p className="text-[14px] text-muted mb-8 leading-relaxed">{message}</p>
            <Link href="/login">
              <Button variant="outline" className="font-mono uppercase tracking-[0.2em]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
