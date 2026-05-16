import { notFound } from "next/navigation";
import { getTransactionById } from "@/lib/db/queries/transactions";
import { PaymentScreen } from "./payment-screen";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const transaction = await getTransactionById(id);

  if (!transaction) {
    notFound();
  }

  return <PaymentScreen transaction={transaction} />;
}
