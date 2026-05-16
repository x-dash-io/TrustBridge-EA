# TrustBridge EA — AI Agent Prompt Packs
**Version 1.0 | Feed these prompts to Cursor, Claude Code, or any AI coding agent**

---

## HOW TO USE THESE PROMPTS

1. Always feed the **Context Block** first (Section 0) before any task prompt
2. Each prompt is self-contained — paste it as the first message in a new agent session
3. After each prompt, review the output, then commit before starting the next
4. If a prompt produces errors, paste the error back into the same session — don't start over

---

## SECTION 0 — CONTEXT BLOCK (Feed this before every session)

```
You are the Principal Software Architect and Lead FinTech Engineer for TrustBridge EA, a regulated, multi-asset escrow platform engineered specifically for the East African market, starting with Kenya. 

You approach every task with the absolute precision of an institutional banking systems architect, a strict cryptographic security auditor, and an elite front-end engineer obsessed with semantic HTML and exact pixel execution.

### Tech Stack Constraints (Non-Negotiable)
- Framework: Next.js 15 (App Router), TypeScript in strict mode.
- Styling: Tailwind CSS v4 utilizing pure CSS custom properties.
- Database & Backend: Supabase (Postgres, Auth, Storage) managed via Drizzle ORM.
- State Management: Zustand (client-side ephemeral state), TanStack Query v5 (server-side data synchronization).
- Form Architecture: React Hook Form coupled with Zod validation schemas.

### Database Protocol
- Never redefine data types or mock schemas inline.
- Always import tables, relations, and types directly from `lib/db/schema.ts` as specified in your repository structure (`02-TECH-SPEC.md`).

### Exact Design System Tokens & Typography (Match HTML Prototypes 1:1)
You must enforce these exact variables and rules. Never introduce rounded corners, ambient shadows, or unauthorized color variables.
- `--bg`: oklch(98% 0.004 95)        /* Paper white */
- `--surface`: oklch(100% 0.002 95)  /* Bright paper */
- `--fg`: oklch(20% 0.018 70)        /* Ink black */
- `--muted`: oklch(48% 0.012 70)     /* Dim ink */
- `--border`: oklch(90% 0.006 95)    /* Hairline */
- `--accent`: oklch(52% 0.10 28)     /* Oxblood red */
- `--success`: oklch(62% 0.17 145)
- `--warning`: oklch(75% 0.15 70)
- `--danger`: oklch(55% 0.22 25)

- Layout Rules:
  * Typography: Display/Headers = 'Iowan Old Style', 'Charter', Georgia, serif. Body = system-ui, sans-serif. Mono = ui-monospace, 'IBM Plex Mono', monospace.
  * Border Radius: Absolute zero throughout (`border-radius: 0` / `rounded-none`).
  * Borders: Hairline definition only (`1px solid var(--border)`).
  * Kicker Text: `.uppercase .font-mono .text-[11px] .tracking-[0.1em] .text-[var(--muted)]`
  * Shadows: Strictly zero. No elevation effects (`shadow-none`).

### Execution Guardrails
1. Currency: Always format Kenyan Shillings with the explicit `KSh` prefix using `font-variant-numeric: tabular-nums` (`tabular-nums` in Tailwind) and exactly 2 decimal places.
2. Code Quality: Explicit TypeScript types only. The `any` keyword is completely banned. 
3. Production Readiness: Write resilient error handling. Zero `console.log` statements are permitted in production code paths. Use structured logging or domain-specific exceptions.

---

## PROMPT 01 — Project Scaffold

```
Using the context block above, scaffold the TrustBridge EA Next.js 15 project.

