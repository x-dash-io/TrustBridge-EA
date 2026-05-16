"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, AlertCircle, CheckCircle2 } from "lucide-react";

interface SmartSelfieCaptureProps {
  product?: string;
  onSuccess: (data: { jobId: string }) => void;
  onError: (error: string) => void;
  onClose?: () => void;
  userId?: string;
}

interface InitResponse {
  token: string;
  jobId: string;
  partnerId: string;
  environment: string;
  callbackUrl: string;
  _mock?: boolean;
}

declare global {
  interface Window {
    SmileIdentity?: (config: Record<string, unknown>) => void;
  }
}

export function SmartSelfieCapture({
  product = "smartselfie",
  onSuccess,
  onError,
  onClose,
}: SmartSelfieCaptureProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "capturing" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [initData, setInitData] = useState<InitResponse | null>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Get web token from server
        const res = await fetch("/api/kyc/smartselfie/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to initialize SmartSelfie");
        }

        const data: InitResponse = await res.json();
        if (!mounted) return;

        setInitData(data);

        if (data._mock) {
          setStatus("ready");
          return;
        }

        // Load the Smile Identity Web Widget script
        if (!scriptLoaded.current) {
          const script = document.createElement("script");
          script.src = "https://cdn.smileidentity.com/inline/v11/js/script.min.js";
          script.async = true;
          script.onload = () => {
            scriptLoaded.current = true;
            if (mounted) setStatus("ready");
          };
          script.onerror = () => {
            if (mounted) {
              setStatus("error");
              setErrorMessage("Failed to load Smile Identity SDK. Please check your internet connection and try again.");
            }
          };
          document.body.appendChild(script);
        } else {
          setStatus("ready");
        }
      } catch (err) {
        if (mounted) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Initialization failed");
        }
      }
    }

    init();

    return () => { mounted = false; };
  }, [product]);

  const startCapture = () => {
    if (!initData) return;

    if (initData._mock) {
      // Mock mode — simulate success
      setStatus("capturing");
      setTimeout(() => {
        setStatus("success");
        onSuccess({ jobId: initData.jobId });
      }, 2000);
      return;
    }

    setStatus("capturing");

    try {
      window.SmileIdentity?.({
        token: initData.token,
        product,
        callback_url: initData.callbackUrl,
        environment: initData.environment,
        partner_details: {
          partner_id: initData.partnerId,
          name: "TrustBridge EA",
          logo_url: `${window.location.origin}/brand-mark.svg`,
          policy_url: `${window.location.origin}/privacy`,
          theme_color: "#000000",
        },
        onSuccess: (data: { jobId?: string }) => {
          setStatus("success");
          onSuccess({ jobId: data?.jobId || initData.jobId });
        },
        onError: (error: { message?: string }) => {
          setStatus("error");
          const msg = error?.message || "Verification failed";
          setErrorMessage(msg);
          onError(msg);
        },
        onClose: () => {
          setStatus("ready");
          onClose?.();
        },
      });
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Failed to start capture";
      setErrorMessage(msg);
      onError(msg);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
        <p className="text-[13px] font-mono text-muted">Initializing secure verification...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-danger/5 border border-danger/20 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-danger mx-auto mb-4" />
        <p className="text-[14px] font-bold mb-3">Verification Error</p>
        <p className="text-[12px] text-muted font-sans mb-6">{errorMessage}</p>
        <Button variant="primary" onClick={() => setStatus("loading")}>
          Retry
        </Button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-success/5 border border-success/20 p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-4" />
        <p className="text-[16px] font-bold text-success">Liveness Check Complete</p>
        <p className="text-[12px] text-muted font-sans mt-2">Your identity has been verified successfully.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-bg border-2 border-dashed border-border rounded-full mx-auto mb-8 flex items-center justify-center">
        <Camera className="w-10 h-10 text-muted" />
      </div>
      <h3 className="font-display text-[22px] font-bold mb-3">Biometric Liveness Check</h3>
      <p className="text-[13px] text-muted max-w-md mx-auto mb-8 font-sans">
        Click the button below to start the secure face scan. You will be guided through the process by the Smile Identity verification widget.
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={startCapture}
        disabled={status === "capturing"}
        className="font-mono uppercase tracking-widest py-6 w-full"
      >
        {status === "capturing" ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Initializing...</>
        ) : (
          <><Camera className="w-4 h-4 mr-2" /> Start Face Scan</>
        )}
      </Button>
    </div>
  );
}
