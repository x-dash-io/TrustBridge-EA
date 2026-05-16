# TrustBridge EA — Legal Document Guide
**How to get every legal document, contract, and license you need**
**For: Founders | Work with a financial services lawyer on all of these**

---

## Finding the Right Lawyer

You need a Kenyan commercial lawyer with experience in **fintech / financial services**. This is not optional — do not use a general practice lawyer for this.

**Recommended firms with fintech/FSI practice groups:**
- **Anjarwalla & Khanna (A&K)** — leading EA commercial firm, strong fintech practice. anjarwalla.com
- **Bowmans Kenya** — large regional firm, financial services regulatory team. bowmans.com
- **Coulson Harney LLP** — strong regulatory + banking practice. coulsonharney.com
- **Oraro & Company Advocates** — good for startups + fintech. oraro.co.ke

**Budget expectation**: KES 150,000–400,000 for the initial legal document suite. This is non-negotiable — cheap legal work on fintech documents is a liability, not a saving.

**First meeting agenda**: Bring this document + the PRD. Ask them to:
1. Review your proposed business model for regulatory compliance
2. Advise on CBK license pathway (PSP vs. alternative)
3. Scope and quote the legal documents below

---

## Document 1: Terms of Service

**What it is**: The master contract between TrustBridge and every user. Governs the entire relationship.