Tasks:
1. Create the full folder structure as described in the TECH SPEC (apps/web/app/, components/, lib/, etc.)
2. Set up Tailwind CSS v4 with a globals.css that defines all CSS custom properties (--bg, --surface, --fg, --muted, --border, --accent, --success, --warning, --danger, and all font variables)
3. Create a root layout.tsx with proper meta tags (title: "TrustBridge — Secure Escrow for East Africa", description, viewport)
4. Create an (app) layout with the sidebar component. Sidebar must match the dashboard.html prototype exactly: 260px wide, surface background, hairline right border, logo in Iowan Old Style, nav links with active state (oxblood left border, 2px, on active item)
5. Create a middleware.ts that protects all routes under /(app)/* — redirect to /login if no Supabase session
6. Create a .env.example with all environment variable keys from the TECH SPEC (no values)
7. Create a drizzle.config.ts pointing to the schema file

Do NOT implement any page content yet — just the scaffold, layout, and navigation shell.
Sidebar nav items: Overview (/dashboard), Transactions (/transactions), Disputes, Identity & KYC, Notifications, Settings
```

---

## PROMPT 02 — Drizzle Schema

```
Using the context block above, implement the full Drizzle ORM schema for TrustBridge EA.

File location: apps/web/lib/db/schema.ts

Implement ALL these tables exactly as specified (copy the SQL from 02-TECH-SPEC.md and convert to Drizzle syntax):
- users
- businesses  
- transactions
- transaction_parties
- milestones
- payments
- disbursements
- kyc_submissions
- disputes
- dispute_messages
- dispute_evidence
- transaction_messages
- data_rooms
- data_room_files
- data_room_ndas
- audit_log
- agents
- agent_assignments
- notifications
- fx_rates

Also create:
- lib/db/index.ts — Drizzle client setup with Supabase connection string
- lib/db/queries/transactions.ts — typed query functions: getTransactionById, getTransactionsByUserId, createTransaction
- lib/db/queries/payments.ts — createPayment, updatePaymentStatus, getPaymentByCheckoutId
- lib/db/queries/audit.ts — logAuditEvent (INSERT only, never update)

Use pgTable from drizzle-orm/pg-core. Export all tables and inferred TypeScript types (use InferSelectModel and InferInsertModel).
```

---

## PROMPT 03 — Dashboard Page

```
Using the context block above, build the Dashboard page for TrustBridge EA.

File: apps/web/app/(app)/dashboard/page.tsx
This is a server component. Fetch real data from Supabase using the Drizzle queries.

Match the dashboard.html prototype EXACTLY in layout and visual language:
- Header: "Welcome back, [name]" kicker + "Dashboard" h1 in display font + "+ New Transaction" button (oxblood filled)
- Compliance banner: surface background, hairline border, "Account Verification Required" if kyc_tier < 2
- Stats grid (3 columns): Total in Escrow (sum of funded transactions), Active Transactions count, Pending Disputes count
- Active Transactions table: columns = ID (mono font), Counterparty, Asset/Service, Status (colored dot + mono text), Amount (tabular nums), Actions (Details link)
- Compliance indicators bar: GDPR, PCI, Audit Trail — show as SVG icon + label

Status dot colors: pending=warning, active=success, disputed=danger, completed=muted

Data requirements:
- transactions joined with transaction_parties where user is buyer or seller
- Sum amounts only for status IN ('funded', 'in_progress', 'in_inspection')
- Dispute count from disputes table where transaction owner = current user

Create companion component: components/transactions/transaction-status-badge.tsx
Props: status: TransactionStatus
Renders the colored dot + uppercase mono text badge. Reuse this component everywhere.
```

---

## PROMPT 04 — Transaction Creator Wizard

```
Using the context block above, build the Transaction Creator — a multi-step wizard.

Files:
- app/(app)/transactions/new/page.tsx — wizard shell
- components/transactions/transaction-creator/ — wizard step components

The wizard has 6 steps. Show a step indicator at the top (step number + label, hairline connector line between them, completed steps show checkmark, active step uses fg color).

STEP 1 — Asset Type
  Grid of asset class cards (2 columns). Each card: icon (SVG), title, description.
  Classes: Digital Assets, Physical Goods, Real Property, Legal Data Package, Business Acquisition, Professional Services
  Selecting a card highlights it with a fg border (1px solid var(--fg)).
  After selection, show a sub-class dropdown (e.g. for Digital: Domain Name, Social Account, Software License, Website/App)

STEP 2 — Transaction Details
  Fields: Title (text), Description (textarea), Currency selector (KES default, show flag emoji + code), Amount (number, formatted), Inspection Period (dropdown: 3/5/7/14 business days), Terms (textarea — plain language)
  Show live fee calculation below amount: "Escrow fee: KSh X,XXX (2.0%)" — update as user types
  If asset class = legal_data: show toggle "Include secure Data Room" (default ON)

STEP 3 — Milestones
  Default: single milestone (full amount, "Final Delivery")
  Button: "+ Add Milestone" — adds a new milestone row
  Each milestone row: Title (text), Amount (number), Due Date (date picker), Description (text). Show % of total next to amount.
  Validate: milestone amounts must sum to transaction total exactly.

STEP 4 — Invite Parties
  Show role cards: Seller (required), Agent/Inspector (optional), Lawyer/Notary (optional), Observer (optional)
  For each role: input for email or Kenyan phone number (+254...)
  Seller is always required before proceeding.

STEP 5 — Review & Sign
  Summary card showing all wizard selections (read-only).
  Checkbox: "I agree to TrustBridge Terms of Service and Escrow Agreement"
  Button: "Create Transaction & Send Invitations" — calls POST /api/transactions, then redirects to /transactions/[id]

STEP 6 — Success
  "Transaction Created" heading, transaction reference (TRX-XXXXX in mono font), list of invited parties with their email/phone, "Fund Escrow Now" CTA button → /payments/[id]

State: Use Zustand store for wizard state (persist across step navigation).
Validation: Zod schema per step, React Hook Form.
```

---

## PROMPT 05 — M-Pesa Payment Flow

```
Using the context block above, build the M-Pesa payment screen and integration.

Files:
- app/(app)/payments/[id]/page.tsx — payment screen
- app/api/payments/mpesa/stk-push/route.ts — STK push endpoint
- app/api/payments/mpesa/status/route.ts — polling endpoint
- app/api/webhooks/mpesa/stk/route.ts — Daraja callback
- lib/mpesa/daraja.ts — Daraja API client
- lib/mpesa/stk-push.ts — STK push function
- components/payments/mpesa-stk-flow.tsx — UI component

PAYMENT SCREEN (match payment.html visual language):
- Centered, max-width 600px
- TrustBridge logo at top
- Transaction summary box: Asset name, Amount, Escrow fee, Total (bold)
- Payment method selector (tabs or select): M-Pesa STK Push | Wire Transfer | USDC
- When M-Pesa selected, show: phone number input (pre-filled from user profile), formatted as +254 7XX XXX XXX, note: "We'll send a payment prompt to this number"
- Submit button: "Send M-Pesa Request" — oxblood filled

M-PESA FLOW STATES (show inline, don't navigate away):
1. idle → user fills phone, clicks button
2. sending → spinner, "Sending payment request..."
3. pending → animated pulse, "Check your phone — enter M-Pesa PIN to confirm" + countdown timer (3 min), "Cancel" link
4. polling → every 5 seconds call GET /api/payments/mpesa/status?checkoutRequestId=xxx
5. completed → success state: green checkmark SVG, "KSh X,XXX secured in escrow", "View Transaction" button
6. failed → error state: show ResultDesc from M-Pesa, "Try Again" button

BACKEND:
- POST /api/payments/mpesa/stk-push: validate session, validate amount ≤ 300000 KES, call Daraja STK push, store payment record, return checkoutRequestId
- GET /api/payments/mpesa/status: query payment record by checkoutRequestId, return {status, receipt?}
- POST /api/webhooks/mpesa/stk: HMAC verify not applicable for M-Pesa (they don't sign), validate ResultCode, update payment, queue funding job, log to audit_log

Wire transfer: show TrustBridge bank account details (KCB / Equity), reference = transaction ID, instruction to email remittance advice. Static screen.

Compliance footer (mono, 11px, muted): PCI-DSS COMPLIANT • AES-256 ENCRYPTION • CBK REGULATED ESCROW
```

---

## PROMPT 06 — Milestone Tracker

```
Using the context block above, build the Milestone Tracker component and integrate it into the Transaction Detail page.

Files:
- app/(app)/transactions/[id]/page.tsx — update to include milestone tracker
- components/transactions/milestone-tracker.tsx
- components/transactions/milestone-card.tsx
- app/api/milestones/[id]/deliver/route.ts
- app/api/milestones/[id]/accept/route.ts
- app/api/milestones/[id]/dispute/route.ts

MILESTONE TRACKER COMPONENT:
- Vertical timeline layout (left: thin vertical line, fg color, dots at each milestone)
- Each milestone card shows:
  - Order number (01, 02... in display font)
  - Title and description
  - Amount in KSh (tabular nums, bold) + percentage of total
  - Due date
  - Status badge (same TransactionStatusBadge component)
  - Progress: who needs to act next ("Awaiting seller delivery" / "Awaiting your approval" / "Released")
- Completed milestones: checkmark dot, muted text
- Current milestone: fg dot, full text, action buttons visible
- Future milestones: muted dot, muted text, locked

SELLER VIEW (when current user is seller):
- Active milestone shows: "+ Upload Deliverable" button → file upload dropzone (react-dropzone)
- Text notes field
- "Mark as Delivered" submit button
- After submit: status changes to 'delivered', buyer notified

BUYER VIEW (when current user is buyer):
- Active milestone in 'delivered' state shows: "Review Deliverables" link (opens uploaded files)
- Inspection period countdown (e.g. "3 days, 4 hours remaining")
- Two buttons: "✓ Accept & Release KSh X,XXX" (oxblood filled) | "Open Dispute" (danger outlined)
- Accept → confirm modal ("Are you sure? This will release KSh X,XXX to [Seller Name]") → POST /api/milestones/[id]/accept → triggers disbursement
- Dispute → opens dispute creation flow

API ROUTES:
- POST /api/milestones/[id]/deliver: verify sender is seller party, upload files to Supabase Storage under /milestones/[id]/, update milestone status to 'delivered', write audit log, send buyer notification (SMS + in-app)
- POST /api/milestones/[id]/accept: verify sender is buyer party, verify milestone status = 'delivered', update to 'accepted', queue disbursement job, write audit log, send seller notification
```

---

## PROMPT 07 — KYC / Identity Verification

```
Using the context block above, build the KYC / Identity Verification system.

Files:
- app/(app)/kyc/page.tsx — KYC dashboard (match kyc.html exactly)
- app/(app)/kyc/tier-2/page.tsx — Tier 2 submission flow
- app/api/kyc/submit/route.ts — submission endpoint
- app/api/webhooks/smile-id/route.ts — Smile Identity callback
- lib/kyc/smile-identity.ts — Smile Identity API client
- components/kyc/tier-status.tsx — tier display component
- components/kyc/upload-zone.tsx — document upload dropzone

KYC PAGE (match kyc.html):
- Three tier cards: Tier 1 (verified/active), Tier 2 (in_progress or locked), Tier 3 (locked)
- Each shows: limit amount in KSh, status badge, "Complete" button if actionable
- Right sidebar: GDPR compliance details, ISO/FCA badges

TIER 2 FLOW (3 steps):
Step 1 — Government ID
  - Document type selector: National ID | Passport | Driver's License | Alien ID
  - Front image upload (react-dropzone, accepts jpg/png/pdf, max 5MB)
  - Back image upload (for National ID)
  - ID number field
  - Country selector (Kenya, Uganda, Tanzania, Rwanda default; others available)

Step 2 — Liveness Check
  - "Start Face Scan" button
  - Integrate Smile Identity SmileLink (their web SDK) — it handles the camera capture
  - Show loading state while Smile processes
  - On success: green checkmark, "Liveness verified"

Step 3 — Proof of Address
  - Document type: Utility Bill | Bank Statement | Tax Document | Tenancy Agreement
  - Must be within last 90 days (validate date on submission)
  - File upload dropzone

SUBMISSION:
- On submit, call Smile Identity Enhanced KYC endpoint with: id_number, id_type, country, user_id, images
- Create kyc_submission record with smile_job_id
- Status: 'pending' until webhook fires

SMILE IDENTITY WEBHOOK:
- POST /api/webhooks/smile-id
- Parse payload: Actions.Verify_ID_Number, Actions.Return_Personal_Info, SmileJobID
- If all actions = 'Passed': update user kyc_tier to 2, kyc_status to 'verified', send congratulations email
- If any failed: update kyc_status to 'rejected', store rejection_reason, notify user

SECURITY: Smile Identity API key must only be used server-side. Never expose to client. All document uploads go directly to Supabase Storage with signed URLs (never through the app server — too slow for file uploads).
```

---

## PROMPT 08 — Data Room (Legal Data Package Transfer)

```
Using the context block above, build the Data Room feature for legal data package transactions.

Files:
- app/(app)/transactions/[id]/data-room/page.tsx
- components/data-room/nda-gate.tsx — blocks access until NDA signed
- components/data-room/vault-browser.tsx — file listing + download
- components/data-room/upload-panel.tsx — seller file upload
- app/api/data-room/[transactionId]/files/route.ts
- app/api/data-room/[transactionId]/sign-nda/route.ts
- app/api/data-room/[transactionId]/upload-url/route.ts — presigned URL for direct upload
- lib/vault/data-room.ts

BUYER FLOW:
1. NDA Gate: Full-screen overlay (surface background, fg border). Shows NDA text (scrollable, monospace font). Two buttons: "Download NDA" | "Sign & Access Data Room". Sign button → POST /api/data-room/[id]/sign-nda → records signature + timestamp + IP → unlocks vault.
2. Vault Browser: File list table (columns: File Name, Size, Uploaded By, Uploaded At, SHA-256 Hash, Download). Kicker above: "SECURE DATA VAULT — ACCESS LOGGED". Each download is logged to data_room_files.accessed_at. Show total file count and size.
3. Delivery confirmation button: "Confirm Data Received" → updates data_room status to 'delivered', triggers milestone completion.

SELLER FLOW:
1. Upload panel: react-dropzone, multiple files, up to 500MB total. Show upload progress bar (hairline, oxblood fill).
2. After upload: file appears in list with SHA-256 hash computed server-side.
3. "Lock & Notify Buyer" button → sets data_room status to 'active', notifies buyer that data is ready for review.
4. Status: show whether buyer has accessed files (accessed_at is set) and whether NDA has been signed.

SECURITY REQUIREMENTS (critical):
- Files stored at: data-rooms/[transactionId]/[fileId].[ext] in Supabase Storage
- Supabase RLS: only parties of the transaction can access these files
- Download URLs: use Supabase createSignedUrl() with 60-second expiry — never permanent public URLs
- Log every download: update data_room_files.accessed_at, write to audit_log
- File integrity: compute SHA-256 hash on upload (in the upload route), store in data_room_files.file_hash. Display to buyer so they can independently verify.
- Do not allow seller to delete files once buyer has been notified (enforce via RLS)
```

---

## PROMPT 09 — Dispute Module

```
Using the context block above, build the full Dispute Resolution module. Match dispute.html exactly in visual language.

Files:
- app/(app)/transactions/[id]/dispute/page.tsx — dispute view (for existing dispute)
- app/(app)/transactions/[id]/dispute/new/page.tsx — open a new dispute
- components/disputes/mediation-thread.tsx — chat interface
- components/disputes/evidence-locker.tsx — file evidence list
- app/api/disputes/route.ts — POST to create dispute
- app/api/disputes/[id]/messages/route.ts — GET messages, POST new message
- app/api/disputes/[id]/evidence/route.ts — POST upload evidence
- app/api/disputes/[id]/resolve/route.ts — POST resolve (mediator only)

OPEN DISPUTE FLOW (buyer or seller can open):
- Modal triggered from transaction page "Initiate Dispute" button
- Form: "Reason for dispute" (dropdown: Non-delivery | Item not as described | Transfer failed | Service not completed | Other) + "Describe the issue" (textarea, min 100 chars) + optional file upload
- POST /api/disputes: create dispute record, freeze any pending milestone releases, notify counterparty + assign mediator, write audit log

DISPUTE PAGE (match dispute.html):
- Header: case reference (DSP-XXXX mono), status badge (warning: "Under Mediation"), transaction title, parties involved
- Main column (2/3 width):
  1. Mediation Thread: scrollable chat, messages grouped by sender. Mediator messages have oxblood left border (3px). Timestamps in mono. New message textarea + submit.
  2. Evidence Locker: file list (name, uploader, timestamp), View link, "+ Upload Evidence" button
- Sidebar (1/3):
  1. Case Info card: Case ID, Transaction ID (link), Amount at Risk (bold, display font), Mediator name, Opened date
  2. Resolution Options: "Propose Settlement" | "Request Arbitration" buttons + explanatory text

REAL-TIME: Use Supabase Realtime to subscribe to new dispute_messages. When a new message arrives, append it to the thread without page reload. Show "New message" indicator if user has scrolled up.

RESOLUTION STATES: 
- open (bilateral, 0-72h): both parties can message, upload evidence
- under_mediation: mediator can also message and post resolution proposals
- resolved: show resolution outcome banner (who gets what), no more actions
```

---

## PROMPT 10 — Notifications System

```
Using the context block above, build the Notifications system.

Files:
- app/(app)/notifications/page.tsx — notifications center
- components/layout/notification-bell.tsx — sidebar/nav bell icon with unread count
- app/api/notifications/route.ts — GET notifications
- app/api/notifications/[id]/read/route.ts — mark read
- lib/notifications/dispatcher.ts — central notification dispatch function
- lib/notifications/sms.ts — Africa's Talking SMS
- lib/notifications/whatsapp.ts — Africa's Talking WhatsApp  
- lib/notifications/email.ts — Resend

NOTIFICATIONS PAGE:
- Header: "Notifications" h1
- Filter tabs (mono, uppercase): All | Unread | Transactions | Disputes | KYC
- Notification list: each item shows:
  - Unread indicator: 6px oxblood dot on left if unread
  - Icon (SVG, 20px) matching notification type
  - Title (bold if unread, normal if read)
  - Body text (muted, 14px, max 2 lines, truncate)
  - Transaction reference if linked (mono, muted)
  - Timestamp (mono, muted, relative: "2 hours ago")
  - Click → navigate to relevant page + mark as read
- "Mark all as read" link (top right, muted)

NOTIFICATION BELL (sidebar):
- Bell icon (Lucide)
- Red badge with count if unread > 0. Max display: "9+" 
- Use Supabase Realtime to subscribe to new notifications for current user

DISPATCHER (lib/notifications/dispatcher.ts):
```typescript
interface NotificationPayload {
  userId: string
  type: NotificationType
  title: string
  body: string
  transactionId?: string
  channels: ('sms' | 'whatsapp' | 'email' | 'in_app')[]
  metadata?: Record<string, unknown>
}

export async function dispatch(payload: NotificationPayload): Promise<void>
```

Call this from: payment completion, milestone delivery, dispute opening, KYC approval, etc.

NOTIFICATION TYPES (implement these first):
- transaction_funded: "Funds secured — KSh X,XXX is in escrow"
- milestone_delivered: "Delivery received — review and approve or dispute"
- milestone_accepted: "KSh X,XXX released to your account"
- dispute_opened: "A dispute has been opened on TRX-XXXX"
- kyc_approved: "Identity verified — Tier 2 unlocked"
- inspection_expiring: "Inspection period expires in 24 hours"

SMS (Africa's Talking): Keep under 160 chars. Include transaction ref.
WhatsApp: Richer messages with bold and line breaks. Include deeplink to app.
Email (Resend): Use React Email templates — match TrustBridge visual style.
```

---

## PROMPT 11 — FX Rates + Multi-Currency Engine

```
Using the context block above, build the multi-currency system.

Files:
- lib/fx/rates.ts — rate fetcher + Redis cache
- lib/fx/converter.ts — conversion utilities
- app/api/fx-rates/route.ts — public endpoint
- components/ui/currency-selector.tsx — currency picker component
- components/ui/amount-display.tsx — formatted amount display

RATE FETCHER (lib/fx/rates.ts):
- Fetch from ExchangeRate-API with KES as base
- Cache in Redis (Upstash) for 15 minutes
- Fallback: if API fails, use last cached rate + log warning
- Supported currencies: KES, UGX, TZS, RWF, USD, EUR, GBP
- On transaction creation: snapshot the rate and store in transactions.fx_rate_at_creation — never recalculate after this

CURRENCY SELECTOR COMPONENT:
- Dropdown/select input
- Shows: flag emoji + currency code + currency name
- KES is always first, then alphabetical
- Keyboard navigable

AMOUNT DISPLAY COMPONENT:
Props: amount: number, currency: string, size?: 'sm' | 'md' | 'lg'
- KES: "KSh 24,000.00"
- USD: "$24,000.00"
- UGX: "USh 89,000,000"
- TZS: "TSh 58,000,000"
- RWF: "RWF 27,000,000"
- All use tabular-nums font-variant
- Large size: display font (Iowan Old Style), normal = body font

CRON JOB (update fx_rates table every 15 min):
- Create a Vercel cron job at /api/cron/fx-rates (GET, secured with CRON_SECRET header)
- Fetch fresh rates, upsert into fx_rates table
- Vercel cron config in vercel.json: { "crons": [{ "path": "/api/cron/fx-rates", "schedule": "*/15 * * * *" }] }
```

---

## PROMPT 12 — Audit Trail Viewer

```
Using the context block above, build the Audit Trail Viewer.

