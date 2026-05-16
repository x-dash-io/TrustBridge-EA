"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { register } from "@/lib/auth/actions";
import { useState } from "react";
import { ErrorMessage } from "@/components/ui/error-message";
import { filterPhoneInput } from "@/lib/validation";

const registerSchema = z.object({
  fullName: z.string().min(3, "Full legal name is required"),
  email: z.string().email("Please enter a valid institutional email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  password: z.string().min(8, "Security password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsPending(true);
    setServerError(null);
    
    const formData = new FormData();
    formData.append("fullName", values.fullName);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("password", values.password);

    const result = await register(formData);
    if (result?.error) {
      setServerError(result.error);
    }
    setIsPending(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[580px] bg-surface border border-border p-12 rounded-none shadow-none">
        <div className="mb-10">
          <p className="kicker mb-2">Entity Enrollment</p>
          <h1 className="font-display text-[36px] leading-[1.1] font-bold text-fg">Create Account</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {serverError && (
            <div className="md:col-span-2">
              <ErrorMessage variant="inline" message={serverError} />
            </div>
          )}
          <div className="md:col-span-2 space-y-2">
            <label className="block kicker">Full Legal Name</label>
            <input 
              {...registerField("fullName")}
              type="text" 
              className={errors.fullName ? "w-full bg-bg border border-danger px-4 py-3 text-[14px] rounded-none outline-none focus:border-danger transition-colors" : "w-full bg-bg border border-border px-4 py-3 text-[14px] rounded-none outline-none focus:border-accent transition-colors"} 
            />
            {errors.fullName && (
              <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{errors.fullName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block kicker">Institutional Email</label>
            <input 
              {...registerField("email")}
              type="email" 
              className={errors.email ? "w-full bg-bg border border-danger px-4 py-3 text-[14px] rounded-none outline-none focus:border-danger transition-colors" : "w-full bg-bg border border-border px-4 py-3 text-[14px] rounded-none outline-none focus:border-accent transition-colors"} 
            />
            {errors.email && (
              <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block kicker">Primary Phone</label>
            <input 
              {...registerField("phone", {
                onChange: (e) => {
                  e.target.value = filterPhoneInput(e.target.value);
                },
              })}
              type="tel" 
              placeholder="+254..."
              className={errors.phone ? "w-full bg-bg border border-danger px-4 py-3 text-[14px] rounded-none outline-none focus:border-danger transition-colors tabular-nums" : "w-full bg-bg border border-border px-4 py-3 text-[14px] rounded-none outline-none focus:border-accent transition-colors tabular-nums"} 
            />
            {errors.phone && (
              <p className="text-[11px] text-danger font-mono uppercase tracking-tight">{errors.phone.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <label className="block kicker">Security Password</label>
            <input 
              {...registerField("password")}
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
            className="md:col-span-2 w-full bg-accent text-white py-4 text-[13px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-accent/90 transition-colors rounded-none mt-4 disabled:opacity-50"
          >
            {isPending ? "Processing Enrollment..." : "Finalize Enrollment"}
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col gap-4">
          <p className="text-[12px] text-muted font-sans italic">
            Registration requires subsequent KYC/KYB verification.
          </p>
          <p className="text-[13px] font-sans">
            Registered Entity?{" "}
            <Link href="/login" className="text-fg font-bold hover:underline underline-offset-4">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
