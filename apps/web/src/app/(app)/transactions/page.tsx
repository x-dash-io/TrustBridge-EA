import { Kicker } from "@/components/ui/kicker";
import { TransactionListClient } from "@/components/transactions/transaction-list-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-12 px-4">
      <div className="flex justify-between items-end mb-12">
        <div>
          <Kicker>Registry Synchronization: Operational</Kicker>
          <h1 className="font-display text-[42px] font-bold tracking-tight">Transaction Ledger</h1>
        </div>
        
        <Link href="/transactions/new">
          <Button variant="primary" size="lg" className="font-mono uppercase tracking-[0.2em] flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Initiate Escrow
          </Button>
        </Link>
      </div>
      
      <TransactionListClient />
    </div>
  );
}