Files:
- app/(app)/transactions/[id]/audit/page.tsx
- components/audit/audit-timeline.tsx
- app/api/audit/[transactionId]/route.ts

AUDIT TRAIL PAGE:
- Kicker: "IMMUTABLE AUDIT TRAIL"
- H1: "Transaction Log — TRX-XXXX"
- Export button: "Export PDF" (top right) — generates a PDF of the log
- Timeline: vertical list, each entry:
  - Timestamp (mono, left column, fixed width): "2026-08-04 14:23:07 UTC"
  - Actor badge: user name + role (e.g. "Arthur V. (Buyer)")
  - Action (bold): human-readable action name
  - Details (muted, 13px): relevant metadata (amounts, file names, IP address)
  - Hash (mono, 10px, muted): first 16 chars of SHA-256 of the log entry — shows tamper evidence
- System events (no actor): show "TrustBridge System" with a shield icon

Action types to display nicely:
- transaction_created → "Transaction Created"
- funds_received → "KSh X,XXX received from [Payment Method]"
- milestone_delivered → "[Seller] marked Milestone X as delivered"
- milestone_accepted → "[Buyer] approved Milestone X — KSh X,XXX queued for release"
- funds_released → "KSh X,XXX disbursed via [Method]"
- dispute_opened → "Dispute opened by [Party]"
- kyc_verified → "Identity Tier 2 verified"
- nda_signed → "[Buyer] signed Data Room NDA"
- data_accessed → "[Buyer] downloaded [filename]"

