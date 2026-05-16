"use client";

import { useEffect, useState } from "react";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { Loader2, UserCog, Plus, Trash2 } from "lucide-react";

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export default function AdminRolesPage() {
  const [roleList, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPerms, setNewPerms] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/roles");
    const data = await res.json();
    setRoles(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        description: newDesc,
        permissions: newPerms.split(",").map((p) => p.trim()).filter(Boolean),
      }),
    });
    setCreating(false);
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    setNewPerms("");
    fetchRoles();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
    fetchRoles();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex justify-between items-start mb-10">
        <div>
          <Kicker>Administration</Kicker>
          <h1 className="font-display text-[42px] font-bold tracking-tight italic">Role Management</h1>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 font-mono uppercase tracking-[0.2em]">
          <Plus className="w-4 h-4" /> New Role
        </Button>
      </div>

      {showCreate && (
        <div className="bg-surface border border-border p-8 mb-8 space-y-4">
          <h2 className="kicker">Create Custom Role</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block kicker">Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="role_name"
                className="w-full bg-bg border border-border px-4 py-3 text-[14px] outline-none focus:border-accent font-mono" />
            </div>
            <div className="space-y-2">
              <label className="block kicker">Description</label>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Role description"
                className="w-full bg-bg border border-border px-4 py-3 text-[14px] outline-none focus:border-accent" />
            </div>
            <div className="space-y-2">
              <label className="block kicker">Permissions (comma-separated)</label>
              <input type="text" value={newPerms} onChange={(e) => setNewPerms(e.target.value)}
                placeholder="kyc:review, users:view"
                className="w-full bg-bg border border-border px-4 py-3 text-[14px] outline-none focus:border-accent font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={creating || !newName}>
              {creating ? "Creating..." : "Create Role"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-muted py-12"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[12px] font-mono">Loading roles...</span></div>
      ) : (
        <div className="space-y-4">
          {roleList.map((r) => (
            <div key={r.id} className="bg-surface border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserCog className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-[16px] font-bold font-mono">{r.name}</p>
                    <p className="text-[12px] text-muted font-sans">{r.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.isSystem && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-accent/10 text-accent border border-accent/20">System</span>
                  )}
                  {!r.isSystem && (
                    <button onClick={() => handleDelete(r.id)}
                      className="text-muted hover:text-danger transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.permissions.map((p) => (
                  <span key={p} className="text-[10px] font-mono px-2 py-0.5 bg-muted/10 border border-border">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
