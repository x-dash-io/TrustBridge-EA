"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[120px] font-bold text-danger leading-none tracking-tight mb-2">
          500
        </p>
        <p className="kicker mb-8">System Error</p>

        <div className="bg-surface border border-border p-8 mb-10">
          <p className="text-[14px] text-muted font-sans leading-relaxed mb-6">
            An unexpected system error occurred. Our compliance team has been notified and the event has been recorded in the audit log.
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-accent text-white py-4 font-mono uppercase tracking-wider text-[12px] font-bold hover:bg-accent/90 transition-colors"
            >
              Retry Operation
            </button>
            <Link
              href="/dashboard"
              className="block w-full border border-border text-center py-4 font-mono uppercase tracking-wider text-[12px] font-bold text-muted hover:text-accent hover:border-accent transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>

        <p className="text-[10px] font-mono text-muted">
          REF: ERR-{error.digest || Date.now().toString(36).toUpperCase()} • TRUSTBRIDGE EA • AUDITED
        </p>
      </div>
    </div>
  );
}
