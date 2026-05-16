# TrustBridge EA — Team Research Report
**For: Founders & Business Team | Version 1.0 | May 2026**

---

## Executive Summary

The East African digital economy is at an inflection point. Mobile money penetration is among the highest in the world, cross-border trade is growing rapidly, and fraud in high-value transactions is endemic — yet no credible, locally regulated, multi-asset escrow platform exists. TrustBridge EA is entering a genuine market vacuum, not a crowded space.

This document gives your team the context, competitive landscape, market data, and operational insights needed to build and launch confidently.

---

## 1. Market Size & Opportunity

### Kenya
- **Mobile money**: Kenya processes ~KES 7.4 trillion annually via M-Pesa (Central Bank of Kenya, 2025). This is the world's most developed mobile money market by penetration.
- **Digital economy GDP contribution**: ~9.2% of GDP and growing at ~14% YoY
- **Property market**: Kenya's real estate sector is worth ~KES 3 trillion. Land fraud is estimated to cost the economy KES 50B+ per year. Title deed disputes are the most common civil case type in Kenyan courts.
- **SME digital commerce**: 80% of Kenyan SMEs use WhatsApp for business; only 22% have formal payment protection on digital transactions.
- **Freelance/digital services**: Kenya is one of Africa's top 3 freelancer markets. Most payments are made via PayPal (unavailable for KES), Wise, or informal Mpesa — all without buyer/seller protection.

### East Africa Regional
| Country | Mobile Money Users | GDP (USD) | Internet Penetration |
|---|---|---|---|
| Kenya | 34M | $118B | 42% |
| Uganda | 18M | $49B | 26% |
| Tanzania | 22M | $79B | 49% |
| Rwanda | 8M | $14B | 60% |

- Cross-border EA trade (EAC) was valued at ~$6.8B in 2024, growing ~11% YoY
- Cross-border payment friction (FX, trust) is cited by 73% of EA SMEs as a key obstacle to trade growth

### The Trust Deficit
- 64% of Kenyan online buyers report having been defrauded at least once (Research ICT Africa, 2024)
- Average fraud loss per incident: KES 28,000
- Only 8% of fraud victims successfully recover funds
- Primary fraud vector: payment before delivery (either direction — prepay fraud or delivery without payment)

---

## 2. Competitive Landscape

### Direct Competitors (Escrow)

