import { type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { updateKycStatus } from "@/lib/db/queries/kyc";
import { logAuditEvent } from "@/lib/db/queries/audit";

/**
 * FIX BUG-04: Smile Identity webhook had zero signature verification.
 * Any actor could POST a fake "KYC approved" payload to elevate any user's
 * KYC tier without actually passing verification.
 *
 * Smile Identity signs callbacks with HMAC-SHA256 using the API key.
 * The signature is in the `signature` field of the payload body.
 * Verification: HMAC-SHA256(timestamp + partner_id + "sid_request", api_key)
 *
 * Reference: https://docs.usesmileid.com/further-reading/security
 */
function verifySmileIdSignature(
  signature: string,
  timestamp: string,
  partnerId: string,
  apiKey: string
): boolean {
  try {
    const message = `${timestamp}${partnerId}sid_request`;
    const expected = createHmac("sha256", apiKey).update(message).digest("base64");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Verify Smile Identity signature
  const apiKey = process.env.SMILE_ID_API_KEY;
  const partnerId = process.env.SMILE_ID_PARTNER_ID;

  if (!apiKey || !partnerId) {
    console.error("SMILE_ID_API_KEY or SMILE_ID_PARTNER_ID not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const signature = body.signature as string | undefined;
  const timestamp = body.timestamp as string | undefined;

  if (!signature || !timestamp) {
    await logAuditEvent({
      transactionId: null,
      actorId: null,
      actorRole: "system",
      action: "WEBHOOK_REJECTED_MISSING_SIGNATURE",
      metadata: { webhook: "smile_id" },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  if (!verifySmileIdSignature(signature, timestamp, partnerId, apiKey)) {
    await logAuditEvent({
      transactionId: null,
      actorId: null,
      actorRole: "system",
      action: "WEBHOOK_REJECTED_INVALID_SIGNATURE",
      metadata: { webhook: "smile_id", ip: request.headers.get("x-forwarded-for") },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2. Reject stale timestamps (5-minute window, prevents replay)
  const callbackAge = Date.now() - new Date(timestamp).getTime();
  if (Math.abs(callbackAge) > 5 * 60 * 1000) {
    return NextResponse.json({ error: "Timestamp out of acceptable range" }, { status: 401 });
  }

  try {
    const {
      ResultCode,
      ResultText,
      SmileJobID,
      PartnerParams,
      Actions,
    } = body as {
      ResultCode?: string;
      ResultText?: string;
      SmileJobID?: string;
      PartnerParams?: { transaction_id?: string; user_id?: string };
      Actions?: { Verify_ID_Number?: string; Liveness_Check?: string };
    };

    const submissionId = PartnerParams?.transaction_id;
    const userId = PartnerParams?.user_id;

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
    }

    const idVerified = Actions?.Verify_ID_Number === "Passed";
    // Liveness check is only present on biometric jobs — absence is not failure
    const livenessVerified =
      Actions?.Liveness_Check === "Passed" || Actions?.Liveness_Check === undefined;

    if (ResultCode === "0812" || (idVerified && livenessVerified)) {
      await updateKycStatus(submissionId, "verified");
      await logAuditEvent({
        transactionId: null,
        actorId: userId ?? null,
        actorRole: "user",
        action: "KYC_VERIFIED",
        metadata: { submissionId, smileJobId: SmileJobID, resultCode: ResultCode },
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      });
    } else {
      await updateKycStatus(submissionId, "rejected", ResultText || "Verification failed");
      await logAuditEvent({
        transactionId: null,
        actorId: userId ?? null,
        actorRole: "user",
        action: "KYC_REJECTED",
        metadata: { submissionId, smileJobId: SmileJobID, resultText: ResultText },
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("SmileID Webhook Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
