"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, AlertTriangle, Scale, Clock, Upload, FileText, Download, ChevronDown, ChevronRight, Shield } from "lucide-react";
import { Kicker } from "@/components/ui/kicker";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DisputeDetail {
  dispute: {
    id: string;
    reference: string;
    transactionId: string;
    transactionRef: string;
    title: string;
    status: string;
    resolutionTier: number;
    openedAt: string;
  };
  messages: Array<{
    id: string;
    senderId: string;
    senderRole: string;
    body: string;
    createdAt: string;
  }>;
  evidence: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    uploadedBy: string;
    createdAt: string;
  }>;
}

export default function DisputeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);

  const { data, isLoading, error } = useQuery<DisputeDetail>({
    queryKey: ["dispute", id],
    queryFn: async () => {
      const res = await fetch(`/api/disputes/${id}`);
      if (!res.ok) throw new Error("Failed to load dispute");
      return res.json();
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch(`/api/disputes/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, senderRole: "buyer" }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["dispute", id] });
    },
  });

  const uploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/disputes/${id}/evidence`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload evidence");
      queryClient.invalidateQueries({ queryKey: ["dispute", id] });
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto py-12 px-4">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-[1000px] mx-auto py-12 px-4">
        <ErrorMessage message="Failed to load dispute resolution case." />
      </div>
    );
  }

  const { dispute, messages, evidence } = data;
  const sortedMessages = [...messages].reverse();

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <Link
        href="/disputes"
        className="inline-flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Resolution Center
      </Link>

      {/* Dispute Header */}
      <div className="border-b border-border pb-10 mb-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-tight border",
                dispute.status === "mediation" ? "bg-accent/5 border-accent text-accent" :
                dispute.status === "open" ? "bg-warning/5 border-warning text-warning" :
                "bg-success/5 border-success text-success"
              )}>
                {dispute.status}
              </div>
              <p className="kicker">Ref: {dispute.reference}</p>
            </div>
            <h1 className="font-display text-[36px] font-bold tracking-tight mb-2">
              {dispute.title}
            </h1>
            <div className="flex items-center gap-6 text-[12px] text-muted font-mono uppercase tracking-tight">
              <span className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Opened {new Date(dispute.openedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span className="flex items-center gap-2">
                <Scale className="w-3 h-3" />
                Tier {dispute.resolutionTier} Resolution
              </span>
              <Link
                href={`/transactions/${dispute.transactionId}`}
                className="text-accent hover:underline"
              >
                Transaction {dispute.transactionRef}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main: Messaging Thread */}
        <div className="lg:col-span-2">
          <h2 className="kicker mb-6">Mediation Thread</h2>

          <div className="bg-surface border border-border mb-6 max-h-[500px] overflow-y-auto">
            {sortedMessages.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-8 h-8 text-muted mx-auto mb-4" />
                <p className="text-[14px] text-muted">No messages yet. Start the mediation conversation.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedMessages.map((msg) => (
                  <div key={msg.id} className="p-6 hover:bg-muted/5 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn(
                        "text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1",
                        msg.senderRole === "mediator" ? "bg-accent/10 text-accent" :
                        msg.senderRole === "buyer" ? "bg-fg/10 text-fg" :
                        "bg-muted/10 text-muted"
                      )}>
                        {msg.senderRole}
                      </span>
                      <span className="text-[11px] text-muted font-mono">
                        {new Date(msg.createdAt).toLocaleString("en-KE")}
                      </span>
                    </div>
                    <p className="text-[14px] leading-relaxed font-sans">{msg.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your mediation message..."
              rows={3}
              className="flex-1 bg-bg border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors resize-none font-sans"
            />
            <Button
              variant="primary"
              onClick={() => newMessage.trim() && sendMessage.mutate(newMessage.trim())}
              disabled={!newMessage.trim() || sendMessage.isPending}
              className="font-mono uppercase tracking-[0.2em] self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar: Evidence & Case Info */}
        <div className="space-y-8">
          {/* Evidence Vault */}
          <div className="bg-surface border border-border">
            <button
              onClick={() => setShowEvidencePanel(!showEvidencePanel)}
              className="w-full p-6 flex items-center justify-between hover:bg-muted/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted" />
                <h3 className="kicker">Evidence Vault</h3>
              </div>
              {showEvidencePanel ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
            </button>

            {showEvidencePanel && (
              <div className="border-t border-border p-6 space-y-4">
                {evidence.length === 0 ? (
                  <p className="text-[12px] text-muted font-mono">No evidence submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {evidence.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between p-3 bg-bg border border-border">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-muted flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold truncate">{ev.fileName}</p>
                            <p className="text-[10px] text-muted font-mono">
                              {ev.fileSize ? `${(ev.fileSize / 1024).toFixed(1)} KB` : "N/A"}
                            </p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-muted hover:text-accent cursor-pointer flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                <label className="block">
                  <div className="flex items-center justify-center gap-2 p-4 border border-dashed border-border hover:border-accent cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-muted" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted">
                      Upload Evidence
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={uploadEvidence}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Resolution Info */}
          <div className="bg-surface border border-border p-6">
            <h3 className="kicker mb-4">Resolution Protocol</h3>
            <div className="space-y-3 text-[13px] font-sans leading-relaxed">
              <p className="text-muted">
                <strong className="text-fg">Tier {dispute.resolutionTier}:</strong>{" "}
                {dispute.resolutionTier === 1
                  ? "Automated mediation. Both parties present their case. System suggests a fair split."
                  : dispute.resolutionTier === 2
                  ? "Neutral mediator assigned. Binding recommendation within 5 business days."
                  : "Arbitration panel. Final binding decision within 10 business days."}
              </p>
              <p className="text-[11px] text-muted font-mono">
                Funds remain in escrow until resolution is accepted by all parties.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href={`/transactions/${dispute.transactionId}`}>
              <Button variant="outline" className="w-full font-mono text-[11px] uppercase tracking-widest border-border">
                View Related Transaction
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
