# TrustBridge EA — Technical Specification
**Version 1.0 | For: Engineering Team + AI Agents**

---

## 1. Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + CSS custom properties (design tokens from `07-DESIGN-SYSTEM.md`)
- **State**: Zustand (client state) + TanStack Query v5 (server state / caching)
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table v8
- **File uploads**: react-dropzone + direct-to-S3 presigned URLs
- **Charts**: Recharts
- **Animations**: Framer Motion (minimal — only for milestone timeline, modals)
- **Icons**: Lucide React (no icon fonts)
- **Date handling**: date-fns

### Backend
- **Framework**: Next.js 15 API Routes (App Router) for lightweight endpoints
- **Heavy services**: Separate Node.js / Fastify microservices for: payment webhooks, file vault, audit log
- **Language**: TypeScript throughout
- **ORM**: Drizzle ORM (type-safe, performant, SQL-first)
- **Database**: PostgreSQL 16 (Supabase managed or self-hosted on Railway/Render)
- **File storage**: Supabase Storage (S3-compatible) with RLS policies
- **Queue / jobs**: BullMQ + Redis (for webhook processing, notification dispatch, FX rate updates)
- **Cache**: Redis (Upstash for serverless, self-hosted Redis for job queue)

### Authentication
- **Auth provider**: Supabase Auth (handles sessions, JWTs, OAuth)
- **MFA**: TOTP (Google Authenticator compatible) via Supabase MFA
- **Phone OTP**: Africa's Talking SMS OTP (primary) + Twilio (fallback)
- **Session**: httpOnly cookie-based (not localStorage)

### Third-Party APIs
| Service | Purpose | Provider |
|---|---|---|
| M-Pesa STK Push | Primary EA payment rail | Safaricom Daraja API |
| M-Pesa B2C | Disbursement to sellers | Safaricom Daraja API |
| Local bank transfers | Pesalink / EFT | Cellulant or Pesalink direct |
| Cross-border EA | Uganda, Tanzania, Rwanda | Flutterwave |
| Card payments | Visa/Mastercard | Flutterwave (PCI vaulted) |
| KYC / ID verification | All EA countries | Smile Identity |
| Liveness / face check | Tier 2+ KYC | Smile Identity SmileBiometrics |
| SMS notifications | All users | Africa's Talking |
| WhatsApp notifications | All users | Africa's Talking WhatsApp Business API |
| Email | Transactional + marketing | Resend |
| FX rates | Live currency rates | ExchangeRate-API + CBK API |
| Document e-signing | Multi-party agreements | DocuSeal (self-hostable, open source) |
| USSD | Feature phone access | Africa's Talking USSD |

### Infrastructure
- **Hosting**: Vercel (Next.js frontend + API routes) + Railway (microservices + Redis + cron jobs)
- **Database**: Supabase (Postgres + Auth + Storage) — East Africa region (choose `af-south-1` AWS or nearest)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (errors) + Axiom (logs) + Uptime Robot (uptime)
- **Secrets**: Vercel environment variables + Doppler for local dev

---

## 2. Repository Structure

