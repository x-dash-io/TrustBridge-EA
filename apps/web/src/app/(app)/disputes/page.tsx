import { Kicker } from "@/components/ui/kicker";
import { DisputeListClient } from "@/components/disputes/dispute-list-client";

export default function DisputesListPage() {
  return (
    <div className="max-w-[1000px] mx-auto py-12 px-4">
      <div className="mb-12">
        <Kicker>Security Node: Resolution Center</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">Registry Arbitration</h1>
      </div>
      
      <DisputeListClient />
    </div>
  );
}
