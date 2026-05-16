"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface KycDetail {
  id: string;
  userId: string;
  tier: number;
  documentType: string;
  documentNumber: string;
  country: string;
  status: string;
  rejectionReason: string | null;
  submittedAt: string;
  userEmail: string | null;
  userFullName: string | null;
}

export default function AdminKycReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<KycDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/kyc?status=pending`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.data || []).find((s: KycDetail) => s.id === id);
        if (found) setSubmission(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleReview = async (status: "verified" | "rejected") => {
    setReviewing(true);
    setError("");
    const res = await fetch(`/api/admin/kyc/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason: status === "rejected" ? rejectionReason : undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Review failed");
      setReviewing(false);
    } else {
      router.push("/admin/kyc");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 text-muted"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[12px] font-mono">Loading submission...</span></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-muted">Submission not found.</p>
        <Link href="/admin/kyc" className="text-accent text-[12px] font-mono">Back to queue</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/admin/kyc" className="flex items-center gap-2 text-[12px] font-mono text-muted hover:text-accent mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Queue
      </Link>

      <div className="mb-10">
        <Kicker>KYC Review</Kicker>
        <h1 className="font-display text-[32px] font-bold tracking-tight italic">Tier {submission.tier} Submission</h1>
      </div>

      <div className="bg-surface border border-border p-8 space-y-6 mb-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="kicker mb-1">Applicant</p>
            <p className="text-[15px] font-bold">{submission.userFullName || "Unknown"}</p>
            <p className="text-[12px] font-mono text-muted">{submission.userEmail}</p>
          </div>
          <div>
            <p className="kicker mb-1">Submitted</p>
            <p className="text-[14px] font-mono tabular-nums">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "-"}</p>
          </div>
          <div>
            <p className="kicker mb-1">Document Type</p>
            <p className="text-[14px] font-mono">{submission.documentType || "N/A"}</p>
          </div>
          <div>
            <p className="kicker mb-1">Document Number</p>
            <p className="text-[14px] font-mono">{submission.documentNumber || "N/A"}</p>
          </div>
          <div>
            <p className="kicker mb-1">Country</p>
            <p className="text-[14px] font-mono">{submission.country}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-danger/5 border border-danger/20 p-4 mb-8">
          <p className="text-[12px] text-danger font-mono">{error}</p>
        </div>
      )}

      <div className="bg-surface border border-border p-8 space-y-6">
        <h2 className="kicker">Review Decision</h2>

        <div className="flex gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleReview("verified")}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => handleReview("rejected")}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block kicker">Rejection Reason (required if rejecting)</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason for rejection..."
            className="w-full bg-bg border border-border px-4 py-3 text-[14px] outline-none focus:border-accent resize-none"
          />
        </div>
      </div>
    </div>
  );
}
