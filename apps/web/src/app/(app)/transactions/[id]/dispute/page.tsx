import { notFound } from "next/navigation";

export default async function DisputePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1 className="font-display text-[32px] font-bold mb-2">
        Dispute — Transaction #{id}
      </h1>
      <p className="text-muted">Dispute resolution interface coming soon.</p>
    </div>
  );
}
