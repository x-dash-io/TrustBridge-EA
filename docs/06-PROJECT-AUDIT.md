# TrustBridge Project Audit

**Date**: 2026-05-16  
**Last Updated**: 2026-05-16 (Major update — Phase 1-4 implemented)  
**Overall completion**: ~80-85%

---

## DONE (100%)

### UI Primitives

| Component | Status | Notes |
|---|---|---|
| Button | DONE | 6 variants (primary, secondary, danger, ghost, outline, accent), 4 sizes (sm, md, lg, icon) |
| Card | DONE | 3 padding variants, 3 visual variants (default, bordered, accent) |
| Input | DONE | Label, error, kicker support; ref forwarding |
| Select | DONE | Label, error, kicker, custom chevron icon |
| Kicker | DONE | Typographic label component |
| LoadingSkeleton | DONE | 4 variants (basic, table, card, header) |
| ErrorMessage | DONE | Inline and block variants with retry button |
| EmptyState | DONE | Icon, title, description, optional action link |

**Path**: `src/components/ui/`

---

### Layout

| Component | Status | Notes |
|---|---|---|
| Sidebar | DONE | Collapsible (280px ↔ 72px), brand header, nav items, user footer with masked email, sign-out |
| TopNav | DONE | Breadcrumbs, search bar (opens CommandCentre), notification bell, "New Escrow" button |
| Command Centre | DONE | ⌘K palette with search, keyboard navigation, ESC to close |
| App layout | DONE | Sidebar + TopNav + main content area (fixed, only content scrolls) |
| Marketing layout | DONE | Header nav (Pricing / How It Works / Asset Types) + footer |

**Paths**: `src/components/layout/sidebar.tsx`, `top-nav.tsx`, `command-centre.tsx`, `src/app/(app)/layout.tsx`, `src/app/(marketing)/layout.tsx`

---

### Transaction Wizard (6-Step Creator)

| Component | Status | Notes |
|---|---|---|
| Step 0: Asset Type | DONE | 6 asset classes with icons, subclass selector per class |
| Step 1: Details | DONE | Title, amount/currency, fee audit card, inspection period, data room toggle |
| Step 2: Milestones | DONE | Dynamic milestone list with allocation auditor, add/remove, sum validation |
| Step 3: Parties | DONE | Seller (required) + optional Agent, Lawyer, Observer; email/phone per party |
| Step 4: Review | DONE | Complete summary of all data, legal consent checkbox |
| Step 5: Success | DONE | Confirmation with transaction ref, notification dispatch list, links to fund/payment |
| Step indicator | DONE | Visual progress bar with active/completed/locked states |
| Zustand store | DONE | Full state management with all fields and actions |

**Note**: Step 4's "Authorize & Dispatch" does NOT POST to any API — `transactionId` is set to `"new-" + Date.now()`. No data is persisted.

**Paths**: `src/components/transactions/transaction-creator/*.tsx`, `src/stores/wizard-store.ts`, `src/app/(app)/transactions/new/page.tsx`

---

### Transaction List & Detail

| Component | Status | Notes |
|---|---|---|
| Transaction list page | DONE | Server component with heading + client component |
| Transaction list client | DONE | Search, status filter dropdown, table (reference/details/amount/status/action) |
| Transaction detail page | DONE | Header, metadata grid, milestone tracker, parties sidebar, funding CTA |
| Milestone card | DONE | Vertical timeline with deliverable upload, accept/release, dispute actions |

**Note**: Pagination buttons rendered but always disabled.

**Paths**: `src/app/(app)/transactions/page.tsx`, `src/app/(app)/transactions/[id]/page.tsx`, `src/components/transactions/*.tsx`

---

### Payments / M-Pesa