HASH COMPUTATION (lib/audit/logger.ts):
```typescript
import { createHash } from 'node:crypto'

export async function logAuditEvent({ transactionId, actorId, actorRole, action, metadata, ipAddress }) {
  const entryData = JSON.stringify({ transactionId, actorId, action, metadata, timestamp: new Date().toISOString() })
  const hash = createHash('sha256').update(entryData).digest('hex')
  
  await db.insert(auditLog).values({
    transactionId, actorId, actorRole, action,
    metadata, ipAddress,
    // Store hash in metadata for display
  })
}
```
The hash proves the entry content at the time of writing. If anyone modifies the DB row, the displayed hash won't match.
```

---

## PROMPT 13 — Agent Assignment System

```
Using the context block above, build the Agent Assignment system for physical goods transactions.

Files:
- app/(app)/transactions/[id]/agent/page.tsx — buyer view of agent assignment
- app/(app)/agent/ — agent portal (separate section, agents are also users with agent record)
  - app/(app)/agent/dashboard/page.tsx
  - app/(app)/agent/assignments/[id]/page.tsx
- components/agents/agent-card.tsx
- components/agents/inspection-report-form.tsx
- app/api/agents/assign/route.ts
- app/api/agents/assignments/[id]/accept/route.ts
- app/api/agents/assignments/[id]/submit-report/route.ts

