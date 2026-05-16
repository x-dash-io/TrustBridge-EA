import { createHmac, timingSafeEqual } from "crypto";

/**
 * FIX BUG-03 / BUG-12: M-Pesa STK and B2C webhooks had zero verification.
 * Any actor on the internet could POST a fake "payment succeeded" body and
 * trigger escrow funding or disbursement confirmation without paying.
 *
 * Safaricom Daraja does not currently sign webhook payloads with HMAC (unlike
 * some payment providers). The correct defence layers are:
 *
 * 1. IP allowlist — Only accept requests from Safaricom's published IP ranges.
 *    This is the PRIMARY control; implement at the load balancer / WAF level.
 *    See: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 *
 * 2. Secret URL token — The callback URL registered with Daraja embeds a secret
 *    path segment (e.g. /api/webhooks/mpesa/stk/[WEBHOOK_SECRET]). Any request
 *    to the correct URL without this token is rejected. This is implemented here.
 *
 * 3. Idempotency — CheckoutRequestID uniqueness is enforced at the DB layer to
 *    prevent replay attacks even if the URL leaks.
 *
 * When Safaricom introduces HMAC signing, replace verifyWebhookToken with
 * verifyHmacSignature below.
 */

/**
 * Verify that the inbound webhook request carries the correct secret token
 * embedded in the URL. Constant-time comparison prevents timing attacks.
 */
export function verifyWebhookToken(
  provided: string | null,
  expected: string | undefined
): boolean {
  if (!provided || !expected) return false;
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Generic HMAC-SHA256 verifier — ready for when Daraja adds signatures,
 * and used immediately for Smile Identity which does sign callbacks.
 */
export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Reject webhooks with a timestamp more than 5 minutes old.
 * Prevents replay attacks where a valid old payload is re-submitted.
 */
export function isTimestampFresh(
  timestampMs: number,
  windowMs = 5 * 60 * 1000
): boolean {
  return Math.abs(Date.now() - timestampMs) < windowMs;
}
