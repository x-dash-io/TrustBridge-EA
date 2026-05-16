"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isCompleted = completedSteps.includes(i);
          const isActive = currentStep === i;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              {/* Connection Line */}
              {i !== 0 && (
                <div className={cn(
                  "absolute h-[2px] w-[calc(100%-24px)] right-[calc(50%+12px)] top-[11px] transition-all duration-500",
                  isCompleted ? "bg-accent" : "bg-border"
                )} />
              )}
              
              {/* Node */}
              <div className={cn(
                "w-6 h-6 border-2 flex items-center justify-center transition-all duration-300 z-10",
                isActive ? "border-accent bg-accent text-white" : 
                isCompleted ? "border-accent bg-accent text-white" : 
                "border-border bg-white"
              )}>
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className={cn("text-[10px] font-bold font-mono", isActive ? "text-white" : "text-muted")}>
                    0{i + 1}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "mt-4 text-[10px] font-mono font-bold uppercase tracking-widest transition-all",
                isActive ? "text-accent" : isCompleted ? "text-success" : "text-muted"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