| Component | Status | Notes |
|---|---|---|
| Daraja client | DONE | Token caching, base URL switching (sandbox/production) |
| STK Push initiation | DONE | Full Daraja STK Push workflow with password generation |
| B2C disbursement | DONE | Full Daraja B2C workflow |
| API POST /api/payments/mpesa/stk-push | DONE | Zod validation, transaction check, Daraja call, DB insert, audit log |
| API GET /api/payments/mpesa/status | DONE | Payment lookup by checkout request ID |
| Webhook /api/webhooks/mpesa/stk | DONE | Result parsing, receipt capture, status update, audit log |
| M-Pesa STK flow component | DONE | Full state machine (idle/sending/pending/completed/failed), polling, countdown timer |
| Payment screen | DONE | M-Pesa, Wire Transfer, USDC methods with details |
| Wire transfer details | DONE | KCB + Equity bank account info |
| USDC details | DONE | Solana + Polygon wallet addresses |
| Database queries | DONE | Full CRUD for payments + disbursements |

**Paths**: `src/lib/mpesa/*.ts`, `src/app/api/payments/mpesa/*`, `src/components/payments/mpesa-stk-flow.tsx`, `src/app/(app)/payments/[id]/*`

---

### Validation Utilities

| Piece | Status | Notes |
|---|---|---|
| phoneSchema | DONE | Kenyan phone regex (+254 or 0 prefix) |
| emailSchema | DONE | Standard email validation |
| passwordSchema | DONE | Min 8 characters |
| amountSchema | DONE | Positive number |
| transactionTitleSchema | DONE | Min 5 characters |
| sanitizePhone | DONE | Converts 0 prefix to 254, strips + |
| formatPhone | DONE | Formats to +254 XXX XXX XXX |
| filterPhoneInput | DONE | Strips non-digit/non-+ chars on keystroke |

**Path**: `src/lib/validation.ts`

---

### Database Schema

18 tables fully defined with proper relations, constraints, and TypeScript types:

| Table | Purpose |
|---|---|
| users | KYC tier, status, preferred currency |
| businesses | KRA PIN, registration number |
| transactions | Full escrow contract fields |
| transactionParties | Roles, invite status, signing |
| milestones | Ordered, amount/percentage, state timestamps |
| payments | Method-aware, M-Pesa fields, metadata |
| disbursements | M-Pesa, bank account support |
| kycSubmissions | Smile ID job tracking |
| disputes | Resolution tiers, mediation |
| disputeMessages | Chat log |
| disputeEvidence | File metadata |
| transactionMessages | General messaging |
| dataRooms | NDA template, status |
| dataRoomFiles | File hash, delivery/access tracking |
| dataRoomNdas | Signature data, IP, UA |
| auditLog | Append-only event log |
| agents | Counties, asset classes, rating, lat/lng |
| agentAssignments | Inspection notes, GPS, photos |
| notifications | Multi-channel, read tracking |
| fxRates | Unique currency pair index |

**Path**: `src/lib/db/schema.ts`

---

### Database Queries

| File | Functions | Purpose |
|---|---|---|
| transactions.ts | 7 | CRUD, parties, role-based lookup |
| kyc.ts | 3 | Create, status update, latest lookup |
| payments.ts | 5 | CRUD + dual status update methods |
| milestones.ts | 4 | By transaction, by ID, status update |
| users.ts | 1 | Get by ID |
| audit.ts | 2 | Log event, get by transaction |
| disbursements.ts | 2 | Create, by milestone |

**Path**: `src/lib/db/queries/*.ts`

---

### API Routes

| Route | Method | Status | Notes |
|---|---|---|---|
| /api/transactions | GET | DONE | List with status filter + mock fallback |
| /api/transactions/recent | GET | DONE | Dashboard recent transactions + mock fallback |
| /api/disputes | GET | DONE | Mock data only |
| /api/payments/mpesa/stk-push | POST | DONE | Full implementation with Zod validation |
| /api/payments/mpesa/status | GET | DONE | Payment status lookup |
| /api/kyc/submit | POST | DONE | KYC submission with Smile Identity |
| /api/webhooks/smile-id | POST | DONE | Smile Identity callback handler |
| /api/webhooks/mpesa/stk | POST | DONE | M-Pesa STK callback handler |
| /api/milestones/[id]/accept | POST | DONE | Auth, DB update, B2C, audit |
| /api/milestones/[id]/deliver | POST | DONE | File upload to Supabase Storage, status update |
| /api/milestones/[id]/dispute | POST | DONE | Dispute creation in DB |

