"use client";

import { useQuery } from "@tanstack/react-query";
import { formatKES } from "@/lib/utils/currency";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ArrowUpRight,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  reference: string;
  title: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function TransactionListClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [statusFilter]);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery<{ transactions: Transaction[]; pagination: PaginationInfo }>({
    queryKey: ["transactions", statusFilter, page],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?status=${statusFilter}&page=${page}&limit=${pageSize}`);
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json();
    },
  });

  const transactions = data?.transactions || [];
  const pagination = data?.pagination;

  const filteredTransactions = transactions.filter(tx => 
    tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <ErrorMessage message="An institutional error occurred while synchronizing the transaction registry." />;
  }

  const hasTransactions = filteredTransactions && filteredTransactions.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface border border-border p-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text"
            placeholder="Search by Reference or Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg border border-border pl-12 pr-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "disputed", label: "Disputed" },
            ]}
          />
          
          <Button variant="outline" className="font-mono text-[11px] uppercase tracking-widest border-border px-6">
            <Filter className="w-3 h-3 mr-2" />
            Advanced
          </Button>
        </div>
      </div>

      {/* Results Ledger */}
      {!hasTransactions ? (
        <div className="bg-surface border border-border">
          <EmptyState 
            title="No Records Found"
            description={searchTerm ? "No transactions match your current search parameters." : "Your transaction registry is currently empty."}
            action={!searchTerm ? {
              label: "Initiate Escrow",
              href: "/transactions/new"
            } : undefined}
          />
        </div>
      ) : (
        <div className="bg-surface border border-border overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                <th className="text-left p-6 font-mono text-[10px] uppercase tracking-widest text-muted">ID / Reference</th>
                <th className="text-left p-6 font-mono text-[10px] uppercase tracking-widest text-muted">Transaction Details</th>
                <th className="text-right p-6 font-mono text-[10px] uppercase tracking-widest text-muted">Amount</th>
                <th className="text-center p-6 font-mono text-[10px] uppercase tracking-widest text-muted">Status</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/5 transition-colors group cursor-pointer">
                  <td className="p-6 align-top">
                    <p className="font-mono text-[12px] font-bold mb-1">{tx.reference}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted font-mono uppercase">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6 align-top">
                    <p className="text-[16px] font-bold mb-1 tracking-tight">{tx.title}</p>
                    <p className="text-[12px] text-muted line-clamp-1">Multi-asset institutional escrow</p>
                  </td>
                  <td className="p-6 text-right align-top">
                    <p className="text-[16px] font-bold tabular-nums mb-1">{formatKES(Number(tx.amount))}</p>
                    <p className="text-[11px] font-mono text-muted uppercase tracking-tight">{tx.currency} Settlement</p>
                  </td>
                  <td className="p-6 align-top">
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-tight border",
                        tx.status === "completed" ? "bg-success/5 border-success text-success" :
                        tx.status === "active" ? "bg-accent/5 border-accent text-accent" :
                        tx.status === "disputed" ? "bg-danger/5 border-danger text-danger" :
                        "bg-muted/5 border-border text-muted"
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right align-top">
                    <Link href={`/transactions/${tx.id}`}>
                      <div className="p-2 border border-border group-hover:border-accent transition-colors inline-block">
                        <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent" />
                      </div>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-6 border-t border-border bg-muted/5 flex justify-between items-center">
            <p className="text-[12px] text-muted font-mono uppercase">
              Page {pagination?.page || 1} of {pagination?.totalPages || 1} &mdash; {pagination?.total || 0} Total Records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-[10px] uppercase border-border"
                disabled={!pagination?.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-[10px] uppercase border-border"
                disabled={!pagination?.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
