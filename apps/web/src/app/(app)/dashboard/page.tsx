import { Kicker } from "@/components/ui/kicker";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-12 px-4">
      <div className="mb-12">
        <Kicker>System Authorization: Active</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight">Institutional Command</h1>
      </div>
      
      <DashboardClient />
    </div>
  );
}