**How to get it**:
1. Have your lawyer draft from scratch for Kenyan law (don't use a US ToS template)
2. Must reference: Kenya's Law of Contract Act, Consumer Protection Act, National Payment System Act, Kenya Data Protection Act
3. Key clauses to insist on:
   - Escrow fee structure and how it's calculated
   - Fund release conditions and process
   - Your limitation of liability (cap it at the transaction fee amount, not the transaction value)
   - Dispute resolution process and binding nature of mediator decisions
   - Governing law: Kenya + Nairobi jurisdiction
   - Right to terminate/suspend accounts on fraud suspicion
   - KYC requirements and right to refuse service

**Negotiation point**: You are NOT liable if a seller misrepresents goods or a buyer is defrauding. Your liability is limited to the safe custody of funds and their proper release/return per the terms. Make this crystal clear.

**Must be reviewed by**: Lawyer. Then reviewed again after CBK pre-application meeting (CBK may have specific requirements).

---

## Document 2: Escrow Agreement (Transaction-Level)

**What it is**: The binding contract for each specific transaction. All parties (Buyer, Seller, TrustBridge) sign this. It supersedes informal agreements between buyer and seller.

**How to get it**: Have your lawyer draft a master template with variable fields:
- Transaction ID, date, parties
- Asset description
- Amount and currency
- Milestones and release conditions
- Inspection period
- Dispute resolution process specific to this transaction type
- Governing law

**Critical clause**: "Upon receipt of funds, TrustBridge holds the same as a stakeholder and not as agent for either party, and shall release funds only in accordance with the terms of this Agreement."

This "stakeholder" language is legally significant — it means you're neutral, not acting for either party, which protects you from claims that you breached a duty to one side.

**This is implemented in the platform** via DocuSeal — the agreement is generated automatically from the template and sent to all parties for e-signature before any funds are deposited.

---

## Document 3: Privacy Policy

**What it is**: Required by Kenya Data Protection Act 2019. Publicly published on your website and app.

**How to get it**:
- Lawyer drafts based on your actual data processing activities
- Must describe: what you collect (name, ID, phone, bank details, transaction data), why (KYC, fraud prevention, service delivery), how long you keep it, who you share it with (Smile Identity, AT, Flutterwave, etc.), users' rights (access, correction, deletion)
- Must include: how to contact your DPO, how to file a complaint with ODPC

**Free starting point**: ODPC publishes a Privacy Notice template on their website (odpc.go.ke). Use it as a checklist, not verbatim.

---

## Document 4: Non-Disclosure Agreement (Data Room)

**What it is**: The NDA users sign before accessing the Data Room in Legal Data Package transactions.

**How to get it**: Lawyer drafts. Specifically for your use case.

**Key clauses**:
- **Definition of Confidential Information**: Must clearly cover whatever the seller uploaded (database, contracts, customer list, etc.)
- **Permitted Purpose**: Buyer may only use the information for evaluating the purchase — not for any other purpose
- **Duration**: 2–5 years post-transaction (negotiate per deal; your template should have a default of 3 years)
- **Remedies**: Breach of NDA → injunctive relief (court can immediately stop disclosure) + damages. Specify KES X minimum damages.
- **Carve-outs**: Standard exceptions (publicly available info, independently developed, required by law)
- **Jurisdiction**: Kenya + Nairobi courts (unless both parties agree to arbitration)

**Important**: The NDA is between Buyer and Seller — TrustBridge is merely the platform facilitating the signing and holding the signed copy in the audit trail. TrustBridge should not be a party to the NDA itself (keeps you neutral).

---

## Document 5: Agent Agreement

**What it is**: Contract between TrustBridge and each verified inspection agent.

**Key clauses**:
- **Independent Contractor**: Agents are not employees. They are independent contractors. This is critical for employment law compliance.
- **Scope**: What the agent is and isn't authorized to do (inspect, report, NOT to negotiate on behalf of either party)
- **Confidentiality**: Agent cannot share transaction details with anyone outside the platform
- **Liability**: Agent is liable for negligent inspections (getting the facts wrong). TrustBridge is not liable for agent errors beyond returning the agent's fee.
- **Inspection Standards**: Attach an inspection checklist per asset class as a schedule
- **Payment**: How and when agents are paid (from escrow at transaction completion, X% of agent fee)
- **Termination**: Immediately for misconduct, fraud, or repeated negative ratings
- **Indemnity**: Agent indemnifies TrustBridge for claims arising from their negligent inspection

---

## Document 6: AML/CFT Policy

**What it is**: Internal policy document required by POCAMLA and CBK.

**How to get it**: Financial services lawyer drafts. Or use a compliance consultant who specializes in AML. Budget KES 80,000–150,000 for this specifically.

**Required sections**:
1. Policy Statement (commitment to AML/CFT compliance)
2. Risk Assessment Framework (what transactions/customers are high risk)
3. Customer Due Diligence (CDD) / KYC procedures
4. Enhanced Due Diligence (EDD) for high-risk customers (PEPs, high-value transactions)
5. Transaction Monitoring (how you detect suspicious transactions — threshold rules, unusual patterns)
6. Suspicious Transaction Reporting (STR) procedures — who decides, how to file with FRC
7. Record Keeping (what records, for how long — minimum 5 years under POCAMLA)
8. Staff Training (annual requirement, new hire requirement)
9. Compliance Officer role and responsibilities
10. Internal audit / review schedule

**Practical AML rules to implement in the platform** (these come from the policy):
- Flag for manual review: any transaction > KES 1,000,000 first time from a new account
- Flag: buyer and seller with same phone number or same IP address
- Flag: rapid succession of transactions (> 5 in 24 hours) to different counterparties
- Flag: accounts that fund escrow but never complete transactions (structuring behavior)
- Auto-reject: PEP screening hits (use Smile Identity's PEP/sanctions screening add-on)

---

## Document 7: Data Processing Agreements (DPAs)

**What it is**: Contract between TrustBridge and each third-party processor that handles user personal data.

**Who you need DPAs with**:
- Smile Identity (processes ID documents + biometrics)
- Africa's Talking (processes phone numbers + message content)
- Supabase (stores all data)
- Flutterwave (processes payment data)
- Resend (processes email addresses)
- DocuSeal (processes signed agreements)

**How to get them**: Most reputable providers (Supabase, Flutterwave, AT, Smile ID) have standard DPAs they'll sign. Request their DPA from their legal/sales team. Review with your lawyer before signing.

**What to check in their DPA**:
- They agree to process data only on your instructions
- They have adequate security measures
- They agree to notify you of data breaches within 72 hours
- They agree to allow audits
- They will delete/return data on your request
- Sub-processors are listed and you're notified of changes

---

## Document 8: CBK License Application Package

This is not a single document but a package. Your lawyer will assemble it.

**What's in the package**:
1. Covering letter addressed to CBK Governor
2. Completed CBK application form (download from cbk.go.ke)
3. Business Plan (30–50 pages — your lawyer + you write this together)
4. Organizational chart + CVs of all directors
5. Fit & Proper Declaration forms (one per director — CBK checks criminal records, financial history, professional track record)
6. Audited financial statements (if you have them — for a new company, management accounts are acceptable)
7. Capital confirmation (bank statement showing KES 20M+ paid-up capital)
8. IT Security Policy
9. Business Continuity Plan
10. AML/CFT Policy (Document 6 above)
11. Escrow/Client Money Policy
12. Sample Terms of Service + Escrow Agreement
13. Proposed fee schedule
14. Sample KYC procedures

**How the process works**:
1. Submit package to CBK payments department
2. CBK acknowledges receipt (2–4 weeks)
3. CBK sends queries / requests for additional information (ongoing, 3–6 months)
4. CBK may conduct a site visit
5. In-principle approval issued (conditional) — you can soft-launch with restrictions
6. Final license issued once conditions met

**While waiting for the license**: Operate your sandbox/beta. Keep total float under KES 1M. Be transparent with your beta users about your license status. Some fintechs display "CBK License Application Pending" in their footer.

---

## Document 9: Certificate of Good Conduct (for Founders + Key Staff)

**What it is**: Background check certificate from Kenya's Directorate of Criminal Investigations (DCI)
**Why you need it**: CBK will ask for it. Banks will ask for it. Shows no criminal record.
**Where**: dci.go.ke or Huduma Centre
**Cost**: KES 1,050
**Timeline**: 2–3 weeks
**How**: Apply online at dci.go.ke → Certificate of Good Conduct. Fingerprinting required (done at Huduma Centre or DCI offices).

---

## How the Legal Documents Connect

```
User registers → accepts Terms of Service
         ↓
User creates transaction → Transaction Agreement auto-generated 
                           (from Document 2 template, all parties sign via DocuSeal)
         ↓
If Legal Data Package → NDA generated (Document 4 template, buyer signs before data room access)
         ↓
Physical goods → Agent assigned → Agent has signed Agent Agreement (Document 5)
         ↓
All transactions → Governed by Privacy Policy (Document 3)
         ↓
CBK oversight → Enabled by PSP License (Document 8) + AML Policy (Document 6)
         ↓
Third-party data → DPAs in place with all processors (Document 7)
```

---

## Timeline for Legal Setup

| Action | When | Cost (KES) |
|---|---|---|
| Engage lawyer | Week 1 | First meeting: ~10,000 |
| Company registration (eCitizen) | Week 1 | 10,650 |
| KRA PIN | Week 1 | Free |
| Bank accounts open | Week 2–3 | Varies |
| Certificate of Good Conduct | Week 2 | 1,050/person |
| DPA requests to all providers | Week 2 | Free |
| ODPC registration | Week 3–4 | 5,000 |
| Privacy Policy draft | Week 3–4 | 30,000–50,000 |
| Terms of Service draft | Week 3–6 | 80,000–150,000 |
| Escrow Agreement template | Week 4–6 | 60,000–100,000 |
| NDA template | Week 4–6 | 30,000–50,000 |
| Agent Agreement | Week 4–6 | 30,000–50,000 |
| AML/CFT Policy | Week 4–8 | 80,000–150,000 |
| CBK pre-application meeting | Month 2 | Free |
| FRC registration | Month 2 | Minimal |
| CBK PSP application submitted | Month 3 | CBK fee + lawyer |
| Safaricom Daraja production | Month 2–3 | Free |
| **Total legal budget estimate** | | **KES 400,000–650,000** |

---

## Important: What to Do If You Get a Legal Letter

If a user, counterparty, or regulator sends you a legal letter:
1. Do NOT respond yourself
2. Forward immediately to your lawyer
3. Do not admit liability in any communication
4. Preserve all records related to the matter (do not delete anything)
5. Notify your professional indemnity insurer

TrustBridge holds funds as a neutral stakeholder. You are not liable for the underlying transaction going wrong — you are liable only for failing to follow your own escrow procedures. Document everything, maintain your audit trail, and let the legal system work.