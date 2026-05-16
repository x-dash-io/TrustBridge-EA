# TrustBridge EA — Product Requirements Document
**Version 1.0 | May 2026 | Confidential**

---

## 1. Executive Summary

TrustBridge EA is a regulated, multi-asset escrow platform purpose-built for the East African digital economy. It extends the core TrustBridge infrastructure with Kenya-first payment rails (M-Pesa, Pesalink, mobile money), multi-currency support (KES, UGX, TZS, RWF, USD), and a dramatically expanded asset class taxonomy — covering physical goods, real property, legal data packages, business acquisitions, digital assets, professional services, and sensitive-but-saleable information.

The platform targets the trust vacuum in high-value peer-to-peer and B2B transactions where existing solutions (Escrow.com, local bank guarantees, informal agreements) are either too expensive, too slow, not locally regulated, or simply unavailable.

**North Star Metric:** Gross Transaction Volume (GTV) facilitated within 12 months of launch.

---

## 2. Market Context & Problem Statement

### 2.1 Why East Africa, Why Now

- Kenya's digital economy transacts ~KES 7.4 trillion via M-Pesa annually (Central Bank of Kenya, 2025)
- Cross-border EA trade (Kenya↔Uganda↔Tanzania↔Rwanda) is growing at ~14% YoY but lacks digital trust infrastructure
- Land fraud costs Kenya an estimated KES 50B+ annually (land title disputes are the #1 civil case category)
- No credible locally regulated escrow service exists below the level of expensive law firm-managed client accounts

### 2.2 Core Problem

**Buyers fear paying before receiving. Sellers fear delivering before payment.** Existing workarounds — cash on delivery, partial deposits, informal middlemen, and social trust — all fail at scale, across borders, and for high-value transactions.

### 2.3 Gaps in Current Solutions

| Gap | Current State | TrustBridge EA Solution |
|---|---|---|
| M-Pesa / mobile money | Not supported anywhere | Native STK Push + Paybill integration |
| Local currency | USD-only platforms | KES, UGX, TZS, RWF as primary currencies |
| Physical goods inspection | Not supported | Verified Inspector Network + milestone release |
| Land / property | Informal / lawyers only | Title Deed Escrow module |
| Legal data packages | No platform exists | Structured "Data Room" escrow with NDA gate |
| Business acquisition | No EA platform | Goodwill + database + trade secret escrow |
| Livestock / agricultural | No platform exists | Agent-verified physical goods flow |
| Vehicle / logbook transfer | Informal / eCitizen gaps | Logbook escrow with NTSA verification hook |
| Multilingual | English only | English + Swahili at launch |
| Low-connectivity users | Web-only | USSD fallback + SMS notifications |
| Multi-party deals | 2-party only | 3–5 party deals (buyer, seller, agent, lawyer) |
| Milestone payments | Single release | Partial milestone-based fund releases |
| Seller-side view | Buyer-POV only | Full seller dashboard and flow |

---

## 3. Target Users

### 3.1 Primary Segments

**Segment A — High-Value Individual (HVI)**
- Profile: Purchasing a vehicle, land plot, or rare item above KES 500K
- Pain: Fear of title fraud, receiving a different item, or seller disappearing
- Behavior: Comfortable with smartphones, M-Pesa power user, may use a lawyer

**Segment B — SME Buyer/Seller**
- Profile: Importing goods from China/UAE/SA, buying/selling a business, engaging freelancers
- Pain: International payment risk, no formal contract enforcement
- Behavior: Uses WhatsApp for business, has a business bank account, price-sensitive on fees

**Segment C — Professional Services Provider**
- Profile: Freelancer, consultant, software developer, law firm
- Pain: Getting paid for milestone-based work, international clients, scope creep disputes
- Behavior: Technically savvy, may invoice in USD, needs professional audit trail

**Segment D — Data / IP Seller**
- Profile: Startup selling a customer database, individual selling a legal judgment, business selling IP
- Pain: No secure way to transfer sensitive data after payment confirmation
- Behavior: High-trust requirement, needs NDA enforcement, data room functionality

**Segment E — Agricultural / Physical Goods**
- Profile: Farmer selling a herd, grain trader, equipment dealer
- Pain: No trust infrastructure for physical goods, relies on cash or social networks
- Behavior: M-Pesa primary, lower digital literacy, may use an agent

### 3.2 Secondary Segments
- Real estate agents facilitating property transactions
- Import/export brokers (goods in transit escrow)
- Investors acquiring startups or business assets
- Government procurement (pilot: future phase)

---

## 4. Asset Class Taxonomy

This is TrustBridge EA's primary differentiation. Each asset class has a dedicated flow, verification method, and release condition.

### 4.1 Digital Assets
| Sub-class | Examples | Verification Method | Release Trigger |
|---|---|---|---|
| Domain names | .co.ke, .com, .africa | WHOIS transfer + registrar confirmation | Push confirmation of new ownership |
| Social accounts | Instagram, TikTok, Facebook Pages | Admin transfer screenshot + API check | Login confirmation by buyer |
| Software licenses | SaaS platforms, source code repos | License key delivery + repo transfer | Buyer acceptance within 7 days |
| Digital collectibles / NFTs | Art, music rights | Smart contract transfer confirmation | On-chain event |
| Websites & apps | E-commerce sites | Hosting transfer + uptime check | Buyer access confirmation |

### 4.2 Legal Data Packages *(New Category)*
Sensitive but legally saleable information — the core innovation category.

| Sub-class | Examples | Verification Method | Release Trigger |
|---|---|---|---|
| Customer databases | CRM exports, subscriber lists | Sample data escrow + format verification | Full data delivery to secure vault |
| Legal judgments | Winning a court debt, IP rights | Certified copy + lawyer attestation | Document delivery + NDA execution |
| Intellectual property | Patents, trademarks, trade secrets | IP registry search + legal attestation | Assignment deed signed + filed |
| Business contracts | Long-term supplier agreements, exclusive rights | Lawyer-notarized copies | Contract assignment executed |
| Insurance claims | Assigned receivables | Insurer confirmation | Claim payment receipt |
| Franchise agreements | Territory rights, brand licenses | Franchisor confirmation | Assignment letter |

> **Privacy & Compliance Note:** TrustBridge EA does not facilitate transfer of personal data that cannot legally be sold (medical records, biometric data, government IDs). The platform enforces a mandatory legal attestation that confirms the data is lawfully transferable. GDPR/PDPA compliance is buyer's responsibility; TrustBridge provides the secure transfer channel only.

### 4.3 Physical Goods
| Sub-class | Examples | Verification Method | Release Trigger |
|---|---|---|---|
| Vehicles | Cars, motorbikes, tuk-tuks | NTSA logbook check + physical inspection | Logbook transfer confirmed |
| Livestock | Cattle, poultry, goats | Agent visit + tagging/count verification | Delivery receipt signed by agent |
| Electronics & valuables | Laptops, phones, watches, art | Photo evidence + serial number check | Buyer inspection acceptance |
| Agricultural produce | Grain, coffee, produce | Weight receipt + lab quality certificate | Delivery confirmation |
| Machinery & equipment | Industrial, farm equipment | Engineer inspection report | Site delivery + buyer sign-off |
| Imported goods | Goods in transit | Bill of Lading + customs clearance | Delivery order release |

### 4.4 Real Property
| Sub-class | Examples | Verification Method | Release Trigger |
|---|---|---|---|
| Residential land | Plots, title deeds | Lands Registry search + county GIS | Title transfer completion |
| Commercial property | Offices, retail spaces | Same + valuation report | Title + possession transfer |
| Agricultural land | Farms, ranches | Same + Ministry of Agriculture clearance | Title transfer |
| Leasehold | Office/retail leases | Landlord consent letter + lease deed | Lease assignment completion |
| Development rights | Air rights, mineral rights | Legal opinion + registry | Assignment deed |

### 4.5 Business Acquisitions
| Sub-class | Examples | Verification Method | Release Trigger |
|---|---|---|---|
| Full business sale | Kiosk, SME, franchise | Audited accounts + lawyer SPA | Business transfer completion |
| Customer database (commercial) | Going-concern CRM | Data sample + format check | Full delivery confirmation |
| Goodwill / brand | Trading name, reputation | Lawyer-prepared asset schedule | Assignment deed signed |
| Staff contracts | Key employee agreements | HR document review | Employment transfer confirmed |
| Inventory | Stock at handover | Physical count by agent | Count agreed by both parties |

### 4.6 Professional Services (Milestone-Based)
| Sub-class | Examples | Verification Method | Release Trigger |
|---|---|---|---|
| Software development | App builds, websites | Code delivery + UAT period | Buyer UAT approval |
| Legal / consulting | Audit reports, legal opinions | Document delivery | Acceptance or period expiry |
| Creative services | Design, content, video | File delivery | Acceptance or period expiry |
| Construction milestones | Building phases | Engineer's certificate | Certificate + buyer acceptance |
| Research / data analysis | Reports, models | File delivery | Acceptance |

### 4.7 Financial Instruments *(Future Phase)*
- Accounts receivable / invoice factoring
- Post-dated cheque escrow
- Bond / surety instrument escrow

---

## 5. Feature Requirements

### 5.1 Payment Rails (Priority 1)

**M-Pesa (Safaricom)**
- STK Push for amounts ≤ KES 300,000 (Safaricom API limit)
- Paybill for amounts above limit (multi-payment, aggregated)
- M-Pesa Express (Daraja API) — real-time confirmation
- Automatic reconciliation with transaction ID matching

**Pesalink / RTGS**
- Local bank transfers via Pesalink (Equity, KCB, NCBA, Co-op, Stanbic)
- Real-time EFT confirmation via Kenya Bankers Association rails

**International Payments**
- SWIFT wire (existing)
- USDC / stablecoin (existing)
- Flutterwave / Chipper Cash for cross-border EA (Uganda, Tanzania, Rwanda, Ghana)

**Card Payments**
- Mastercard / Visa (PCI-DSS compliant vault, existing)
- KENSWITCH (local debit network)

### 5.2 Multi-Currency Engine

- Display and transact in: KES (primary), UGX, TZS, RWF, USD, EUR, GBP
- FX rates sourced from Central Bank of Kenya + live feed (update every 15 min)
- Fee calculation always in transaction currency
- Settlement to seller can be in different currency (e.g. buyer pays KES, seller receives USD)
- Historical rate locked at transaction creation time

### 5.3 Milestone-Based Escrow

- Escrow creator defines 1–10 milestones at transaction setup
- Each milestone has: name, amount (fixed or %), conditions, due date
- Partial release per milestone (e.g. 30% on delivery, 30% on UAT, 40% on go-live)
- Any milestone can be disputed independently without blocking others
- Milestone completion requires: seller upload → buyer acceptance → auto-release after inspection window
- Visual milestone tracker on transaction detail screen

### 5.4 Multi-Party Transactions

- Support up to 5 parties per transaction (e.g. Buyer, Seller, Agent, Lawyer, Lender)
- Each party has a defined role with specific permissions:
  - **Buyer**: funds escrow, approves release, can dispute
  - **Seller**: confirms delivery, uploads evidence, receives funds
  - **Agent / Inspector**: verifies physical delivery, submits inspection report
  - **Lawyer / Notary**: attests legal documents, cosigns release
  - **Observer**: read-only audit trail access (e.g. bank, investor)
- Party invitation via email, phone number, or M-Pesa number
- All parties must e-sign transaction agreement before funds are locked

### 5.5 Agent / Inspector Network

- TrustBridge-verified agents across major EA counties (Nairobi, Mombasa, Kisumu, Kampala, Dar es Salaam, Kigali)
- Agent assigned per transaction based on: geography, asset type, availability
- Agent workflow: receive assignment → confirm acceptance → conduct physical inspection → upload report + photos + GPS coordinates → submit
- Agent fees: paid from escrow (standard rate per asset class or negotiated)
- Agent rating system (buyer rates agent post-transaction)

### 5.6 Data Room (Legal Data Package Transfers)

- Dedicated secure vault for sensitive document transfers
- NDA execution gate: buyer must e-sign NDA before accessing any data room content
- Data room holds: documents, spreadsheets, databases, contracts
- Seller uploads to encrypted vault before funds are released
- Buyer confirms receipt and reviews within inspection window
- Automatic delivery log (timestamp, file hash, access log)
- NDA is generated by TrustBridge template + can be customized by lawyer
- All data room activity is immutable audit trail

### 5.7 KYC / AML Enhancement

**Tier 1 (existing, up to KES 50,000)**
- Phone number + M-Pesa verification
- Basic selfie check

**Tier 2 (up to KES 1,000,000)**
- Government ID (Kenyan National ID, Passport, Alien ID)
- Liveness check (3D face scan)
- Proof of address

**Tier 3 (up to KES 10,000,000)**
- Tier 2 +
- Source of funds declaration
- Bank statement (3 months)
- Manual review within 48 hours

**Tier 4 — Institutional / Corporate (unlimited)**
- Certificate of Incorporation
- CR12 (list of directors, Kenya)
- Company KYC on all directors (Tier 2 each)
- Ultimate Beneficial Owner declaration
- AML screening (PEP, sanctions list)
- Relationship manager assigned

**Business Verification**
- M-Pesa Business number verification
- KRA PIN verification (for Kenyan businesses)
- NSSF / NHIF registration
- Business permit / county license

### 5.8 Dispute Resolution

*(Significant enhancement to existing dispute.html)*

**Resolution Tiers:**
1. **Bilateral Negotiation** (0–72 hours): Platform-facilitated, parties negotiate directly
2. **TrustBridge Mediation** (72h–14 days): Assigned mediator reviews evidence, proposes resolution
3. **Expert Determination** (14–30 days): Domain expert (e.g. property valuer, IT auditor, livestock expert) gives binding opinion
4. **Arbitration** (30–90 days): Formal arbitration via Nairobi Centre for International Arbitration (NCIA)

**Evidence Types:**
- Documents, photos, videos
- GPS location stamps (for physical delivery disputes)
- Communication logs (on-platform messages only)
- Agent inspection report
- Third-party expert report

**Outcomes:**
- Full release to seller
- Full refund to buyer
- Partial split (e.g. 60/40)
- Conditional re-delivery (seller must redo)
- Escalation to next tier

### 5.9 Notifications System

- In-app notification center
- SMS (Africa's Talking / Twilio EA)
- WhatsApp Business API (critical for EA market)
- Email
- Push notifications (mobile app, future phase)

**Key notification events:**
- Transaction created / invited as party
- Funds received / secured
- Milestone due / completed
- Inspection period expiring (48h, 24h, 1h warnings)
- Dispute opened / status changed
- KYC approved / rejected
- Agent assigned / inspection completed
- Funds released to your account

### 5.10 USSD Fallback

- Basic USSD menu for low-connectivity / feature phone users
- Enables: check transaction status, approve milestone release, receive SMS OTP confirmation
- Critical for agricultural / rural users
- Accessible via *XXX# shortcode (Safaricom, Airtel, Telkom Kenya)

### 5.11 Fee Structure

| Transaction Size (KES) | Fee |
|---|---|
| 0 – 50,000 | 2.5% |
| 50,001 – 500,000 | 2.0% |
| 500,001 – 5,000,000 | 1.5% |
| 5,000,001 – 50,000,000 | 1.0% |
| 50M+ | Negotiated (0.3–0.75%) |

Additional fees:
- Agent inspection: KES 2,000–15,000 (by asset class and distance)
- Data room setup: KES 5,000 flat
- Express mediation: KES 10,000 (refunded to winning party)
- Currency conversion: 0.75% on FX transactions

---

## 6. New Screens Required

Beyond the existing 6 screens, the following are needed:

### Core App Screens
1. **Onboarding Flow** — Registration, phone verification (M-Pesa OTP), KYC tier selection
2. **Transaction Creator** — Multi-step wizard: asset type → parties → terms → milestones → payment method → review → sign
3. **Seller Dashboard** — Mirror of buyer dashboard with seller-specific actions and metrics
4. **Notifications Center** — All alerts, grouped by transaction, with mark-read and filter
5. **Settings / Profile** — Personal info, KYC status, payment methods, notification preferences, 2FA
6. **Milestone Tracker** — Visual breakdown of multi-milestone transaction with upload/approve per milestone
7. **Audit Trail Viewer** — Immutable log of all transaction events with timestamp, actor, action, hash
8. **Agent Assignment** — Selecting / viewing assigned inspector, map view, inspection status
9. **Data Room** — NDA gate, secure file vault, download log, delivery confirmation
10. **Fee Calculator** — Interactive calculator for transaction size, currency, asset type, optional add-ons
11. **Multi-Party Invite** — Add parties by phone/email, assign roles, collect e-signatures
12. **Currency Selector** — Set transaction currency, view live FX rates, lock rate
13. **MPESA Payment Flow** — STK Push UI, Paybill instructions, confirmation polling screen
14. **Business KYC Flow** — Company verification separate from individual KYC

### Marketing / Public Screens
15. **Pricing Page** — Fee table, calculator, tier comparison
16. **Asset Class Directory** — Visual guide to all supported escrow types (SEO + onboarding)
17. **Trust & Security Page** — Regulatory status, certifications, technology stack
18. **Agent Network Map** — Interactive map of verified inspectors by region
19. **API Documentation** (developer landing page)
20. **Blog / Insights** (trust-building content, EA market case studies)

---

## 7. Regulatory & Compliance Requirements

### Kenya
- **CBK Approval**: Application under the National Payment System Act (CBK/RFI license or PSP license)
- **CMA**: If escrowing securities or investment instruments
- **KRA Integration**: Withholding tax on payments above KES 30,000 to individuals (5% WHT)
- **AML/CFT**: Compliance with Proceeds of Crime and Anti-Money Laundering Act (POCAMLA)
- **Data Protection**: Kenya Data Protection Act 2019 (DPA) — appoint Data Protection Officer

### Regional
- **Uganda**: Bank of Uganda PSP license
- **Tanzania**: Bank of Tanzania Payment Systems license
- **Rwanda**: National Bank of Rwanda Electronic Money Issuer license

### International Data
- **GDPR**: For any EU-resident users or data originating in EU
- **PCI-DSS Level 1**: For card payment processing (existing, maintain)

---

## 8. Technical Architecture Notes

### Payment Integration Priority
1. M-Pesa Daraja API (STK Push + C2B + B2C) — **Sprint 1**
2. Pesalink / Kenya Bankers Association API — **Sprint 2**
3. Flutterwave (cross-border EA) — **Sprint 2**
4. KENSWITCH debit — **Sprint 3**

### Infrastructure
- Core: Next.js 15 (App Router) — consistent with existing stack
- Database: PostgreSQL with row-level security (financial data partitioning)
- File vault: S3-compatible with AES-256-at-rest, per-transaction encryption keys
- Audit log: Append-only log (consider QLDB or custom merkle-chain)
- SMS/WhatsApp: Africa's Talking (primary for EA), Twilio (fallback)
- KYC: Smile Identity (best EA coverage: Kenya, Uganda, Tanzania, Rwanda, Ghana, Nigeria)
- FX Rates: Central Bank of Kenya API + ExchangeRate-API fallback
- USSD: Africa's Talking USSD gateway

### Security
- All financial actions require TOTP 2FA or M-Pesa PIN confirmation
- Session binding to device fingerprint
- Encrypted messaging between parties (end-to-end for data room, in-transit for standard messages)
- Penetration testing before launch (CREST-certified firm)

---

## 9. Phased Rollout

### Phase 1 — MVP (Months 1–4)
**Target**: Nairobi-first, KES primary, digital + services assets

Screens to build: Transaction Creator, Seller Dashboard, M-Pesa Payment Flow, Milestone Tracker, Notifications Center, Settings, Onboarding

Asset classes: Digital assets, Professional services, Legal data packages (basic)

Payment rails: M-Pesa STK Push, Wire Transfer, USDC

KYC: Tier 1 + 2 (individual)

Languages: English

### Phase 2 — Physical Goods (Months 4–7)
Add: Physical goods, Vehicles (NTSA hook), Livestock, Agent network (Nairobi, Mombasa, Kisumu)

Add: Data Room, Agent Assignment, Audit Trail Viewer, Multi-Party Invite

Add: Pesalink, Flutterwave, Business KYC

Add: Dispute Expert Determination tier

### Phase 3 — Real Property (Months 7–12)
Add: Real Property module, Lands Registry integration

Add: Rwanda, Uganda, Tanzania localization (KYC rails per country, local currency)

Add: USSD fallback, Swahili language

Add: Business Acquisition module

### Phase 4 — Scale (Year 2)
- Government procurement pilot
- API for third-party integrations (lawyers, banks, property platforms)
- Mobile app (iOS + Android)
- Financial instruments (invoice factoring)

---

## 10. Success Metrics

| Metric | 6-Month Target | 12-Month Target |
|---|---|---|
| Gross Transaction Volume | KES 500M | KES 3B |
| Registered Users | 5,000 | 25,000 |
| Active Transactions (monthly) | 500 | 3,000 |
| Dispute Rate | < 8% | < 5% |
| Dispute Resolution Time (median) | < 5 days | < 3 days |
| KYC Tier 2 Completion Rate | > 60% | > 75% |
| NPS | > 45 | > 60 |
| Revenue (fees) | KES 10M | KES 45M |

---

## 11. Recommended Additional Categories (Beyond Brief)

These were not mentioned but represent high-value, underserved opportunities in EA:

1. **Diaspora Remittance Escrow** — Kenyan diaspora (UK, USA, Canada) sending money for property/goods purchases back home. Current tools (Western Union, Remitly) offer no purchase protection. Massive market.

2. **Agricultural Commodity Pre-financing** — Farmer receives partial payment upfront (seed money), balance released on harvest delivery. Integrates with cooperative societies and warehouse receipt systems.

3. **Education Fees Escrow** — Parent pays school fees into escrow; released to school at term-start confirmation. Protects against school closure / fee disputes.

4. **Construction Draw Escrow** — For self-build projects (nyumba ya mtu). Funds released in draws as building stages are certified by an engineer. Enormous market in Kenya's self-build sector.

5. **Vehicle Hire Purchase** — Escrow as structured payment facility for boda boda / tuk-tuk hire purchase schemes. Seller holds logbook in TrustBridge until final payment.

6. **Event / Vendor Deposits** — Wedding vendors, event companies, travel agents. Massive informal market with frequent fraud.

7. **Tender / Bid Bonds** — SMEs bidding on government or corporate tenders need to post bid bonds. TrustBridge can hold and automatically release/forfeit based on outcome.

8. **Employment / Staffing Escrow** — Employer deposits one month's salary into escrow; released to employee on job completion or retained as termination protection. Useful for domestic workers, short-term contracts.

---

*Document prepared by TrustBridge Product — Version 1.0 | May 2026*
*Next review: Sprint Planning Session, June 2026*