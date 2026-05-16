# Security Fix Log — TrustBridge EA
**Date:** May 2026 | **Engineer:** Forensic Review  
**Status:** In Progress

## Bugs Fixed (this session)

### CRITICAL
- [x] **BUG-01** `current-user.ts`: Module-level singleton `_currentUser` causes cross-request user contamination in serverless. Removed entirely; every call now fetches fresh from Supabase.
- [x] **BUG-02** `requirePermission()` called before null-check in all admin routes — throws unhandled error instead of 401 on unauthenticated requests. `authorize.ts` now handles null gracefully; admin routes fixed.
- [x] **BUG-03** M-Pesa STK webhook (`/api/webhooks/mpesa/stk`) has zero HMAC verification — any actor can POST a fake "payment received" and trigger escrow funding. HMAC + timestamp replay protection added.
- [x] **BUG-04** Smile Identity webhook (`/api/webhooks/smile-id`) has zero signature verification — any actor can POST a fake KYC approval. Signature verification added.
- [x] **BUG-05** STK Push route never verifies the caller is the transaction's buyer — any authenticated user can initiate payment on any transaction. Party membership check added.
- [x] **BUG-06** Dispute GET returns full dispute to any authenticated user — no party membership check. Ownership enforcement added.
- [x] **BUG-07** File uploads (dispute evidence + data room) accept any file type and any size with no validation. MIME allowlist, magic-byte check, and 20MB size cap added.
- [x] **BUG-08** Data room file download has no party or NDA check — any authenticated user can download sensitive documents. Party + NDA signed check added.
- [x] **BUG-09** `fileHash` hardcoded to `""` in data room uploads — file integrity unverifiable. SHA-256 hash computed on upload.
- [x] **BUG-10** Fee calculation is `null` at transaction creation — fees never applied. Server-side fee computation using `calcFeeRate()` added to POST /api/transactions.
- [x] **BUG-11** `requirePermission(user, "*", ...)` — wildcard `"*"` passed as a permission string, always grants access. Signature changed to `requirePermission(user, permission1, permission2)`.
- [x] **BUG-12** B2C webhook: no HMAC verification, same class of vulnerability as STK webhook. Fixed.