```
trustbridge-ea/
├── apps/
│   ├── web/                          # Next.js 15 app
│   │   ├── app/
│   │   │   ├── (marketing)/          # Public pages: landing, pricing, asset-types
│   │   │   │   ├── page.tsx          # landing.html equivalent
│   │   │   │   ├── pricing/
│   │   │   │   ├── how-it-works/
│   │   │   │   └── assets/           # Asset class directory
│   │   │   ├── (auth)/               # Auth pages (outside main layout)
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── verify/
│   │   │   ├── (app)/                # Authenticated app shell
│   │   │   │   ├── layout.tsx        # Sidebar + nav (from dashboard.html)
│   │   │   │   ├── dashboard/        # dashboard.html
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── page.tsx      # Transaction list
│   │   │   │   │   ├── new/          # Transaction creator wizard
│   │   │   │   │   └── [id]/         # transaction.html
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── milestones/
│   │   │   │   │       ├── dispute/  # dispute.html
│   │   │   │   │       ├── data-room/
│   │   │   │   │       └── audit/
│   │   │   │   ├── payments/
│   │   │   │   │   └── [id]/         # payment.html (M-Pesa + wire)
│   │   │   │   ├── kyc/              # kyc.html
│   │   │   │   ├── notifications/
│   │   │   │   ├── settings/
│   │   │   │   └── agents/           # Agent assignment (buyer view)
│   │   │   └── api/
│   │   │       ├── webhooks/
│   │   │       │   ├── mpesa/        # Daraja C2B callback
│   │   │       │   ├── flutterwave/
│   │   │       │   └── smile-id/
│   │   │       ├── transactions/
│   │   │       ├── payments/
│   │   │       ├── kyc/
│   │   │       ├── disputes/
│   │   │       ├── notifications/
│   │   │       └── fx-rates/
│   │   ├── components/
│   │   │   ├── ui/                   # Base design system components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── kicker.tsx
│   │   │   │   ├── status-badge.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── top-nav.tsx
│   │   │   │   └── compliance-bar.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── transaction-creator/  # Multi-step wizard
│   │   │   │   ├── milestone-tracker.tsx
│   │   │   │   ├── timeline.tsx
│   │   │   │   ├── release-conditions.tsx
│   │   │   │   └── party-list.tsx
│   │   │   ├── payments/
│   │   │   │   ├── mpesa-stk-flow.tsx
│   │   │   │   ├── wire-transfer.tsx
│   │   │   │   └── payment-summary.tsx
│   │   │   ├── disputes/
│   │   │   │   ├── mediation-thread.tsx
│   │   │   │   └── evidence-locker.tsx
│   │   │   ├── data-room/
│   │   │   │   ├── nda-gate.tsx
│   │   │   │   └── vault-browser.tsx
│   │   │   └── kyc/
│   │   │       ├── tier-status.tsx
│   │   │       ├── upload-zone.tsx
│   │   │       └── liveness-check.tsx
│   │   ├── lib/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts         # Drizzle schema (all tables)
│   │   │   │   ├── migrations/
│   │   │   │   └── queries/          # Typed query functions
│   │   │   ├── mpesa/
│   │   │   │   ├── daraja.ts         # Daraja API client
│   │   │   │   ├── stk-push.ts
│   │   │   │   └── b2c.ts
│   │   │   ├── payments/
│   │   │   │   └── flutterwave.ts
│   │   │   ├── kyc/
│   │   │   │   └── smile-identity.ts
│   │   │   ├── notifications/
│   │   │   │   ├── sms.ts            # Africa's Talking
│   │   │   │   ├── whatsapp.ts
│   │   │   │   └── email.ts          # Resend
│   │   │   ├── vault/
│   │   │   │   └── data-room.ts      # Supabase Storage + encryption
│   │   │   ├── audit/
│   │   │   │   └── logger.ts         # Immutable audit trail writer
│   │   │   ├── fx/
│   │   │   │   └── rates.ts          # FX rate fetcher + cache
│   │   │   └── utils/
│   │   │       ├── currency.ts       # KES/UGX/TZS/RWF formatting
│   │   │       ├── dates.ts
│   │   │       └── errors.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   │   └── index.ts              # Shared TypeScript types
│   │   └── middleware.ts             # Auth middleware (protect /app/*)
├── packages/
│   └── shared/                       # Shared types + Zod schemas (future monorepo)
├── supabase/
│   ├── migrations/                   # SQL migrations
│   └── seed.ts
├── docs/                             # This document suite lives here in the repo
├── .env.example
├── .env.local                        # Never commit
└── package.json
```

---

## 3. Database Schema

All tables use UUID primary keys and `created_at` / `updated_at` timestamps.

