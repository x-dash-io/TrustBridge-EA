"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldQuestion,
  ArrowLeftRight,
  Scale,
  ScrollText,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "KYC Queue", href: "/admin/kyc", icon: ShieldQuestion },
  { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { label: "Disputes", href: "/admin/disputes", icon: Scale },
  { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
  { label: "Roles", href: "/admin/roles", icon: UserCog },
];

interface AdminSidebarItemsProps {
  collapsed: boolean;
}

export function AdminSidebarItems({ collapsed }: AdminSidebarItemsProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/check-admin")
      .then((r) => r.json())
      .then((data) => {
        setIsAdmin(data.isAdmin);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !isAdmin) return null;

  const isActive = pathname.startsWith("/admin");

  return (
    <>
      <div className={cn("px-6 mt-6 mb-2", collapsed && "px-0 text-center")}>
        {collapsed ? (
          <div className="w-full h-[1px] bg-border" />
        ) : (
          <p className="kicker">Admin Panel</p>
        )}
      </div>
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-6 py-3 text-[12px] font-mono uppercase tracking-widest transition-all",
              collapsed && "justify-center px-0",
              active
                ? "bg-accent text-white font-bold"
                : "text-muted hover:text-accent hover:bg-accent/5"
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </>
  );
}
