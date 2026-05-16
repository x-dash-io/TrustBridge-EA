"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/verify?type=recovery`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-surface border border-border p-12 text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8 bg-success text-white">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-display text-[28px] font-bold mb-4">Recovery Email Sent</h1>
          <p className="text-[14px] text-muted mb-8 leading-relaxed">
            If an account exists for <strong className="text-fg">{email}</strong>, you will receive a password reset link shortly.
          </p>
          <Link href="/login">
            <Button variant="outline" className="font-mono uppercase tracking-[0.2em]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Security Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-surface border border-border p-12">
        <div className="mb-10">
          <p className="kicker mb-2">Credential Recovery</p>
          <h1 className="font-display text-[36px] leading-[1.1] font-bold text-fg">Reset Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <ErrorMessage variant="inline" message={error} />
          )}

          <div className="space-y-2">
            <label className="block kicker">Registered Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.com"
                required
                className="w-full bg-bg border border-border pl-12 pr-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending || !email}
            className="w-full font-mono uppercase tracking-[0.2em]"
          >
            {isPending ? "Sending Recovery Link..." : "Send Recovery Link"}
          </Button>
        </form>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/login" className="flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
