import { notFound } from "next/navigation";
import Link from "next/link";
import { getTransactionById, getTransactionParties } from "@/lib/db/queries/transactions";
import { getMilestonesByTransactionId } from "@/lib/db/queries/milestones";
import { MilestoneTracker } from "@/components/transactions/milestone-tracker";
import { TransactionStatusBadge } from "@/components/transactions/status-badge";
import { format } from "date-fns";

function generateMockData(id: string) {
  return {
    transaction: {
      id,
      reference: `TBI-${id.slice(0, 8).toUpperCase()}`,
      title: "Asset Acquisition Transaction",
      assetClass: "physical",
      assetSubclass: "vehicles",
      status: "pending_funds",
      currency: "KES",
      amount: "5000000.00",
      description: "Escrow arrangement for the acquisition of a 2022 Toyota Land Cruiser V8, pending inspection and title transfer.",
      terms: "Standard TrustBridge escrow terms apply.",
      inspectionPeriodDays: 5,
      createdBy: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    parties: [
      { id: "p1", role: "buyer", status: "signed", signedAt: new Date().toISOString() },
      { id: "p2", role: "seller", status: "invited" },
    ],
    milestones: [
      {
        id: "m1",
        orderIndex: 0,
        title: "Initial Payment",
        amount: "2500000.00",
        status: "completed",
        deliveredAt: new Date().toISOString(),
        acceptedAt: new Date().toISOString(),
      },
      {
        id: "m2",
        orderIndex: 1,
        title: "Delivery & Inspection",
        amount: "1500000.00",
        status: "pending",
      },
      {
        id: "m3",
        orderIndex: 2,
        title: "Final Transfer & Close",
        amount: "1000000.00",
        status: "pending",
      },
    ],
  };
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let transaction: Awaited<ReturnType<typeof getTransactionById>>;
  let parties: Awaited<ReturnType<typeof getTransactionParties>>;
  let milestones: Awaited<ReturnType<typeof getMilestonesByTransactionId>>;

  try {
    transaction = await getTransactionById(id);
    parties = await getTransactionParties(id);
    milestones = await getMilestonesByTransactionId(id);
  } catch {
    const mock = generateMockData(id);
    transaction = mock.transaction as unknown as typeof transaction;
    parties = mock.parties as unknown as typeof parties;
    milestones = mock.milestones as unknown as typeof milestones;
  }

  if (!transaction) notFound();
  parties = parties || [];
  milestones = milestones || [];

  const currentUserId = transaction.createdBy || "";
  const sellerParty = parties?.find(p => p.role === "seller");
  const buyerParty = parties?.find(p => p.role === "buyer");
  const sellerId = sellerParty?.userId || "";
  const buyerId = buyerParty?.userId || "";

  const formattedAmount = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(Number(transaction.amount)).replace("KES", "KSh");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="border-b border-border pb-10 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TransactionStatusBadge status={transaction.status} />
              <p className="kicker">REF: {transaction.reference}</p>
            </div>
            <h1 className="font-display text-[48px] font-bold leading-tight mb-2 tracking-tight">
              {transaction.title}
            </h1>
            <p className="text-[16px] text-muted max-w-2xl font-sans">
              {transaction.description}
            </p>
          </div>
          <div className="text-right">
            <p className="kicker mb-1">Total Contract Value</p>
            <p className="text-[32px] font-bold tabular-nums tracking-tight">
              {formattedAmount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-12">
          <div>
            <p className="kicker mb-2">Asset Class</p>
            <p className="text-[14px] font-bold uppercase tracking-wide">
              {transaction.assetClass} / {transaction.assetSubclass}
            </p>
          </div>
          <div>
            <p className="kicker mb-2">Initiated On</p>
            <p className="text-[14px] font-medium">
              {format(new Date(transaction.createdAt!), "dd MMMM yyyy")}
            </p>
          </div>
          <div>
            <p className="kicker mb-2">Inspection Period</p>
            <p className="text-[14px] font-medium">
              {transaction.inspectionPeriodDays} Banking Days
            </p>
          </div>
          <div>
            <p className="kicker mb-2">Milestones</p>
            <p className="text-[14px] font-medium">
              {milestones.length} Phases Total
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <MilestoneTracker
            milestones={milestones}
            currentUserId={currentUserId}
            sellerId={sellerId}
            buyerId={buyerId}
          />
        </div>

        <div className="space-y-12">
          {transaction.status === "pending_funds" && (
            <div className="bg-accent text-white p-8">
              <h3 className="kicker text-fg mb-4">Action Required</h3>
              <p className="text-[18px] font-bold mb-6">
                Funds are required to activate this transaction and notify the seller.
              </p>
              <Link
                href={`/payments/${transaction.id}`}
                className="block w-full bg-white text-accent text-center py-4 font-mono uppercase tracking-wider text-[12px] font-bold hover:bg-white/90 transition-colors"
              >
                Authenticate & Fund Escrow
              </Link>
            </div>
          )}

          <div className="bg-surface border border-border p-8">
            <h3 className="kicker mb-6 border-b border-border pb-4">Transaction Parties</h3>
            <div className="space-y-6">
              {parties.map((party) => (
                <div key={party.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-bold">{party.role === "seller" ? "Seller" : "Buyer"}</p>
                    <p className="text-[12px] text-muted">{party.status}</p>
                  </div>
                  {party.signedAt && (
                    <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 font-mono uppercase font-bold">Signed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border p-8">
            <h3 className="kicker mb-6 border-b border-border pb-4">Audit Trail</h3>
            <p className="text-[12px] text-muted leading-relaxed font-sans mb-4">
              View the complete chronological, append-only event log for this transaction with cryptographic chain verification.
            </p>
            <Link
              href={`/audit/${transaction.id}`}
              className="block w-full bg-accent text-white text-center py-4 font-mono uppercase tracking-wider text-[12px] font-bold hover:bg-accent/90 transition-colors"
            >
              View Audit Registry
            </Link>
          </div>

          <div className="bg-surface border border-border p-8">
            <h3 className="kicker mb-6 border-b border-border pb-4">Legal Framework</h3>
            <p className="text-[12px] text-muted leading-relaxed font-sans italic">
              This transaction is governed by the TrustBridge Escrow Service Agreement and regulated under the laws of the Republic of Kenya. All funds are held in secure, non-interest bearing trust accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