```sql
-- USERS
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text unique,                  -- E.164 format (+254...)
  full_name text not null,
  kyc_tier integer default 0,         -- 0=none, 1=basic, 2=advanced, 3=high, 4=institutional
  kyc_status text default 'pending',  -- pending|in_progress|verified|rejected
  role text default 'individual',     -- individual|business
  preferred_currency text default 'KES',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BUSINESSES (linked to user)
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id),
  legal_name text not null,
  registration_number text,           -- BRS / CAC / BRELA etc
  kra_pin text,
  country text not null default 'KE',
  kyc_status text default 'pending',
  created_at timestamptz default now()
);

-- TRANSACTIONS
create table transactions (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,     -- TRX-XXXXX human-readable
  title text not null,
  asset_class text not null,          -- digital|physical|property|legal_data|business|services
  asset_subclass text,
  status text not null default 'draft', -- draft|pending_funds|funded|in_progress|in_inspection|completed|disputed|cancelled
  currency text not null default 'KES',
  amount numeric(18,2) not null,
  fee_amount numeric(18,2),
  fee_percentage numeric(5,4),
  fx_rate_at_creation numeric(18,6),  -- rate locked at creation
  fx_base_currency text default 'KES',
  description text,
  terms text,                         -- plain language terms
  inspection_period_days integer default 5,
  milestone_count integer default 1,
  has_data_room boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TRANSACTION PARTIES
create table transaction_parties (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  user_id uuid references users(id),
  role text not null,                 -- buyer|seller|agent|lawyer|observer
  invite_email text,
  invite_phone text,
  status text default 'invited',      -- invited|accepted|declined|signed
  signed_at timestamptz,
  created_at timestamptz default now()
);

-- MILESTONES
create table milestones (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  order_index integer not null,
  title text not null,
  description text,
  amount numeric(18,2) not null,
  percentage numeric(5,2),
  status text default 'pending',      -- pending|in_progress|delivered|accepted|disputed|released
  due_date date,
  delivered_at timestamptz,
  accepted_at timestamptz,
  released_at timestamptz,
  created_at timestamptz default now()
);

-- PAYMENTS
create table payments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  milestone_id uuid references milestones(id),
  payer_id uuid references users(id),
  amount numeric(18,2) not null,
  currency text not null,
  method text not null,               -- mpesa_stk|mpesa_paybill|pesalink|flutterwave|wire|usdc
  status text default 'pending',      -- pending|processing|completed|failed|refunded
  provider_reference text,           -- M-Pesa transaction ID, Flutterwave ref, etc
  mpesa_phone text,
  checkout_request_id text,          -- M-Pesa STK checkout ID for polling
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DISBURSEMENTS (money out to sellers)
create table disbursements (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  milestone_id uuid references milestones(id),
  recipient_id uuid references users(id),
  amount numeric(18,2) not null,
  currency text not null,
  method text not null,               -- mpesa_b2c|pesalink|flutterwave|wire
  status text default 'pending',
  provider_reference text,
  mpesa_phone text,
  bank_account jsonb,                 -- encrypted bank details
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- KYC SUBMISSIONS
create table kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  tier integer not null,
  smile_job_id text,                  -- Smile Identity job ID
  document_type text,                 -- national_id|passport|drivers_license
  document_number text,
  country text,
  status text default 'pending',
  rejection_reason text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);

-- DISPUTES
create table disputes (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,     -- DSP-XXXXX
  transaction_id uuid references transactions(id),
  milestone_id uuid references milestones(id),
  opened_by uuid references users(id),
  status text default 'open',         -- open|under_mediation|expert_review|arbitration|resolved|closed
  resolution_tier integer default 1,  -- 1=bilateral, 2=mediation, 3=expert, 4=arbitration
  assigned_mediator_id uuid references users(id),
  resolution text,                    -- full_seller|full_buyer|split|re_delivery
  resolution_split_percentage numeric(5,2),
  opened_at timestamptz default now(),
  resolved_at timestamptz
);

-- DISPUTE MESSAGES
create table dispute_messages (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references disputes(id),
  sender_id uuid references users(id),
  sender_role text,                   -- buyer|seller|mediator|system
  body text not null,
  created_at timestamptz default now()
);

-- DISPUTE EVIDENCE
create table dispute_evidence (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references disputes(id),
  uploaded_by uuid references users(id),
  file_name text not null,
  file_path text not null,            -- Supabase Storage path
  file_size integer,
  file_type text,
  created_at timestamptz default now()
);

-- SECURE MESSAGES (transaction-level)
create table transaction_messages (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  sender_id uuid references users(id),
  body text not null,
  created_at timestamptz default now()
);

-- DATA ROOM
create table data_rooms (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) unique,
  nda_template_id text,
  status text default 'locked',       -- locked|nda_pending|active|delivered
  created_at timestamptz default now()
);

create table data_room_files (
  id uuid primary key default gen_random_uuid(),
  data_room_id uuid references data_rooms(id),
  uploaded_by uuid references users(id),
  file_name text not null,
  file_path text not null,
  file_hash text not null,            -- SHA-256 for integrity verification
  file_size integer,
  delivered_at timestamptz,
  accessed_at timestamptz,
  created_at timestamptz default now()
);

create table data_room_ndas (
  id uuid primary key default gen_random_uuid(),
  data_room_id uuid references data_rooms(id),
  user_id uuid references users(id),
  signed_at timestamptz,
  signature_data text,               -- DocuSeal signature reference
  ip_address text,
  user_agent text
);

-- AUDIT LOG (append-only, never update/delete)
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  actor_id uuid references users(id),
  actor_role text,
  action text not null,              -- funded|milestone_delivered|dispute_opened|funds_released|etc
  metadata jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- AGENTS
create table agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  display_name text not null,
  counties text[],                    -- Kenyan counties they cover
  countries text[],                   -- EA countries
  asset_classes text[],              -- which asset types they inspect
  rating numeric(3,2),
  review_count integer default 0,
  is_active boolean default true,
  lat numeric(10,8),
  lng numeric(11,8),
  created_at timestamptz default now()
);

create table agent_assignments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  agent_id uuid references agents(id),
  status text default 'assigned',    -- assigned|accepted|in_progress|completed|disputed
  inspection_notes text,
  inspection_photos text[],          -- Supabase Storage paths
  gps_lat numeric(10,8),
  gps_lng numeric(11,8),
  assigned_at timestamptz default now(),
  completed_at timestamptz
);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  transaction_id uuid references transactions(id),
  type text not null,                -- funds_received|milestone_due|dispute_opened|etc
  title text not null,
  body text not null,
  channels text[],                   -- sms|whatsapp|email|in_app
  is_read boolean default false,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- FX RATES CACHE
create table fx_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null,
  quote_currency text not null,
  rate numeric(18,8) not null,
  source text,
  fetched_at timestamptz default now(),
  unique(base_currency, quote_currency)
);
```

