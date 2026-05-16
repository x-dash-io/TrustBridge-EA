import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function TransactionStatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "completed":
      case "accepted":
      case "released":
      case "delivered":
        return "bg-success/10 text-success border-success/20";
      case "pending":
      case "awaiting_delivery":
      case "awaiting_approval":
        return "bg-warning/10 text-warning border-warning/20";
      case "disputed":
      case "cancelled":
        return "bg-danger/10 text-danger border-danger/20";
      default:
        return "bg-muted/10 text-muted border-muted/20";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-none",
        getStatusStyles(status),
        className
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
