# TrustBridge Project Audit

**Date**: 2026-05-16  
**Overall completion**: ~55-60%

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

**Missing**: POST /api/transactions, Data room file APIs (upload/list/download)

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

### Auth (60%)
- **Done**: Login (email/password + phone OTP tab), register, Supabase auth actions, middleware
- **Missing**: Forgot-password page (linked, 404), email verify page, phone OTP handler is `console.log` stub, MFA not started

### Dashboard (95%)
- **Done**: Stats row, recent transactions table, KYC upgrade card, quick actions sidebar
- **Missing**: All stats are hardcoded (Volume: KES 0.00, Active: 0, Compliance: 98%)

### KYC (50%)
- **Done**: 4 tiers displayed, Tier 2 flow (3-step UI: document upload, liveness, proof of address), upload zone component, Smile Identity client
- **Missing**: "Start Face Scan" is UI-only (no Smile Identity SDK integration), Tiers 3/4 flows not started, KYB (business verification) not started

### Data Room (60%)
- **Done**: NDA gate component, file vault component (with search, file icons, download/view), full schema
- **Missing**: No upload/list/download API routes, no real Supabase Storage integration, NDA not persisted to DB (local state only)

### Disputes (40%)
- **Done**: Dispute list page, API endpoint (mock data), schema (disputes, messages, evidence)
- **Missing**: Detail page is placeholder text, no chat/messaging UI, no evidence upload UI

### Notifications (50%)
- **Done**: SMS (Africa's Talking), email (Resend), WhatsApp (Africa's Talking), USSD handler, dispatcher (Promise.allSettled), schema
- **Missing**: Notification page is a 5-line placeholder, no in-app bell dropdown, no read/unread, no preferences/settings, no API routes

### Infrastructure (30%)
- **Done**: next.config, tsconfig (strict), drizzle.config, postcss.config, .env.example (54 vars), .gitignore
- **Missing**: No tests (zero test files), no Docker, no CI/CD (GitHub Actions), no Redis/BullMQ workers, Framer Motion/Recharts/TanStack Table listed but unused

---

## NOT STARTED

### Marketing Pages
- Landing page is a 7-line stub (`"TrustBridge — Landing page scaffold"`)
- Pricing, How It Works, Asset Types pages all return 404
- No hero, features, testimonials, FAQs, or call-to-action content

### Missing Pages
- Forgot-password (404)
- Email verification (404)
- Dispute detail (placeholder only)
- Pricing, How It Works, Asset Types (all 404)

### Missing API Routes
- **POST /api/transactions** — critical gap, wizard cannot persist transactions
- Data room file upload/list/download — schema exists, no endpoints

### Missing Features
- KYC Tiers 3 & 4 flows
- KYB (business verification)
- Dispute messaging/evidence UI
- Notification center UI
- Agent assignment system (all pages, components, API routes)
- FX rates engine (fetcher, converter, API endpoint, cron job)
- Audit trail viewer page + timeline component + hash verification

---

## GAP ANALYSIS / NEXT STEPS

### Critical (blocking end-to-end flow)
1. POST /api/transactions route — wizard review has no API to call
2. Forgot-password & verify email pages — broken auth flow
3. Marketing pages — landing page stub blocks public launch

### High Priority
4. Tier 2 KYC liveness — "Start Face Scan" does nothing
5. Data room API routes + Supabase Storage integration
6. Notification center UI + API
7. Transaction pagination (always disabled)

### Medium Priority
8. Dispute detail page (messaging + evidence upload)
9. KYC Tiers 3 & 4 flows
10. KYB business verification UI
11. Tests (unit + integration + E2E)

### Low Priority / Polish
12. Dashboard real data from DB (not hardcoded)
13. Framer Motion for page transitions
14. Recharts for data visualization
15. Docker + CI/CD setup
16. Redis/BullMQ for async job processing
17. Agent assignment system
18. FX rates engine
19. Audit trail viewer

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
