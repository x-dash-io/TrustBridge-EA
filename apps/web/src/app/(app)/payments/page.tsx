import { Kicker } from "@/components/ui/kicker";
import { PaymentsList } from "./payments-list";

export default function PaymentsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <Kicker>Payments</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight italic">Pending Escrow Funding</h1>
        <p className="text-[14px] text-muted font-sans mt-2 max-w-2xl">
          Transactions requiring funds to be deposited into escrow before activation. Select a transaction to proceed with payment.
        </p>
      </div>
      <PaymentsList />
    </div>
  );
}
