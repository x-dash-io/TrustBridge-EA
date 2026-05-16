import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[120px] font-bold text-accent leading-none tracking-tight mb-2">
          404
        </p>
        <p className="kicker mb-8">Resource Not Found</p>

        <div className="bg-surface border border-border p-8 mb-10">
          <p className="text-[14px] text-muted font-sans leading-relaxed mb-6">
            The requested resource does not exist or has been moved. This event has been logged for audit purposes.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-accent text-white text-center py-4 font-mono uppercase tracking-wider text-[12px] font-bold hover:bg-accent/90 transition-colors"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full border border-border text-center py-4 font-mono uppercase tracking-wider text-[12px] font-bold text-muted hover:text-accent hover:border-accent transition-colors"
            >
              Visit Home Page
            </Link>
          </div>
        </div>

        <p className="text-[10px] font-mono text-muted">
          REF: ERR-{Date.now().toString(36).toUpperCase()} • TRUSTBRIDGE EA • AUDITED
        </p>
      </div>
    </div>
  );
}
