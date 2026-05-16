"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Bell, Shield, Save, Loader2, CheckCircle2, Eye, EyeOff, Smartphone, Globe } from "lucide-react";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required").optional(),
  preferredCurrency: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8, "Minimum 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [userData, setUserData] = useState<{ email: string; fullName: string; phone?: string } | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserData({
          email: data.user.email || "",
          fullName: data.user.user_metadata?.full_name || "",
          phone: data.user.user_metadata?.phone || "",
        });
      }
    });
  }, []);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: userData?.fullName || "",
      phone: userData?.phone || "",
      preferredCurrency: "KES",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (values: ProfileForm) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: values.fullName, phone: values.phone },
    });
    if (!error) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    setPasswordError(null);
    setPasswordSaved(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <div className="max-w-[900px] mx-auto py-12 px-4">
      <div className="mb-12">
        <Kicker>System Configuration</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">Settings</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-12">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-8 py-4 text-[12px] font-mono uppercase tracking-widest transition-all border-b-2 -mb-[2px]",
                activeTab === tab.id
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted hover:text-accent"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-10 max-w-[600px]">
          <div className="bg-surface border border-border p-8 space-y-6">
            <h2 className="kicker">Personal Information</h2>

            <div className="space-y-2">
              <label className="block kicker">Email Address</label>
              <input
                type="email"
                value={userData?.email || ""}
                disabled
                className="w-full bg-muted/5 border border-border px-4 py-3 text-[14px] outline-none text-muted cursor-not-allowed"
              />
              <p className="text-[10px] font-mono text-muted">Email cannot be changed. Contact compliance for updates.</p>
            </div>

            <div className="space-y-2">
              <label className="block kicker">Full Legal Name</label>
              <input
                {...profileForm.register("fullName")}
                type="text"
                className={cn(
                  "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                  profileForm.formState.errors.fullName ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
              />
              {profileForm.formState.errors.fullName && (
                <p className="text-[11px] text-danger font-mono">{profileForm.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block kicker">Phone Number</label>
              <input
                {...profileForm.register("phone")}
                type="tel"
                placeholder="+254..."
                className="w-full bg-bg border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors tabular-nums"
              />
            </div>

            <div className="space-y-2">
              <label className="block kicker">Preferred Currency</label>
              <select
                {...profileForm.register("preferredCurrency")}
                className="w-full bg-bg border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
              >
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="UGX">UGX — Ugandan Shilling</option>
                <option value="TZS">TZS — Tanzanian Shilling</option>
                <option value="RWF">RWF — Rwandan Franc</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={profileForm.formState.isSubmitting}
              className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
            >
              {profileForm.formState.isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : profileSaved ? (
                <><CheckCircle2 className="w-4 h-4 text-success" /> Saved</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-10 max-w-[600px]">
          <div className="bg-surface border border-border p-8 space-y-6">
            <h2 className="kicker">Change Password</h2>

            <div className="space-y-2">
              <label className="block kicker">Current Password</label>
              <input
                {...passwordForm.register("currentPassword")}
                type="password"
                className="w-full bg-bg border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block kicker">New Password</label>
              <div className="relative">
                <input
                  {...passwordForm.register("newPassword")}
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors pr-12",
                    passwordForm.formState.errors.newPassword ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-[11px] text-danger font-mono">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block kicker">Confirm New Password</label>
              <input
                {...passwordForm.register("confirmPassword")}
                type="password"
                className={cn(
                  "w-full bg-bg border px-4 py-3 text-[14px] outline-none transition-colors",
                  passwordForm.formState.errors.confirmPassword ? "border-danger focus:border-danger" : "border-border focus:border-accent"
                )}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-[11px] text-danger font-mono">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {passwordError && (
              <p className="text-[12px] text-danger font-mono">{passwordError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={passwordForm.formState.isSubmitting}
              className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
            >
              {passwordForm.formState.isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
              ) : passwordSaved ? (
                <><CheckCircle2 className="w-4 h-4" /> Password Updated</>
              ) : (
                <><Shield className="w-4 h-4" /> Update Password</>
              )}
            </Button>
          </div>

          {/* Multi-Factor Auth */}
          <div className="bg-surface border border-border p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="kicker mb-1">Multi-Factor Authentication</h2>
                <p className="text-[12px] text-muted font-sans">Add an extra layer of security to your account.</p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 bg-muted/10 text-muted border border-border">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-surface border border-border p-8 space-y-4">
            <h2 className="kicker">Active Sessions</h2>
            <div className="flex items-center gap-4 p-4 bg-bg border border-border">
              <Smartphone className="w-5 h-5 text-muted" />
              <div className="flex-1">
                <p className="text-[13px] font-bold">Current Session</p>
                <p className="text-[11px] text-muted font-mono">Active now</p>
              </div>
              <Globe className="w-4 h-4 text-muted" />
            </div>
          </div>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-10 max-w-[600px]">
          <div className="bg-surface border border-border p-8 space-y-6">
            <h2 className="kicker">Notification Channels</h2>

            {[
              { id: "email", label: "Email", description: "Receive notifications via email", enabled: true },
              { id: "sms", label: "SMS", description: "Transaction alerts via SMS", enabled: false },
              { id: "in_app", label: "In-App", description: "Notifications within the platform", enabled: true },
            ].map((channel) => (
              <div key={channel.id} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                <div>
                  <p className="text-[14px] font-bold">{channel.label}</p>
                  <p className="text-[12px] text-muted font-sans">{channel.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={channel.enabled} disabled={!channel.enabled} className="sr-only peer" />
                  <div className="w-10 h-6 bg-muted/20 peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border p-8 space-y-4">
            <h2 className="kicker">Notification Types</h2>
            {[
              { id: "transactions", label: "Transaction Updates", enabled: true },
              { id: "milestones", label: "Milestone Events", enabled: true },
              { id: "payments", label: "Payment Confirmations", enabled: true },
              { id: "disputes", label: "Dispute Notifications", enabled: true },
              { id: "kyc", label: "KYC Status Changes", enabled: true },
            ].map((nt) => (
              <div key={nt.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <p className="text-[13px] font-medium">{nt.label}</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={nt.enabled} className="sr-only peer" />
                  <div className="w-10 h-6 bg-muted/20 peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