---

## 4. Key API Contracts

### POST /api/transactions
**Create a new transaction**
```typescript
// Request body
{
  title: string
  assetClass: 'digital' | 'physical' | 'property' | 'legal_data' | 'business' | 'services'
  assetSubclass: string
  currency: 'KES' | 'UGX' | 'TZS' | 'RWF' | 'USD' | 'EUR' | 'GBP'
  amount: number
  description: string
  terms: string
  inspectionPeriodDays: number
  hasDataRoom: boolean
  milestones: Array<{
    title: string
    description: string
    amount: number
    dueDate: string // ISO date
  }>
  parties: Array<{
    role: 'buyer' | 'seller' | 'agent' | 'lawyer' | 'observer'
    email?: string
    phone?: string // E.164
  }>
}

// Response
{
  transaction: Transaction
  signingUrl: string  // DocuSeal agreement URL
}
```

### POST /api/payments/mpesa/stk-push
**Initiate M-Pesa STK Push payment**
```typescript
// Request
{
  transactionId: string
  milestoneId?: string
  phoneNumber: string   // E.164, e.g. +254712345678
  amount: number        // In KES
}

// Response
{
  checkoutRequestId: string
  merchantRequestId: string
  message: string       // "STK push sent to +254712..."
}

// Client polls: GET /api/payments/mpesa/status?checkoutRequestId=xxx
// Until status is 'completed' | 'failed'
```

### POST /api/milestones/:id/deliver
**Seller marks milestone as delivered**
```typescript
// Request (multipart form data)
{
  notes: string
  files: File[]    // Evidence files
}
// Response: updated Milestone
```

### POST /api/milestones/:id/accept
**Buyer accepts milestone delivery**
```typescript
// Request
{ notes?: string }
// Triggers: disbursement job queued, audit log entry, notifications
// Response: updated Milestone + Disbursement record
```

### GET /api/fx-rates
**Get current FX rates**
```typescript
// Response
{
  base: 'KES'
  rates: {
    USD: 0.00775
    UGX: 28.4
    TZS: 20.1
    RWF: 10.2
    EUR: 0.00714
    GBP: 0.00612
  }
  updatedAt: string
}
```

---

## 5. M-Pesa Integration (Daraja API)

This is the most critical integration. Follow these steps precisely.

### 5.1 Environment Setup
```env
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_SHORTCODE=174379         # Sandbox: 174379 | Production: your Paybill
MPESA_PASSKEY=xxx              # From Daraja portal
MPESA_STK_CALLBACK_URL=https://yourdomain.com/api/webhooks/mpesa/stk
MPESA_B2C_INITIATOR_NAME=xxx
MPESA_B2C_SECURITY_CREDENTIAL=xxx  # Encrypted with B2C certificate
MPESA_B2C_CALLBACK_URL=https://yourdomain.com/api/webhooks/mpesa/b2c
MPESA_ENVIRONMENT=sandbox      # sandbox | production
```

