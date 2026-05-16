"use client";

import { useWizardStore, type AssetClass } from "@/stores/wizard-store";
import { 
  Globe, 
  Package, 
  Landmark, 
  FileText, 
  Briefcase, 
  Zap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const assetOptions: { value: AssetClass; icon: any; title: string; desc: string }[] = [
  { value: "digital", icon: Globe, title: "Digital Assets", desc: "Domains, software, social accounts, websites" },
  { value: "physical", icon: Package, title: "Physical Goods", desc: "Vehicles, electronics, machinery, livestock" },
  { value: "property", icon: Landmark, title: "Real Property", desc: "Land, commercial property, leasehold" },
  { value: "legal_data", icon: FileText, title: "Legal Data Package", desc: "Databases, IP, judgments, contracts" },
  { value: "business", icon: Briefcase, title: "Business Acquisition", desc: "Full business sale, goodwill, inventory" },
  { value: "services", icon: Zap, title: "Professional Services", desc: "Consulting, development, creative" },
];

const subclasses: Record<AssetClass, { value: string; label: string }[]> = {
  digital: [
    { value: "domain", label: "Domain Name" },
    { value: "social", label: "Social Account" },
    { value: "software", label: "Software License" },
    { value: "website", label: "Website / App" },
  ],
  physical: [
    { value: "vehicle", label: "Vehicle" },
    { value: "electronics", label: "Electronics & Valuables" },
    { value: "machinery", label: "Machinery & Equipment" },
    { value: "agriculture", label: "Agricultural Produce" },
    { value: "livestock", label: "Livestock" },
  ],
  property: [
    { value: "residential", label: "Residential Land" },
    { value: "commercial", label: "Commercial Property" },
    { value: "agricultural", label: "Agricultural Land" },
    { value: "leasehold", label: "Leasehold" },
  ],
  legal_data: [
    { value: "database", label: "Customer Database" },
    { value: "ip", label: "Intellectual Property" },
    { value: "judgment", label: "Legal Judgment" },
    { value: "contract", label: "Business Contract" },
  ],
  business: [
    { value: "full_sale", label: "Full Business Sale" },
    { value: "goodwill", label: "Goodwill / Brand" },
    { value: "inventory", label: "Inventory" },
  ],
  services: [
    { value: "software_dev", label: "Software Development" },
    { value: "consulting", label: "Legal / Consulting" },
    { value: "creative", label: "Creative Services" },
    { value: "research", label: "Research / Data Analysis" },
  ],
};

export function StepAssetType() {
  const { assetClass, assetSubclass, setAssetClass, setAssetSubclass, markStepComplete, setStep } = useWizardStore();

  const handleNext = () => {
    if (assetClass) {
      markStepComplete(0);
      setStep(1);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <div className="mb-10">
        <p className="kicker mb-2">Step 01 / 06</p>
        <h2 className="font-display text-[32px] font-bold tracking-tight">Asset Classification</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {assetOptions.map((opt) => {
          const selected = assetClass === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAssetClass(opt.value)}
              className={cn(
                "text-left p-8 bg-surface border transition-all cursor-pointer group",
                selected ? "border-accent shadow-sm" : "border-border hover:border-muted-foreground/30"
              )}
            >
              <div className={cn(
                "w-10 h-10 flex items-center justify-center mb-6 transition-colors",
                selected ? "bg-accent text-white" : "bg-muted/5 text-muted group-hover:text-accent"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-[18px] font-bold mb-1 tracking-tight">{opt.title}</h3>
              <p className="text-[13px] text-muted leading-relaxed">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      {assetClass && (
        <div className="mb-10 p-8 border border-border bg-muted/5 animate-in fade-in duration-300">
          <Select
            kicker="Sub-classification"
            value={assetSubclass}
            onChange={(e) => setAssetSubclass(e.target.value)}
            options={[
              { value: "", label: "Choose specific sub-category (Optional)" },
              ...subclasses[assetClass],
            ]}
          />
        </div>
      )}

      <div className="flex justify-end pt-8 border-t border-border">
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!assetClass}
          className="font-mono uppercase tracking-[0.2em] flex items-center gap-2"
        >
          Define Details
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
