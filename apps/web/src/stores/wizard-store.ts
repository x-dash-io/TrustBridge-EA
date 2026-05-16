"use client";

import { create } from "zustand";

export type AssetClass =
  | "digital"
  | "physical"
  | "property"
  | "legal_data"
  | "business"
  | "services";

export type Currency = "KES" | "UGX" | "TZS" | "RWF" | "USD" | "EUR" | "GBP";

export interface MilestoneDraft {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
  description: string;
}

export interface PartyDraft {
  id: string;
  role: "buyer" | "seller" | "agent" | "lawyer" | "observer";
  name: string;
  email: string;
  phone: string;
}

export interface WizardState {
  currentStep: number;
  completedSteps: number[];
  creatorRole: "buyer" | "seller";

  assetClass: AssetClass | null;
  assetSubclass: string;

  title: string;
  description: string;
  currency: Currency;
  amount: string;
  inspectionPeriodDays: number;
  terms: string;
  includeDataRoom: boolean;

  milestones: MilestoneDraft[];

  parties: PartyDraft[];

  transactionRef: string;
  transactionId: string;
  agreedToTerms: boolean;
}

interface WizardActions {
  setStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  setCreatorRole: (role: "buyer" | "seller") => void;
  setAssetClass: (ac: AssetClass) => void;
  setAssetSubclass: (s: string) => void;
  setTitle: (t: string) => void;
  setDescription: (d: string) => void;
  setCurrency: (c: Currency) => void;
  setAmount: (a: string) => void;
  setInspectionPeriodDays: (d: number) => void;
  setTerms: (t: string) => void;
  setIncludeDataRoom: (b: boolean) => void;
  setMilestones: (m: MilestoneDraft[]) => void;
  setParties: (p: PartyDraft[]) => void;
  setTransactionRef: (r: string) => void;
  setTransactionId: (i: string) => void;
  setAgreedToTerms: (b: boolean) => void;
  reset: () => void;
}

const initialState: WizardState = {
  currentStep: 0,
  completedSteps: [],
  creatorRole: "buyer",
  assetClass: null,
  assetSubclass: "",
  title: "",
  description: "",
  currency: "KES",
  amount: "",
  inspectionPeriodDays: 5,
  terms: "",
  includeDataRoom: false,
  milestones: [],
  parties: [],
  transactionRef: "",
  transactionId: "",
  agreedToTerms: false,
};

export const useWizardStore = create<WizardState & WizardActions>((set) => ({
  ...initialState,
  setStep: (step) => set({ currentStep: step }),
  markStepComplete: (step) =>
    set((s) => ({
      completedSteps: s.completedSteps.includes(step)
        ? s.completedSteps
        : [...s.completedSteps, step],
    })),
  setCreatorRole: (role) => set({ creatorRole: role }),
  setAssetClass: (ac) =>
    set({ assetClass: ac, assetSubclass: "", currentStep: 0 }),
  setAssetSubclass: (s) => set({ assetSubclass: s }),
  setTitle: (t) => set({ title: t }),
  setDescription: (d) => set({ description: d }),
  setCurrency: (c) => set({ currency: c }),
  setAmount: (a) => set({ amount: a }),
  setInspectionPeriodDays: (d) => set({ inspectionPeriodDays: d }),
  setTerms: (t) => set({ terms: t }),
  setIncludeDataRoom: (b) => set({ includeDataRoom: b }),
  setMilestones: (m) => set({ milestones: m }),
  setParties: (p) => set({ parties: p }),
  setTransactionRef: (r) => set({ transactionRef: r }),
  setTransactionId: (i) => set({ transactionId: i }),
  setAgreedToTerms: (b) => set({ agreedToTerms: b }),
  reset: () => set(initialState),
}));
