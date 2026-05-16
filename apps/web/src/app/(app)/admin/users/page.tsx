"use client";

import { useEffect, useState } from "react";
import { Kicker } from "@/components/ui/kicker";
import { Loader2, Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, ShieldX, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AssignedRole {
  roleId: string;
  roleName: string;
}

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  kycTier: number;
  kycStatus: string;
  role: string;
  preferredCurrency: string;
  createdAt: string;
  assignedRoles: AssignedRole[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.data || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const kycIcon = (status: string) => {
    switch (status) {
      case "verified": return <ShieldCheck className="w-4 h-4 text-success" />;
      case "pending": return <ShieldAlert className="w-4 h-4 text-warning" />;
      case "rejected": return <ShieldX className="w-4 h-4 text-danger" />;
      default: return <ShieldAlert className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <Kicker>Administration</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">User Management</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-bg border border-border pl-12 pr-4 py-3 text-[14px] outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="bg-accent text-white px-6 font-mono text-[12px] uppercase tracking-widest font-bold hover:bg-accent/90"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex items-center gap-3 text-muted py-12">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-[12px] font-mono">Loading users...</span>
        </div>
      ) : (
        <>
          <div className="bg-surface border border-border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-mono uppercase tracking-widest text-muted">
                  <th className="p-4 font-normal">Name</th>
                  <th className="p-4 font-normal">Email</th>
                  <th className="p-4 font-normal">Account</th>
                  <th className="p-4 font-normal">KYC</th>
                  <th className="p-4 font-normal">Roles</th>
                  <th className="p-4 font-normal">Joined</th>
                  <th className="p-4 font-normal" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted/10 border border-border flex items-center justify-center">
                          <User className="w-4 h-4 text-muted" />
                        </div>
                        <span className="text-[14px] font-bold">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[13px] font-mono text-muted">{u.email}</td>
                    <td className="p-4">
                      <span className="text-[11px] font-mono uppercase px-2 py-1 bg-muted/10 border border-border">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {kycIcon(u.kycStatus)}
                        <span className="text-[12px] font-mono">
                          T{u.kycTier} {u.kycStatus}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {u.assignedRoles.map((r) => (
                          <span
                            key={r.roleId}
                            className="text-[10px] font-mono px-2 py-0.5 bg-accent/10 text-accent border border-accent/20"
                          >
                            {r.roleName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-[12px] font-mono text-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-[11px] font-mono uppercase tracking-wider text-accent hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-[12px] font-mono text-muted">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 border border-border text-[12px] font-mono uppercase tracking-wider",
                    page <= 1 ? "text-muted/30" : "text-muted hover:border-accent"
                  )}
                >
                  <ChevronLeft className="w-3 h-3" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 border border-border text-[12px] font-mono uppercase tracking-wider",
                    page >= totalPages ? "text-muted/30" : "text-muted hover:border-accent"
                  )}
                >
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
