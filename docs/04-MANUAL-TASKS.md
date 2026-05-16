# TrustBridge EA — Manual Tasks
**Everything that cannot be built by AI agents or automated. Do these yourself, in parallel with development.**
**Owner: Founders | Start: Week 1**

---

## PRIORITY LEGEND
🔴 BLOCKER — Cannot go live without this  
🟡 IMPORTANT — Needed within 90 days  
🟢 NICE TO HAVE — Phase 2 or later  

---

## PART A: COMPANY & LEGAL SETUP

### A1. Company Registration 🔴
**What**: Register a limited liability company in Kenya (Private Limited Company)
**Where**: Business Registration Service (BRS) — ecitizen.go.ke
**What you need**:
- Proposed company names (3 options, in order of preference). Suggested: "TrustBridge Systems Limited" or "TrustBridge EA Limited"
- List of directors (minimum 1, maximum no limit)
- Director IDs (National ID or Passport for each)
- Share allocation plan (who owns what %)
- Registered office address in Kenya (can be a lawyer's address initially)
- KRA PINs for all directors

**Timeline**: 3–7 business days online via eCitizen
**Cost**: KES 10,650 (name search + registration fee)
**Output**: Certificate of Incorporation + CR12 + Memorandum & Articles of Association

**Action**: Go to ecitizen.go.ke → Business Registration Service → Company Registration → Private Limited Company

---

### A2. KRA PIN Registration (Company) 🔴
**What**: Register the company for tax with Kenya Revenue Authority
**Where**: itax.kra.go.ke
**What you need**: Certificate of Incorporation, director's KRA PINs
**Timeline**: Same day
**Cost**: Free
**Output**: Company KRA PIN (starts with P for companies, e.g. P051234567M)

**Note**: You need this before opening a bank account or registering for M-Pesa.

---

### A3. Open Company Bank Accounts 🔴
**What**: Open two separate accounts — Operating Account + Escrow Float Account
**Where**: KCB or Equity Bank (Nairobi branch, Upperhill or Westlands recommended)
**What you need**:
- Certificate of Incorporation
- CR12
- Company KRA PIN
- Directors' IDs (all directors present, or original + certified copies)
- Company seal (if you have one)
- Minimum opening balance (varies: KES 0–100,000 depending on account type)
- Board Resolution authorizing account opening and naming signatories

**Float account**: Specifically request a "Client Money Account" or "Escrow Account" — it MUST be clearly labeled as separate from operating funds. Ask the relationship manager for the PSP/fintech banking desk.

**Timeline**: 3–5 business days
**Cost**: Monthly fee (negotiate — often waived for the first 6 months for fintech startups)

**Key ask at the bank**: "We are building a payment service provider platform and will be applying for a CBK PSP license. We need an escrow float account that is separate from our operating account, with API access for balance queries and transaction monitoring."

---

### A4. VAT Registration 🟡
**What**: Register for VAT with KRA
**Where**: itax.kra.go.ke → VAT Registration
**When**: Once you expect turnover > KES 5M in 12 months (or voluntarily register earlier)
**Output**: VAT certificate, obligation to charge 16% VAT on fees and file monthly VAT returns

---

### A5. ODPC Registration (Data Protection) 🔴
**What**: Register as a Data Controller with the Office of the Data Protection Commissioner
**Where**: odpc.go.ke → Register as Data Controller/Processor
**What you need**: Company details, description of data processing activities, DPO appointment letter
**Timeline**: 1–2 weeks
**Cost**: KES 5,000 per year

**You must also**: Appoint a Data Protection Officer (can be a founder initially), draft a Privacy Policy (have a lawyer review), draft a Data Processing Agreement for any third parties you share data with (Smile Identity, Africa's Talking, etc.)

---

### A6. Physical Office / Registered Address 🟡
**What**: A real Nairobi address for regulatory, banking, and user trust purposes
**Options**:
- iHub (Nairobi) — premier tech hub, good for trust signaling
- Nairobi Garage (Westlands, Karen, Kilimani)
- Regus / IWG (multiple Nairobi locations)
- Your lawyer's address (temporary, for registration)

**Cost**: KES 8,000–30,000/month for a hot desk / registered address service
**Why it matters**: CBK requires a physical address. Banks require it. Kenyan users check it.

---

## PART B: REGULATORY LICENSES

### B1. CBK Payment Service Provider (PSP) License 🔴
**What**: The primary regulatory license. Required before accepting real money.
**Authority**: Central Bank of Kenya — payments@centralbank.go.ke
**Estimated timeline**: 6–18 months (start immediately)
**Estimated cost**: Legal fees KES 300,000–800,000 + CBK application fee

**What you need to prepare** (engage a financial services lawyer for this):
1. **Business Plan**: Full description of the service, target market, revenue model, projections (5 years)
2. **Organizational Structure**: Ownership chart, director CVs, fit & proper declarations
3. **Capital**: Minimum paid-up capital of KES 20,000,000 (confirmed in CBK guidelines for PSPs)
4. **AML/CFT Policy**: Full anti-money laundering policy document
5. **IT Security Policy**: Information security policy, data breach response plan
6. **Business Continuity Plan**: What happens if systems go down, key staff leave, etc.
7. **Escrow/Client Money Policy**: How you hold, segregate, and manage client funds
8. **Sample User Agreement / Terms of Service**
9. **Internal Audit Framework**

**How to start**: Write to CBK (payments@centralbank.go.ke) to request a pre-application meeting. They provide guidance on current requirements before you formally apply. This meeting is free and highly recommended.

**Can you operate before the license?**
- In sandbox/pilot: Yes — you can run a closed beta with invited users under the "innovation/testing" framework. Keep volumes low (< KES 1M total float) and be transparent with CBK about it.
- Publicly at scale: No. This is a hard legal requirement.

**Lawyer to engage**: Look for law firms with a dedicated financial services / fintech practice. Recommended: Coulson Harney LLP, Bowmans (Kenya), Anjarwalla & Khanna. Budget KES 400,000–800,000 for the license application support.

---

### B2. Financial Reporting Centre (FRC) Registration 🔴
**What**: Register as a "Reporting Institution" under POCAMLA (Anti-Money Laundering Act)
**Where**: frc.go.ke
**What you need**: Company details, AML/CFT policy, Compliance Officer details
**Timeline**: 2–4 weeks
**Cost**: Minimal administrative fee

**Your obligation**: File Suspicious Transaction Reports (STRs) when you detect suspicious activity. This is mandatory — failure is a criminal offense.

---

### B3. Safaricom Daraja Production Access 🔴
**What**: Move from M-Pesa sandbox to production (real transactions)
**Where**: developer.safaricom.co.ke
**Requirements for go-live**:
- Registered Paybill or Till number
- KRA PIN
- Certificate of Incorporation
- Bank account confirmation letter
- IT security questionnaire completion
- Integration testing evidence (screenshots of successful sandbox transactions)
- Live demo of your integration to Safaricom technical team

**Timeline**: 2–4 weeks after submitting all documents
**Contact**: developer@safaricom.co.ke + mpesa@safaricom.co.ke (for business Paybill)

**Do first**: Register for Paybill at safaricom.co.ke/business → M-Pesa for Business → Lipa Na M-Pesa. Requires an operator letter from your company, KRA PIN, bank account. Takes 1–2 weeks.

---

### B4. Communications Authority — USSD Shortcode 🟡
**What**: Apply for a USSD shortcode (*XXX#) via the Communications Authority of Kenya
**Where**: ca.go.ke or through Africa's Talking (they can apply on your behalf as a licensed aggregator)
**Timeline**: 4–8 weeks
**Cost**: ~ KES 50,000–100,000/year for a shared shortcode; more for dedicated
**Note**: Africa's Talking can lease you a shortcode from their existing allocation while you apply for your own. Start with this.

---

## PART C: THIRD-PARTY SERVICE ACCOUNTS

### C1. Smile Identity — Production Account 🔴
**What**: KYC API for ID verification
**URL**: developer.usesmileid.com
**Steps**:
1. Sign up for sandbox (instant)
2. Integrate sandbox (your dev team handles this)
3. Apply for production access — requires your company registration documents, description of use case, CBK license (or pre-application proof)
4. Sign their Data Processing Agreement
5. Production access granted after review (~1 week)

**Note**: Smile Identity's IPRS (Kenya ID database) access requires them to have a data-sharing agreement with Kenya's government. This is their agreement to maintain, not yours — verify it's active before going live.

---

### C2. Africa's Talking — Production Account 🔴
**What**: SMS, WhatsApp, and USSD
**URL**: africastalking.com
**Steps**:
1. Register business account
2. Fund SMS sandbox (small test credits)
3. For production SMS: verify business (KRA PIN, registration cert)
4. For WhatsApp Business API: submit Facebook Business Verification (takes 2–4 weeks). You'll need a Facebook Business Manager account linked to a verified business.
5. Request a Sender ID ("TrustBridg" — 11 chars max). Sender ID approval: 3–5 business days.

---

### C3. Flutterwave — Business Account 🟡
**What**: Card payments + cross-border EA
**URL**: app.flutterwave.com
**Steps**:
1. Register business account
2. Submit: Certificate of Incorporation, director IDs, bank account details, website URL, description of business
3. Review takes 24–48 hours
4. For full disbursement access: additional compliance review (~1 week)

---

### C4. DocuSeal — E-Signature Setup 🟡
**What**: E-signature for transaction agreements, NDAs
**URL**: docuseal.com (or self-host via GitHub — it's open source)
**Recommendation**: Self-host on Railway to keep all document data within your infrastructure
**Setup**: Docker deploy, connect to your Postgres DB. API docs at docuseal.com/docs.
**Cost**: Free (self-hosted). Cloud plan: $30/month for up to 100 envelopes.

---

## PART D: LEGAL DOCUMENTS YOU NEED

You need a commercial lawyer to draft or review all of the following. Budget KES 150,000–300,000 for the initial set. See `06-LEGAL-GUIDE.md` for detailed instructions on each.

### D1. User Terms of Service 🔴
The contract between TrustBridge and your users. Must include: escrow fee structure, dispute resolution process, fund release conditions, limitation of liability, governing law (Kenya).

### D2. Escrow Agreement Template 🔴
The contract between Buyer, Seller, and TrustBridge for each transaction. This is the legally binding document signed by all parties. The most important legal document you have.

### D3. Privacy Policy 🔴
Required by Kenya DPA 2019, GDPR (for EU-connected users), and app stores. Describes what data you collect, why, how it's used, and users' rights.

### D4. NDA Template (for Data Room) 🔴
Non-Disclosure Agreement for Legal Data Package transactions. Must be specific about: what data is covered, duration of confidentiality, permitted use, remedies for breach.

### D5. Agent Agreement 🔴
Contract between TrustBridge and each verified inspection agent. Covers: scope of work, liability, payment terms, code of conduct, termination.

### D6. Mediator Agreement 🟡
Contract between TrustBridge and dispute mediators. Covers: independence requirements, confidentiality, decision process, fees.

### D7. AML/CFT Policy 🔴
Internal policy document required for CBK license and FRC registration.

### D8. Data Processing Agreements (DPAs) 🔴
With each third-party that processes user data: Smile Identity, Africa's Talking, Resend, Supabase, Flutterwave.

---

## PART E: INSURANCE

### E1. Professional Indemnity Insurance 🟡
Covers claims arising from errors in your escrow service (wrong release, incorrect KYC decision, etc.)
**Provider**: Jubilee Insurance, CIC Insurance, or AAR — request "Professional Indemnity / Errors & Omissions" policy
**Typical cost**: 1.5–3% of insured sum per year

### E2. Cyber Liability Insurance 🟡
Covers data breaches, system compromise, and resulting liability
**Provider**: Same as above — ask specifically for "Cyber Liability" rider
**Required by**: Some enterprise clients. Becoming standard for fintech.

---

## PART F: OPERATIONS SETUP

### F1. Build an Escrow Float Reconciliation Process 🔴
**What you do (manually for now, automate later)**:
- Every morning: download transaction statement from your bank
- Cross-reference against TrustBridge DB: every 'funded' transaction should correspond to an incoming bank transfer
- Any discrepancy: investigate immediately
- Monthly: produce a reconciliation report (for your records + CBK if asked)

**Tool**: Build a simple internal admin page that shows: total funded transactions (sum from DB) vs. float account balance (manual input). Alert if difference > 1%.

### F2. Customer Support Process 🔴
**Before you build a support system**:
- WhatsApp Business number for support (separate from API number)
- Response time SLA: < 4 hours during business hours
- Escalation path for disputes involving > KES 500,000: founder reviews personally

**Support email**: support@trustbridge.co.ke (set up Google Workspace or Zoho)
**Support WhatsApp**: Dedicated Safaricom line, not a personal number

### F3. Agent Vetting Process 🔴
Before onboarding any inspection agent:
1. ID verification (run through Smile Identity — same as user Tier 2 KYC)
2. Background check (request Certificate of Good Conduct from DCI — dci.go.ke)
3. In-person interview (or video call for regional agents)
4. Reference check (2 professional references)
5. Sign Agent Agreement
6. Test assignment (one supervised inspection before live)
7. Training on how to use the platform + inspection standards per asset class

---

## PART G: ONGOING COMPLIANCE OBLIGATIONS

Once licensed and operating:

| Obligation | Frequency | Who | Regulator |
|---|---|---|---|
| Monthly VAT Return | Monthly (20th) | Finance | KRA |
| PAYE (payroll tax) | Monthly (9th) | Finance | KRA |
| Annual Tax Return | Annually (June) | Finance | KRA |
| STR (Suspicious Transaction Reports) | As needed | Compliance Officer | FRC |
| AML/CFT Training | Annually | All staff | Internal |
| CBK Prudential Reports | Quarterly | Finance | CBK |
| ODPC Annual Renewal | Annually | DPO | ODPC |
| Penetration Test | Annually | Tech | CBK requirement |
| External Audit | Annually | Finance | CBK requirement |
| Board Meeting Minutes | Quarterly | Secretary | BRS |