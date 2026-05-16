"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  ShieldCheck, 
  Scale, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Search,
  UserCircle,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { AdminSidebarItems } from "./admin-sidebar-items";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Identity & KYC", href: "/kyc", icon: ShieldCheck },
  { label: "Disputes", href: "/disputes", icon: Scale },
  { label: "Agents", href: "/agents", icon: ShieldCheck },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  if (name.length <= 3) return `${name[0]}${"*".repeat(name.length - 1)}@${domain}`;
  return `${name.slice(0, 2)}${"*".repeat(name.length - 4)}${name.slice(-2)}@${domain}`;
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser({
          name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
          email: data.user.email || "",
        });
      }
    });
  }, []);

  return (
    <aside
      className={cn(
        "h-screen bg-surface border-r border-border flex flex-col flex-shrink-0 sticky top-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Brand Header — height matches topbar (80px) */}
      <div className="h-[80px] px-6 border-b border-border flex items-center justify-between flex-shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            "font-display text-[20px] font-bold no-underline text-fg tracking-tight flex items-center gap-2 transition-opacity",
            collapsed && "justify-center w-full"
          )}
        >
          <div className="w-6 h-6 bg-accent flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-white" />
          </div>
          {!collapsed && <span>TRUSTBRIDGE</span>}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 mt-4 overflow-y-auto">
        {!collapsed && (
          <p className="kicker px-3 mb-4 text-[10px] text-muted">System Command</p>
        )}
        <ul className="space-y-1 list-none">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href} title={collapsed ? item.label : undefined}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 text-[13px] font-medium transition-all group rounded-none",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-accent text-white font-bold"
                      : "text-muted hover:text-accent hover:bg-muted/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-muted group-hover:text-accent")} />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && isActive && <ChevronRight className="w-3 h-3" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <AdminSidebarItems collapsed={collapsed} />
      </nav>

      {/* User Footer */}
      <div className="flex-shrink-0">
        <div className={cn("border-t border-border", collapsed ? "p-3" : "p-4")}>
          <div className={cn(
            "flex items-center gap-3 mb-3",
            collapsed ? "justify-center" : "px-3 py-2"
          )}>
            <div className="w-8 h-8 bg-muted/10 border border-border flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-4 h-4 text-muted" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[13px] font-bold truncate">{user?.name || "Loading..."}</p>
                {user?.email && (
                  <p className="kicker text-[9px] text-muted truncate">{maskEmail(user.email)}</p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className={cn(
              "flex items-center gap-3 text-[13px] font-medium text-muted hover:text-danger hover:bg-danger/5 transition-all group w-full rounded-none",
              collapsed ? "justify-center p-3" : "px-3 py-3"
            )}
            title="Terminate Session"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-danger" />
            {!collapsed && <span>Terminate Session</span>}
          </button>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[32px] w-6 h-6 bg-surface border border-border flex items-center justify-center hover:border-accent transition-colors z-20"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeft className="w-3 h-3 text-muted" />
        ) : (
          <PanelLeftClose className="w-3 h-3 text-muted" />
        )}
      </button>
    </aside>
  );
}
