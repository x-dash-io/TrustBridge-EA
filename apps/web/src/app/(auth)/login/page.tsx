"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login } from "@/lib/auth/actions";
import { useState } from "react";
import { ErrorMessage } from "@/components/ui/error-message";
import { filterPhoneInput } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid institutional email address"),
  password: z.string().min(8, "Security password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [usePhoneOtp, setUsePhoneOtp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsPending(true);
    setServerError(null);
    
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    const result = await login(formData);
    if (result?.error) {
      setServerError(result.error);
    }
    setIsPending(false);
  };

  const handlePhoneOtp = async () => {
    setIsPending(true);
    setServerError(null);

    try {
      const supabase = createClient();
      const sanitizedPhone = phoneNumber.startsWith("0")
        ? "+254" + phoneNumber.slice(1)
        : phoneNumber.startsWith("254")
        ? "+" + phoneNumber
        : phoneNumber;

      const { error } = await supabase.auth.signInWithOtp({
        phone: sanitizedPhone,
      });

      if (error) {
        setServerError(error.message);
      } else {
        setServerError(null);
        // OTP sent successfully - in production this would redirect to a verify page
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-surface border border-border p-12 rounded-none shadow-none">
        <div className="mb-10">
          <p className="kicker mb-2">Security Portal</p>
          <h1 className="font-display text-[36px] leading-[1.1] font-bold text-fg">Sign In</h1>
        </div>

        <div className="flex mb-8 border border-border">
          <button
            type="button"
            onClick={() => setUsePhoneOtp(false)}
            className={`flex-1 py-3 text-[11px] font-mono font-bold uppercase tracking-widest transition-colors ${
              !usePhoneOtp ? "bg-accent text-white" : "bg-surface text-muted hover:text-accent"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setUsePhoneOtp(true)}
            className={`flex-1 py-3 text-[11px] font-mono font-bold uppercase tracking-widest transition-colors ${
              usePhoneOtp ? "bg-accent text-white" : "bg-surface text-muted hover:text-accent"
            }`}
          >
            Phone OTP
          </button>
        </div>
        
        {usePhoneOtp ? (
          <div className="space-y-8">
            {serverError && (
              <ErrorMessage variant="inline" message={serverError} />
            )}
            <div className="space-y-2">
              <label className="block kicker">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(filterPhoneInput(e.target.value))}
                placeholder="+254..."
                className="w-full bg-bg border border-border px-4 py-3 text-[14px] rounded-none outline-none focus:border-accent transition-colors tabular-nums"
              />
            </div>
            <button
              type="button"
              disabled={isPending || phoneNumber.length < 10}
              onClick={handlePhoneOtp}
              className="w-full bg-accent text-white py-4 text-[13px] font-mono uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-colors rounded-none disabled:opacity-50"
            >
              {isPending ? "Sending OTP..." : "Send M-Pesa OTP"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {serverError && (
              <ErrorMessage variant="inline" message={serverError} />
            )}

            <div className="space-y-2">
              <label className="block kicker">Email Address</label>
              <input 
                {...register("email")}
                type="email" 
                className={errors.email ? "w-full bg-bg border border-danger px-4 py-3 text-[14px] rounded-none outline-none focus:border-danger transition-colors" : "w-full bg-bg border border-border px-4 py-3 text-[14px] rounded-none outline-none focus:border-accent transition-colors"} 
                placeholder="name@institution.com"
              />
              {errors.email && (
                <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block kicker">Password</label>
                <Link href="/forgot-password" title="Recover Password" className="text-[11px] font-mono uppercase tracking-[0.1em] text-muted hover:text-accent transition-colors">Recover</Link>
              </div>
              <input 
                {...register("password")}
                type="password" 
                className={errors.password ? "w-full bg-bg border border-danger px-4 py-3 text-[14px] rounded-none outline-none focus:border-danger transition-colors" : "w-full bg-bg border border-border px-4 py-3 text-[14px] rounded-none outline-none focus:border-accent transition-colors"} 
              />
              {errors.password && (
                <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{errors.password.message}</p>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-accent text-white py-4 text-[13px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-accent/90 transition-colors rounded-none disabled:opacity-50"
            >
              {isPending ? "Verifying..." : "Authenticate"}
            </button>
          </form>
        )}
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col gap-4">
          <p className="text-[12px] text-muted font-sans">
            Unauthorized access is strictly prohibited. By authenticating, you agree to the terms of the Escrow Service Agreement.
          </p>
          <p className="text-[13px] font-sans">
            New Entity?{" "}
            <Link href="/register" className="text-fg font-bold hover:underline underline-offset-4">Register Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
