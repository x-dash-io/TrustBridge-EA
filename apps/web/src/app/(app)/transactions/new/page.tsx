"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { StepIndicator } from "@/components/transactions/transaction-creator/step-indicator";
import { StepAssetType } from "@/components/transactions/transaction-creator/step-asset-type";
import { StepDetails } from "@/components/transactions/transaction-creator/step-details";
import { StepMilestones } from "@/components/transactions/transaction-creator/step-milestones";
import { StepParties } from "@/components/transactions/transaction-creator/step-parties";
import { StepReview } from "@/components/transactions/transaction-creator/step-review";
import { StepSuccess } from "@/components/transactions/transaction-creator/step-success";

const steps = [
  { label: "Asset Type" },
  { label: "Details" },
  { label: "Milestones" },
  { label: "Parties" },
  { label: "Review" },
];

export default function NewTransactionPage() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const completedSteps = useWizardStore((s) => s.completedSteps);

  if (currentStep === 5) {
    return (
      <div className="max-w-[700px] mx-auto">
        <StepSuccess />
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto pt-12">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {currentStep === 0 && <StepAssetType />}
      {currentStep === 1 && <StepDetails />}
      {currentStep === 2 && <StepMilestones />}
      {currentStep === 3 && <StepParties />}
      {currentStep === 4 && <StepReview />}
    </div>
  );
}