**Escrow.com (USA)**
- Strengths: Trusted global brand, supports domains, vehicles, general merchandise
- Weaknesses for EA: USD only, no M-Pesa, no local KYC (can't verify Kenyan IDs), no physical goods agent network, slow (US business hours), no local regulatory cover, high minimum fees ($25 minimum)
- Verdict: Accessible to tech-savvy users with USD accounts. Irrelevant for 90% of your target market.

**iEscrow (Kenya) — inactive**
- Attempted Kenya-specific escrow ~2019-2021. No longer operational. Regulatory + banking challenges cited.
- Key lesson: The market gap is real. Prior attempts failed on execution, not on market need.

**Pesalock — unknown status**
- Appears in some listings but has minimal public presence / transaction volume.

**Law firm client accounts (informal)**
- Dominant method for property transactions. Expensive (1.5–3% legal fees), slow (weeks), requires relationship with a lawyer, no digital interface.
- Still used for 80%+ of property transactions > KES 5M.

### Indirect Competitors (Trust Infrastructure)

**M-Pesa Ratiba (Safaricom, 2024)**
- Scheduled/conditional payments within M-Pesa ecosystem
- Extremely limited: no third-party goods verification, no dispute resolution, no multi-party support
- Primarily used for utility payments and subscriptions
- Verdict: Not a real escrow product. A payment scheduling tool.

**Pesalink (KBA)**
- Bank-to-bank real-time transfer. Not an escrow product — just a payment rail you should integrate.

**Flutterwave Escrow API (in development)**
- Flutterwave has announced escrow as a feature for their marketplace product
- Currently only available to enterprise marketplace platforms via API
- Not consumer-facing, no dispute resolution, no KYC overlay
- Verdict: A future risk in the B2B API space. Not a direct threat to your consumer + SME product.

**PayPal / Wise / Airwallex**
- International transfer tools, not escrow. PayPal's buyer protection is limited and not available in all EA countries.

### Substitute Behaviors (What users do today)
Understanding these is critical — these are your conversion targets:

1. **"Half-half"** — Buyer pays 50% upfront, 50% on delivery. Both parties bear risk. Extremely common in informal trade.
2. **Trusted middleman** — A mutual friend/contact holds the money physically. Scales poorly, not digital, creates liability for the middleman.
3. **Meetup cash deals** — For vehicles, electronics, livestock. Risk of robbery, no receipt, no recourse.
4. **M-Pesa reversal requests** — Buyers pay and immediately request reversal if not satisfied. Creates disputes with Safaricom, not the seller.
5. **Facebook Marketplace escrow groups** — Informal WhatsApp groups of "trusted middlemen" — unregulated, frequently fraudulent.
6. **Bank guarantee / letter of credit** — For large B2B deals. Expensive (1.5–3%), requires banking relationship, 2–5 business day process.

---

## 3. Regulatory Environment

### Kenya (Primary Market)

**Central Bank of Kenya (CBK)**
- TrustBridge EA will need a **Payment Service Provider (PSP) license** under the National Payment System Act 2011 (amended 2021)
- Alternative: operate under a **Regulated Financial Institution (RFI)** license
- Process: 6–18 months, requires paid-up capital (minimum KES 20M for PSP), fit & proper assessment of directors, AML/CFT policy, IT security audit
- The CBK has been actively licensing fintech PSPs since 2022 — the regulatory environment is open but thorough
- **Key contact**: CBK National Payments Policy — payments@centralbank.go.ke

**Capital Markets Authority (CMA)**
- Required if escrowing securities, investment contracts, or financial instruments
- NOT required for goods/services/property escrow in Phase 1

**Kenya Revenue Authority (KRA)**
- All escrow transactions are subject to normal taxation
- WHT (Withholding Tax): 5% on payments to individuals for services above KES 30,000 — you must deduct this at source and remit to KRA
- Escrow fee revenue is subject to VAT (16%) — you must register for VAT once turnover exceeds KES 5M/year
- KRA PIN verification API available — integrate for KYC (free for registered businesses)
- **KRA iTax portal**: itax.kra.go.ke

**Kenya Data Protection Act 2019 (DPA)**
- You are a Data Controller and Data Processor
- Must register with Office of the Data Protection Commissioner (ODPC): odpc.go.ke
- Must appoint a Data Protection Officer (DPO) — can be an internal person or external consultant
- Must publish a Privacy Policy and a Data Processing Agreement
- ODPC registration fee: KES 5,000. Annual renewal.

**Stamp Duty**
- Property transactions: buyer pays stamp duty (2–4% of property value). TrustBridge doesn't collect this but should inform users.

**Anti-Money Laundering (AML)**
- Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) — compliance mandatory
- Must file Suspicious Transaction Reports (STRs) with the Financial Reporting Centre (FRC): frc.go.ke
- Must maintain AML/CFT policy, conduct training, appoint Compliance Officer

### Uganda, Tanzania, Rwanda (Phase 2)
Each requires a separate PSP or e-money license. Engage local lawyers in each country at Phase 2 start. Do not operate in these markets without a license — fines and shutdown risk are real.

---

## 4. Banking & Float Management

This is one of the most operationally complex parts of your business. Understand it well.

### The Escrow Float
When a buyer funds a transaction, the money sits in TrustBridge's escrow account until release. This pool of money is the "float." Your float account must:
- Be in a regulated, FDIC/DFS-equivalent insured bank
- Be separate from your operating account (commingling is illegal and CBK will revoke your license)
- Be auditable at any time
- Pay interest (negotiate with bank — this can be a revenue source)

### Recommended Banks for Float Account
**KCB Bank Kenya** — Largest bank by assets. Has dedicated fintech/PSP banking team. Recommended first choice.
**Equity Bank** — Excellent M-Pesa API relationship, good developer support, EA presence.
**NCBA** — Strong digital banking team. Loop (their fintech arm) has API infrastructure.
**Co-operative Bank** — Good for SME market segment, has Pesalink integration.

