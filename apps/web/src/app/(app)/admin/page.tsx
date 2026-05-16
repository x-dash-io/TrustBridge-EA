import { Kicker } from "@/components/ui/kicker";
import { AdminStatsCards } from "./admin-stats-cards";
import { AdminQuickActions } from "./admin-quick-actions";

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <Kicker>Administration</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">Admin Dashboard</h1>
      </div>

      <AdminStatsCards />
      <AdminQuickActions />
    </div>
  );
}
