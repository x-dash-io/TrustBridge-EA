"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, User, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import Link from "next/link";

interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  kycTier: number;
  kycStatus: string;
  role: string;
  preferredCurrency: string;
  createdAt: string;
  assignedRoles: { roleId: string; roleName: string; roleDescription: string | null }[];
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [allRoles, setAllRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${id}`).then((r) => r.json()),
      fetch("/api/admin/roles").then((r) => r.json()),
    ]).then(([userData, rolesData]) => {
      setUser(userData);
      setAllRoles(rolesData.data || []);
      setLoading(false);
    });
  }, [id]);

  const handleRoleToggle = async (roleId: string) => {
    if (!user) return;
    setSaving(true);
    const currentIds = user.assignedRoles.map((r) => r.roleId);
    const newIds = currentIds.includes(roleId)
      ? currentIds.filter((rid) => rid !== roleId)
      : [...currentIds, roleId];

    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedRoles: newIds }),
    });

    const updated = await fetch(`/api/admin/users/${id}`).then((r) => r.json());
    setUser(updated);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 text-muted"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[12px] font-mono">Loading user...</span></div>
      </div>
    );
  }

  if (!user) return <div className="max-w-3xl mx-auto px-6 py-12"><p className="text-muted">User not found.</p></div>;

  const kycIcon = () => {
    switch (user.kycStatus) {
      case "verified": return <ShieldCheck className="w-5 h-5 text-success" />;
      case "pending": return <ShieldAlert className="w-5 h-5 text-warning" />;
      case "rejected": return <ShieldX className="w-5 h-5 text-danger" />;
      default: return <ShieldAlert className="w-5 h-5 text-muted" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/admin/users" className="flex items-center gap-2 text-[12px] font-mono text-muted hover:text-accent mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 bg-muted/10 border border-border flex items-center justify-center">
          <User className="w-8 h-8 text-muted" />
        </div>
        <div>
          <Kicker>{user.role} Account</Kicker>
          <h1 className="font-display text-[32px] font-bold tracking-tight">{user.fullName}</h1>
          <p className="text-[13px] font-mono text-muted">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-surface border border-border p-6 space-y-4">
          <p className="kicker">Account Details</p>
          <div>
            <p className="text-[11px] text-muted font-mono">Account Type</p>
            <p className="text-[14px] font-mono font-bold">{user.role}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted font-mono">Phone</p>
            <p className="text-[14px] font-mono">{user.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted font-mono">Currency</p>
            <p className="text-[14px] font-mono">{user.preferredCurrency}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted font-mono">Joined</p>
            <p className="text-[14px] font-mono">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 space-y-4">
          <p className="kicker">KYC Status</p>
          <div className="flex items-center gap-3">
            {kycIcon()}
            <span className="text-[16px] font-bold">Tier {user.kycTier}</span>
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 bg-muted/10 border border-border">{user.kycStatus}</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border p-6">
        <p className="kicker mb-4">Role Assignments</p>
        {saving && <p className="text-[11px] text-muted font-mono mb-2">Saving...</p>}
        <div className="flex flex-wrap gap-2">
          {allRoles.map((role) => {
            const assigned = user.assignedRoles.some((r) => r.roleId === role.id);
            return (
              <button
                key={role.id}
                onClick={() => handleRoleToggle(role.id)}
                disabled={saving}
                className={`px-4 py-2 text-[11px] font-mono border transition-all ${
                  assigned
                    ? "bg-accent text-white border-accent"
                    : "bg-bg text-muted border-border hover:border-accent"
                }`}
              >
                {role.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
