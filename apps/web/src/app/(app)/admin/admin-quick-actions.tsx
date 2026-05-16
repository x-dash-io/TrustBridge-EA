"use client";

import Link from "next/link";
import { Users, ShieldQuestion, Scale, ScrollText, UserCog } from "lucide-react";

const actions = [
  { label: "Review KYC", href: "/admin/kyc", icon: ShieldQuestion, desc: "Pending verification submissions" },
  { label: "Manage Users", href: "/admin/users", icon: Users, desc: "View, search, assign roles" },
  { label: "Open Disputes", href: "/admin/disputes", icon: Scale, desc: "Assign mediators, resolve" },
  { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText, desc: "Full event timeline" },
  { label: "Role Config", href: "/admin/roles", icon: UserCog, desc: "Manage system roles" },
];

export function AdminQuickActions() {
  return (
    <div className="mt-8">
      <p className="kicker mb-6">Quick Actions</p>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="bg-surface border border-border p-6 hover:border-accent transition-colors group"
            >
              <Icon className="w-5 h-5 text-muted group-hover:text-accent mb-3" />
              <p className="text-[13px] font-bold mb-1">{a.label}</p>
              <p className="text-[11px] text-muted font-sans">{a.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