**Previously Missing (Now Implemented)**:
  - POST /api/transactions — Zod validation, creates tx + milestones + parties + audit log
  - GET /api/transactions/[id]/data-room — List files with data room metadata
  - POST /api/transactions/[id]/data-room — Upload file to Supabase Storage + DB record
  - POST /api/transactions/[id]/data-room/nda — Sign NDA, unlock data room, audit log
  - GET /api/transactions/[id]/data-room/[fileId]/download — Download file with audit trail
  - GET /api/notifications — List notifications with pagination + unread count
  - PATCH /api/notifications — Mark single/all notifications as read
  - GET /api/disputes/[id] — Dispute detail with messages + evidence
  - GET/POST /api/disputes/[id]/messages — Dispute messaging thread
  - GET/POST /api/disputes/[id]/evidence — Evidence upload with storage
  - GET /api/dashboard/stats — Real dashboard statistics from DB

---

### Documentation

| File | Lines | Content |
|---|---|---|
| docs/01-PRD.md | 481 | Product requirements, market context, personas, feature specs |
| docs/02-TECH-SPEC.md | 770 | Stack, architecture, folder structure, data models, API contracts, security |
| docs/03-AI-AGENT-PROMPTS.md | 614 | Copy-paste prompt packs for each build task |
| docs/04-MANUAL-TASKS.md | 307 | Legal/regulatory/banking setup |
| docs/05-TEAM-RESEARCH-REPORT.md | 288 | Market research, competitive landscape, EA context |
| docs/06-PROJECT-AUDIT.md | — | This file |
| LEGAL-GUIDE.md | 265 | Lawyer engagement, 8 required legal documents |
| brand-spec.md | 29 | Design tokens, component spec |
| README.md | 75 | Master document index, team structure, critical path |

---

### Color System

Primary highlight color changed from `fg` (black) to `accent` (oxblood) across the entire system (buttons, active states, focus rings, hover reveals, selected items, badges, progress bars). Inline `var(--color-fg)` usages in payment pages also migrated to `var(--color-accent)`.

---

## PARTIAL

### Auth (85%)
- **Done**: Login (email/password + phone OTP tab via Supabase Auth), register, Supabase auth actions, middleware, forgot-password page, email verify page, phone OTP handler
- **Missing**: MFA not started

### Dashboard (100%)
- **Done**: Stats row with real API data (/api/dashboard/stats), recent transactions table, KYC upgrade card, quick actions sidebar
- **Missing**: None

### KYC (80%)
- **Done**: 4 tiers displayed, Tier 2 flow (3-step UI), Tier 3 flow (Enhanced Due Diligence with source of funds/PEP declaration), Tier 4/KYB (business verification with KRA PIN, registration, director docs), upload zone component, Smile Identity client
- **Missing**: "Start Face Scan" is UI-only (no Smile Identity SDK integration)

### Data Room (100%)
- **Done**: NDA gate component, file vault component, full schema, upload/list/download API routes, Supabase Storage integration, NDA signing persisted to DB with audit log

### Disputes (90%)
- **Done**: Dispute list page, detail page with full messaging thread, evidence upload UI, API endpoints for messages/evidence CRUD, audit logging

### Notifications (80%)
- **Done**: Notification page with real API, read/unread toggle, mark-all-read, type-specific icons, transaction links, notification dispatcher library, schema
- **Missing**: In-app bell dropdown in TopNav, preferences/settings page

### Infrastructure (30%)
- **Done**: next.config, tsconfig (strict), drizzle.config, postcss.config, .env.example (54 vars), .gitignore
- **Missing**: No tests (zero test files), no Docker, no CI/CD (GitHub Actions), no Redis/BullMQ workers, Framer Motion/Recharts/TanStack Table listed but unused

---

## NOT STARTED

### Marketing Pages — COMPLETE
- Landing page: Full hero, features grid, asset classes, CTA section
- Pricing: 3 tiers (Standard/Professional/Enterprise) with feature comparison
- How It Works: 6-step process with detailed explanation
- Asset Types: 6 asset classes with examples and fee ranges

