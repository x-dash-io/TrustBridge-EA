import { Milestone } from "@/lib/db/schema";
import { MilestoneCard } from "./milestone-card";

interface MilestoneTrackerProps {
  milestones: Milestone[];
  currentUserId: string;
  sellerId: string;
  buyerId: string;
}

export function MilestoneTracker({
  milestones,
  currentUserId,
  sellerId,
  buyerId,
}: MilestoneTrackerProps) {
  const isSeller = currentUserId === sellerId;
  const isBuyer = currentUserId === buyerId;

  // Logic to determine current milestone
  const currentMilestoneIndex = milestones.findIndex(m => m.status !== "accepted" && m.status !== "released");
  const finalIndex = currentMilestoneIndex === -1 ? milestones.length : currentMilestoneIndex;

  return (
    <div className="py-8">
      <div className="mb-12">
        <h2 className="font-display text-[28px] font-bold mb-1">Transaction Milestones</h2>
        <p className="text-[14px] text-muted font-sans">
          Track deliverables and manage fund releases through the secure vertical timeline.
        </p>
      </div>

      <div className="max-w-4xl">
        {milestones.map((milestone, index) => {
          const isCompleted = index < finalIndex;
          const isCurrent = index === finalIndex;
          const isLocked = index > finalIndex;

          return (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              isSeller={isSeller}
              isBuyer={isBuyer}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isLocked={isLocked}
            />
          );
        })}
      </div>
    </div>
  );
}