**What to tell the bank when you call:**
> "We are a payment service provider applying for a CBK PSP license. We need to open a client money account (escrow float) that is separate from our operating account. We need API access for real-time balance queries and will be processing M-Pesa C2B and B2C transactions."

### M-Pesa Paybill / Business Number
- Register for a Safaricom Daraja M-Pesa API account at developer.safaricom.co.ke
- You need a **Paybill number** (for C2B — customers paying you) and a **B2C shortcode** (for you paying sellers)
- Paybill registration requires: KRA PIN, Certificate of Registration, bank account, operator letter on company letterhead
- Process takes 2–4 weeks after document submission
- Sandbox access is instant — start integrating immediately in sandbox while waiting for production

### Float Interest
Negotiate with your bank for interest on the escrow float balance. At scale (KES 100M+ float), this is meaningful revenue. A typical rate: 5–8% p.a. on call accounts. This is yours to keep (disclose in T&Cs).

---

## 5. KYC Partner Landscape

**Smile Identity (Recommended)**
- Best EA coverage: Kenya (National ID + Passport), Uganda, Tanzania, Rwanda, Ghana, Nigeria
- Real-time ID verification against government databases in Kenya (via IPRS — Integrated Population Registration System)
- Liveness detection (SmileBiometrics) — 3D face matching
- Business KYC available
- Pricing: ~$0.20–$0.80 per check depending on volume and product
- Sandbox: free. developer.usesmileid.com

**Jumio** — Global alternative, less EA depth. More expensive.
**Onfido** — Good for international KYC, limited EA government database coverage.
**Smile Identity is the correct choice for EA launch.**

---

## 6. Payment Rail Guide

### M-Pesa Daraja (Mandatory — integrate first)
- Developer portal: developer.safaricom.co.ke
- Create an account with your business email
- Products you need: **Lipa Na M-Pesa Online (STK Push)** + **M-Pesa B2C** (for disbursements)
- STK Push limit: KES 300,000 per transaction (as of 2025). For amounts above this, use Paybill instructions instead.
- B2C (seller payout): supports up to KES 150,000 per transaction. For larger amounts, wire transfer.
- Go-live checklist: Business must be registered, have Paybill, submit integration for review by Safaricom. Takes 1–3 weeks.

### Pesalink (KBA)
- Kenya Bankers Association real-time transfer between member banks
- Contact: pesalink@kba.co.ke for API access
- Requires bank sponsorship — your float account bank (KCB/Equity) can sponsor your Pesalink access
- Better for large transactions (> KES 300K) where M-Pesa limit is hit

### Flutterwave (Cross-border)
- Best for: Uganda, Tanzania, Rwanda, Ghana transactions + card payments
- Dashboard: app.flutterwave.com
- Supports: cards, mobile money, bank transfers across 30+ African countries
- PCI-DSS compliant vault — offloads your card data storage obligation
- Pricing: 1.4% for local cards, 3.8% for international cards
- Onboarding: 24–48 hours for business accounts

### Africa's Talking (SMS + WhatsApp + USSD)
- Best EA SMS gateway. Lower latency and better delivery rates in Kenya than Twilio for local numbers.
- Sandbox is free. africastalking.com
- SMS pricing: ~KES 0.30–0.50 per SMS to Kenyan numbers
- WhatsApp Business API: available through them. Requires Facebook Business verification (takes 2–4 weeks).
- USSD: requires shortcode from Communications Authority of Kenya (CA). Apply via Africa's Talking. Takes 4–8 weeks.

---

## 7. Key Things Your Team Must Know

### On the M-Pesa Integration
- The Daraja sandbox is unreliable — timeouts are common. Build polling with exponential backoff from day one.
- M-Pesa callback URLs must be publicly accessible HTTPS — use ngrok or Cloudflare Tunnel during development.
- M-Pesa phone numbers must be in format 2547XXXXXXXX (no +, no leading 0). Always normalize on input.
- STK Push can fail silently — always poll the `/stkpushquery` endpoint after 10 seconds if callback hasn't fired.
- B2C payments to unregistered M-Pesa numbers will fail silently. Validate M-Pesa registration before disbursement.