### Missing Pages (Remaining)
- Settings page (placeholder only)
- Agent network map (not started)
- Fee calculator (not started)

### Missing API Routes (Remaining)
- POST /api/webhooks/mpesa/b2c — B2C result callback
- POST /api/webhooks/flutterwave — Flutterwave payment webhooks
- GET /api/fx-rates — FX rates endpoint
- POST /api/businesses — KYB business registration

### Missing Features (Remaining)
- In-app bell dropdown in TopNav
- Agent assignment system (all pages, components, API routes)
- FX rates engine (fetcher, converter, API endpoint, cron job)
- Audit trail viewer page + timeline component + hash verification
- Tests (unit + integration + E2E)
- Docker + CI/CD setup
- Framer Motion page transitions

---

## GAP ANALYSIS / NEXT STEPS

### ✅ RESOLVED (Phase 1-4)
1. POST /api/transactions route — fully implemented with Zod validation
2. Forgot-password & verify email pages — both created with Supabase Auth
3. Marketing pages — landing, pricing, how-it-works, assets all built
4. Data room API routes + Supabase Storage integration — complete CRUD
5. Notification center UI + API — full page with read/unread, type icons
6. Transaction pagination — functional with page/limit/offset
7. Dispute detail page — messaging + evidence upload working
8. KYC Tiers 3 & 4 flows + KYB — both pages created
9. Dashboard real data — /api/dashboard/stats returns live DB stats
10. Phone OTP handler — uses Supabase Auth signInWithOtp

### Remaining Work
11. **Tier 2 KYC liveness** — "Start Face Scan" does nothing (needs Smile Identity SDK)
12. **In-app bell dropdown** in TopNav for notification count/preview
13. **Settings page** — currently placeholder
14. **FX rates engine** — fetcher, converter, API endpoint
15. **Agent assignment system** — all pages, components, API routes
16. **Audit trail viewer** — timeline component + hash verification
17. **Tests** — unit + integration + E2E (zero test files currently)
18. **Docker + CI/CD** — no Dockerfile, no GitHub Actions
19. **Framer Motion** — for page transitions (unused despite being listed)
20. **Recharts** — for data visualization (unused despite being listed)
21. **Redis/BullMQ** — for async job processing

---

## Files Changed (Recent Session)

- `apps/web/src/components/ui/button.tsx` — swapped fg ↔ accent, updated variant hover states
- `apps/web/src/components/ui/card.tsx` — bordered variant: `border-fg` → `border-accent`
- `apps/web/src/components/ui/input.tsx` — `focus:border-fg` → `focus:border-accent`
- `apps/web/src/components/ui/select.tsx` — `focus:border-fg` → `focus:border-accent`
- `apps/web/src/components/layout/sidebar.tsx` — active nav + brand box: `bg-fg` → `bg-accent`, hover text `text-fg` → `text-accent`
- `apps/web/src/components/layout/top-nav.tsx` — search bar: button → input, hover/focus: `fg` → `accent`
- `apps/web/src/components/layout/command-centre.tsx` — `bg-fg` → `bg-accent`, `border-fg` → `border-accent`, ref-based open state for reliability
- `apps/web/src/components/dashboard/dashboard-client.tsx` — KYC card: `bg-fg` → `bg-accent`, button: `text-accent` → `text-fg`, icon: `text-accent` → `text-white/80`
- `apps/web/src/components/transactions/transaction-creator/*.tsx` — indicator, milestones, asset-type, details, parties, review, success
- `apps/web/src/components/transactions/data-room/*.tsx` — nda-gate, file-vault
- `apps/web/src/components/transactions/milestone-card.tsx` — timeline dots, current border, drag zones
- `apps/web/src/components/transactions/transaction-list-client.tsx` — focus/hover states
- `apps/web/src/components/kyc/upload-zone.tsx` — drag active: `fg` → `accent`
- `apps/web/src/components/disputes/dispute-list-client.tsx` — hover text
- `apps/web/src/components/payments/mpesa-stk-flow.tsx` — `var(--color-fg)` → `var(--color-accent)`
- `apps/web/src/app/(app)/layout.tsx` — unchanged
- `apps/web/src/app/(app)/kyc/page.tsx` — compliance badges, help icon
- `apps/web/src/app/(app)/kyc/tier-2/page.tsx` — progress bar, ID type selector, focus border
- `apps/web/src/app/(app)/transactions/[id]/page.tsx` — action required card
- `apps/web/src/app/(app)/payments/[id]/payment-screen.tsx` — method toggle active state
- `apps/web/src/app/(auth)/login/page.tsx` — toggle buttons, submit button, recover link
- `apps/web/src/app/(auth)/register/page.tsx` — submit button, focus borders
- `apps/web/src/app/(marketing)/layout.tsx` — nav link hover states
- `.gitignore` — created with sensitive file patterns
- `docs/06-PROJECT-AUDIT.md` — this file

