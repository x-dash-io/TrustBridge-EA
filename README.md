# TrustBridge EA — Master Document Suite
**Version 1.0 | May 2026**

This folder contains everything your team and AI agents need to build TrustBridge EA. Read this file first.

---

## Document Index

| File | Audience | Purpose |
|---|---|---|---|
| `README.md` | Everyone | This file. Start here. |
| `docs/01-PRD.md` | Product + Tech leads | Full product requirements, asset taxonomy, feature specs |
| `docs/02-TECH-SPEC.md` | Engineering team + AI agents | Stack, architecture, folder structure, data models, API contracts |
| `docs/03-AI-AGENT-PROMPTS.md` | AI agents (Cursor, Claude Code, etc.) | Copy-paste prompt packs for each build task |
| `docs/04-MANUAL-TASKS.md` | Founders + business team | Everything that cannot be automated: legal, regulatory, banking |
| `docs/05-TEAM-RESEARCH-REPORT.md` | Founders + business team | Market research, competitive landscape, EA-specific context |
| `LEGAL-GUIDE.md` | Founders + lawyer | How to get every legal document, license, and contract you need |
| `brand-spec.md` | Frontend devs + AI agents | Design tokens, component spec, screen inventory from HTML prototypes |

---

## How to Use This Suite

### For Founders
Read: `04`, `05`, `06` first. These contain everything that blocks technical progress if delayed. Start legal and banking processes immediately — they take 3–6 months.

### For Tech Lead / CTO
Read: `01`, `02`, then `07`. Use `02` to set up the monorepo. Use `07` to hand to frontend devs.

### For Developers
Read: `02`, `07`. Pick up individual task prompts from `03` when working with AI agents.

### For AI Agents (Cursor, Claude Code, Windsurf, etc.)
Feed prompts from `03` directly. Each prompt is self-contained with full context. Do not feed the entire PRD — use the task-specific prompts.

---

## Critical Path (First 8 Weeks)

```
Week 1–2:   Repo setup, design system, auth scaffold
Week 2–3:   Transaction Creator + Dashboard (buyer + seller)
Week 3–4:   M-Pesa integration (sandbox), KYC (Smile Identity sandbox)
Week 4–5:   Milestone tracker, notifications system
Week 5–6:   Data Room (file vault), Dispute module
Week 6–7:   Multi-party invite, agent assignment
Week 7–8:   Internal QA, security review, CBK pre-application prep
```

**Parallel track (Founders, from Week 1):**
- Engage lawyer → company structure + CBK/PSP license application
- Open Safaricom M-Pesa Business / Daraja API account
- Open escrow float accounts (KCB or Equity Bank)
- Register with KRA, Huduma Centre, Business Registration Service

---

## The Golden Rule

> **The HTML prototypes are the UI bible.** Every screen must match the TrustBridge visual language: paper background (`oklch(98% 0.004 95)`), oxblood accent, zero border-radius, hairline borders, Iowan Old Style display, IBM Plex Mono kickers. Never deviate without a design review.

---

## Team Structure Recommendation

For a small team + AI agents:

| Role | Human | AI Agent |
|---|---|---|
| Product / PM | 1 founder | PRD → ticket breakdown |
| Frontend | 1 dev | Cursor / Claude Code (UI components) |
| Backend | 1 dev | Claude Code (API routes, DB models) |
| Business / Legal | 1 founder | Research + manual tasks |
| QA | Shared | Playwright AI agent |