### On Financial Data
- Never store M-Pesa PINs, card numbers, or bank account passwords. Ever.
- Bank account numbers for disbursements: encrypt with AES-256 before storing. Decrypt only at disbursement time.
- Use database transactions (BEGIN/COMMIT) for any operation that moves money. If any step fails, rollback everything.
- Idempotency is non-negotiable: if a webhook fires twice (it will), you must not double-credit. Use the M-Pesa transaction ID as an idempotency key.

### On Supabase RLS
- Row Level Security is your financial data firewall. Test it like you test payment flows — malicious users will try to access other users' transactions.
- Write tests specifically for RLS: "Can user A see user B's transaction?" Answer must always be no unless A is an invited party.

### On Kenyan Users
- Many users will have Safaricom lines that have been active for years — their M-Pesa number is their identity. Design phone-number-first auth (OTP via SMS), not email-first.
- The majority of your initial user base will access TrustBridge on Android mobile Chrome. Test on mid-range Android (Samsung A-series, Tecno Camon) not just iPhone.
- Load time matters more than in Western markets — 3G connectivity is common. Optimize aggressively. Target < 2 second FCP on 3G.
- Trust signals matter enormously. Display your CBK license number, KRA PIN, physical address, and phone number prominently. Users will check these.

### On the Escrow Float
- Your float account balance must always ≥ sum of all 'funded' transactions. Build a reconciliation job that checks this daily and alerts if discrepancy.
- Never use float for operating expenses. This is illegal and will cost you your license.
- Maintain a liquidity buffer: keep 110% of expected daily disbursements available in liquid form.

---

## 8. Fraud Patterns to Design Against

Based on existing EA fintech fraud intelligence:

1. **Fake seller, real buyer**: Fraudster lists goods, buyer pays into escrow, seller provides fake delivery evidence and requests release. **Mitigation**: agent verification for physical goods; buyer inspection period; dispute process.

2. **Account takeover**: Fraudster takes over seller's email, redirects disbursement to their account. **Mitigation**: 2FA on all payout changes; bank account change cooldown (48h before new account can receive funds); email + SMS alert on any payout details change.

3. **KYC document fraud**: Submitting forged National IDs. **Mitigation**: Smile Identity real-time IPRS check (cross-references Kenya's population register). Much harder to fake than a selfie check.

4. **SIM swap attack**: Fraudster gets victim's phone number moved to their SIM, intercepts OTPs. **Mitigation**: Device fingerprinting; alert user on new device login; require additional verification for new device disbursements.

5. **Repeat dispute abuse**: Buyer always disputes at the last moment to extend funds holding or get refunds on legitimate transactions. **Mitigation**: Track dispute history in user profile; flag accounts with >2 disputes in 6 months for manual review.

6. **Data room theft**: Buyer signs NDA, downloads all data room files, then claims non-delivery and demands refund. **Mitigation**: Data room access is logged and included in audit trail; dispute resolution can review access logs; NDA is enforceable.

---

## 9. Go-to-Market Notes

### Initial Beachhead: Nairobi Tech + Professional Class
Your first 1,000 transactions will come from:
- Software developers / freelancers selling to international clients
- Domain name and social account traders (active Kenyan market)
- Vehicle buyers/sellers (Jiji.co.ke is the dominant platform — huge fraud problem there)
- Nairobi property deals (apartments, plots in satellite towns)

**Distribution channels:**
- Jiji.co.ke integration or partnership (they have a fraud problem — you solve it)
- Kenyan Twitter/X (tech community is active and vocal)
- WhatsApp group seeding (real estate agents groups, car dealers groups)
- Google SEO for: "safe way to buy car Kenya", "escrow service Kenya", "how to buy domain safely Kenya"

### Pricing Psychology
- Frame fees as insurance, not charges: "For KES 1,200, protect your KES 60,000 transaction"
- Show the cost of NOT using escrow (fraud statistics)
- Compare to lawyer fees for property: "Cheaper than a lawyer, faster than a bank guarantee"

### Trust Anchor: Physical Address + Phone
Register a physical office address (even a co-working space) and publish it. A real Nairobi phone number (+254) on the website reduces bounce rate significantly for EA users who distrust purely online businesses.