---

### Phase 1-4 New Files (2026-05-16)

**Phase 1 — Critical:**
- `apps/web/src/app/api/transactions/route.ts` — Added POST handler with Zod, creates tx+milestones+parties+audit
- `apps/web/src/components/transactions/transaction-creator/step-review.tsx` — Calls real API, shows loading/error states
- `apps/web/src/lib/db/queries/milestones.ts` — Added `createMilestone`
- `apps/web/src/app/(auth)/forgot-password/page.tsx` — Full password reset flow via Supabase Auth
- `apps/web/src/app/(auth)/verify/page.tsx` — Email/OTP verification page
- `apps/web/src/app/page.tsx` — Full landing page with hero, features, asset classes, CTA
- `apps/web/src/app/(marketing)/pricing/page.tsx` — 3-tier pricing page
- `apps/web/src/app/(marketing)/how-it-works/page.tsx` — 6-step explanation page
- `apps/web/src/app/(marketing)/assets/page.tsx` — 6 asset class directory

**Phase 2 — High Priority:**
- `apps/web/src/lib/db/queries/data-room.ts` — Data room CRUD queries
- `apps/web/src/app/api/transactions/[id]/data-room/route.ts` — GET (list), POST (upload)
- `apps/web/src/app/api/transactions/[id]/data-room/nda/route.ts` — POST (sign NDA)
- `apps/web/src/app/api/transactions/[id]/data-room/[fileId]/download/route.ts` — GET (download)
- `apps/web/src/lib/db/queries/notifications.ts` — Notification CRUD queries
- `apps/web/src/app/api/notifications/route.ts` — GET (list), PATCH (mark read)
- `apps/web/src/app/(app)/notifications/page.tsx` — Full notification center UI
- `apps/web/src/components/transactions/transaction-list-client.tsx` — Enabled pagination
- `apps/web/src/app/api/transactions/route.ts` — Added page/limit pagination support

**Phase 3 — Medium Priority:**
- `apps/web/src/lib/db/queries/disputes.ts` — Dispute CRUD queries
- `apps/web/src/app/api/disputes/[id]/route.ts` — GET dispute detail
- `apps/web/src/app/api/disputes/[id]/messages/route.ts` — GET/POST messages
- `apps/web/src/app/api/disputes/[id]/evidence/route.ts` — GET/POST evidence
- `apps/web/src/app/(app)/disputes/[id]/page.tsx` — Full dispute detail with chat + evidence
- `apps/web/src/app/(app)/kyc/tier-3/page.tsx` — Enhanced Due Diligence flow
- `apps/web/src/app/(app)/kyc/tier-4/page.tsx` — KYB business verification flow
- `apps/web/src/app/(app)/kyc/page.tsx` — Tier 3 & 4 made actionable

**Phase 4 — Polish:**
- `apps/web/src/app/api/dashboard/stats/route.ts` — Real dashboard stats from DB
- `apps/web/src/components/dashboard/dashboard-client.tsx` — Uses real stats API
- `apps/web/src/app/(auth)/login/page.tsx` — Phone OTP via Supabase Auth
