import { notFound } from "next/navigation";
import { getTransactionById } from "@/lib/db/queries/transactions";
import { PaymentScreen } from "./payment-screen";

function getMockTransaction(id: string) {
  return {
    id,
    reference: `TBI-${id.slice(0, 8).toUpperCase()}`,
    title: "Asset Acquisition",
    assetClass: "physical",
    assetSubclass: "vehicles",
    status: "pending_funds",
    currency: "KES",
    amount: "5000000.00",
    description: "Escrow arrangement pending funding.",
    feeAmount: null,
    feePercentage: null,
    fxRateAtCreation: null,
    fxBaseCurrency: "KES",
    terms: null,
    inspectionPeriodDays: 5,
    milestoneCount: 3,
    hasDataRoom: false,
    createdBy: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let transaction;

  try {
    transaction = await getTransactionById(id);
  } catch {
    transaction = getMockTransaction(id) as unknown as Awaited<ReturnType<typeof getTransactionById>>;
  }

  if (!transaction) {
    notFound();
  }

  return <PaymentScreen transaction={transaction} />;
}