### 5.2 Auth Token (rotate every 50 minutes)
```typescript
// lib/mpesa/daraja.ts
export async function getDarajaToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')
  
  const res = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${credentials}` } }
  )
  const data = await res.json()
  return data.access_token  // cache in Redis for 55 minutes
}
```

### 5.3 STK Push
```typescript
export async function initiateSTKPush({ phone, amount, transactionRef }: {
  phone: string     // 254712345678 (no +)
  amount: number    // Integer KES
  transactionRef: string
}) {
  const token = await getDarajaToken()
  const timestamp = format(new Date(), 'yyyyMMddHHmmss')
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64')
  
  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount),
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_STK_CALLBACK_URL,
    AccountReference: transactionRef,   // TRX-8291
    TransactionDesc: `TrustBridge Escrow: ${transactionRef}`
  }
  
  const res = await fetch(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )
  return res.json()
}
```

### 5.4 Webhook Handler
```typescript
// app/api/webhooks/mpesa/stk/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  const { Body: { stkCallback } } = body
  
  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback
  
  if (ResultCode === 0) {
    // Success - extract MpesaReceiptNumber, Amount, PhoneNumber
    const items = CallbackMetadata.Item
    const receipt = items.find(i => i.Name === 'MpesaReceiptNumber').Value
    const amount = items.find(i => i.Name === 'Amount').Value
    
    // Update payment record, trigger escrow funding job
    await db.update(payments)
      .set({ status: 'completed', providerReference: receipt })
      .where(eq(payments.checkoutRequestId, CheckoutRequestID))
    
    // Queue: mark transaction funded, send notifications
    await fundingQueue.add('mark-funded', { checkoutRequestId: CheckoutRequestID })
  } else {
    // Payment failed - update record, notify user
    await db.update(payments)
      .set({ status: 'failed' })
      .where(eq(payments.checkoutRequestId, CheckoutRequestID))
  }
  
  return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' })
}
```

---

## 6. Security Requirements

### 6.1 Non-negotiable from day one
- All API routes in `/app/api/` must verify Supabase session via `createServerClient`
- Webhook endpoints must verify provider signatures (M-Pesa, Flutterwave use HMAC-SHA256)
- File uploads: validate file type server-side (not just client), scan with ClamAV before storing
- Bank details in disbursements table: encrypt with AES-256 before storing (use `node:crypto`)
- Rate limiting on all API routes: 100 req/min per IP for auth routes, 1000/min for general
- Audit log: enforce `INSERT` only via Supabase RLS — no `UPDATE` or `DELETE` on audit_log

### 6.2 Supabase RLS Policies (critical examples)
```sql
-- Users can only read their own data
alter table users enable row level security;
create policy "users_own_data" on users
  for all using (auth.uid() = id);

-- Transaction parties can see their transactions
create policy "transaction_parties_access" on transactions
  for select using (
    id in (
      select transaction_id from transaction_parties
      where user_id = auth.uid()
    )
  );

-- Audit log: insert only
create policy "audit_insert_only" on audit_log
  for insert with check (true);
-- No update/delete policy = blocked
```

### 6.3 Financial action checklist (enforce on every release/disbursement)
1. Verify user KYC tier meets transaction amount threshold
2. Verify all milestone conditions are met
3. Verify all transaction_parties have status = 'signed'
4. Re-verify payment status = 'completed' from DB (never trust client)
5. Write audit log BEFORE initiating disbursement
6. Use database transaction (BEGIN/COMMIT) for payment state changes
7. Idempotency key on all disbursement calls

---

## 7. Environment Variables Reference

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# M-Pesa / Daraja
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_STK_CALLBACK_URL=
MPESA_B2C_SHORTCODE=
MPESA_B2C_INITIATOR_NAME=
MPESA_B2C_INITIATOR_PASSWORD=
MPESA_B2C_CALLBACK_URL=
MPESA_ENVIRONMENT=sandbox

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_WEBHOOK_SECRET=

# Smile Identity (KYC)
SMILE_ID_PARTNER_ID=
SMILE_ID_API_KEY=
SMILE_ID_SID_SERVER=0  # 0=sandbox, 1=production

# Africa's Talking (SMS + WhatsApp + USSD)
AT_API_KEY=
AT_USERNAME=
AT_SENDER_ID=TrustBridg
AT_WHATSAPP_PHONE=

# Resend (Email)
RESEND_API_KEY=

# DocuSeal (E-signatures)
DOCUSEAL_API_KEY=
DOCUSEAL_BASE_URL=

# ExchangeRate API
EXCHANGERATE_API_KEY=

# Redis (Upstash for serverless)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://app.trustbridge.co.ke
NEXTAUTH_SECRET=   # 32+ char random string
ENCRYPTION_KEY=    # 32-byte key for AES-256
```