AGENT ASSIGNMENT (triggered automatically for physical goods transactions):
- On transaction creation with assetClass = 'physical': auto-find nearest available agent by county + asset_class capability
- If no agent available: show "No agent available in your area — request manual assignment" with form
- Agent assigned → notify agent via SMS + WhatsApp + in-app

BUYER VIEW:
- Agent card: agent name, rating (X.X/5 with star SVG), counties covered, asset classes, profile photo
- Assignment status: "Agent assigned" → "Inspection scheduled" → "Inspection complete"
- View inspection report when submitted (photos, notes, GPS coordinates on map embed)

AGENT ASSIGNMENT PAGE (for the agent):
- List of pending assignments with asset type, location, buyer name, transaction amount
- "Accept" button → status = accepted, buyer notified
- "Submit Inspection Report" form:
  - Text notes (textarea)
  - Photo uploads (up to 10 photos, each max 5MB)
  - GPS capture button (use browser Geolocation API → store lat/lng)
  - Condition rating: Excellent | Good | Fair | Poor | Not as Described
  - Recommendation: Approve Release | Request Re-inspection | Reject (flag dispute)
  - Submit → status = completed, buyer and seller notified, buyer gets 48h to review report

AGENT DASHBOARD:
- Stats: Pending Assignments, Completed This Month, Avg Rating
- Assignment table same style as main dashboard transaction table
```