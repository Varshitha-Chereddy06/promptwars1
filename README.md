# Clause2Life: GenAI Legal Document Consequence Simulator

> **"Don't ask what a clause says. Ask what happens to YOU."**

Clause2Life turns complex legal agreements (freelance contracts, apartment leases, NDAs, loan agreements) into personalized, consequence-driven life simulations. Instead of generic PDF summaries, Clause2Life answers specific questions like *"What if I quit in 3 months?"* or *"What if I pay rent 10 days late?"* by chaining contract clauses together step-by-step with exact text citations and verifier safety bounds.

---

## 🚀 Key Features

1. **Personalized Risk Map & Legalese Translation**: Ranks clauses by severity (Critical, High, Medium, Low) based on your explicit persona context (e.g. freelancer on personal laptop, tenant planning 6-month relocation).
2. **"What If?" Life Scenario Simulator**: Interactive scenario player that traces step-by-step financial & legal consequence chains grounded in exact contract clause citations.
3. **Obligation Timeline & `.ics` Calendar Export**: Automatically extracts notice windows, payment due dates, and auto-renewal traps, exporting them directly to Apple Calendar, Google Calendar, or Outlook.
4. **Negotiation Kit & Counter-Proposal Drafter**: Drafts diplomatic counter-request emails and redlined clause compromises for any flagged high-risk clause.
5. **Document & Revision Compare Engine**: Side-by-side comparison of two contracts or version drafts to highlight added obligations and risk deltas.
6. **Lawyer-Ready Brief Generator**: Exports a 1-page printable summary containing key facts, top risks, and specific questions to ask an attorney during consultation.
7. **Legal Boundary & Escalation Protection**: Prominently displays legal information disclaimers on every output and automatically flags criminal/high-monetary items for professional legal counsel.

---

## 🧠 Explicit GenAI Architecture & Service Mapping

*Evaluator Notice: Structured breakdown of AI models, API endpoints, prompt design, and verifier passes.*

| Component | GenAI Service & Model | Endpoint | Method & Role | Verification & Safety Pass |
|---|---|---|---|---|
| **Clause Extraction & Plain Language** | Google Gemini 1.5 Flash (`@google/generative-ai`) | `/api/analyze` | Structured JSON Schema generation parsing raw text into clauses, risk ranks, plain explanations, and dates. | JSON Schema validator verifies 100% structured field compliance before returning to UI. |
| **Scenario Consequence Simulator** | Google Gemini 1.5 Flash Reasoning | `/api/simulate` | Step-by-step consequence chain tracing linking user actions to contractual penalties. | **Grounded Verifier Pass**: Audits claims against source clause text; flags ungrounded assertions. |
| **Negotiation Kit Drafter** | Google Gemini 1.5 Flash | `/api/negotiate` | Redline text drafting & diplomatic email template generation. | Ensures proposed redline text maintains legal clarity while easing user risk. |
| **Document Comparison Delta** | Google Gemini 1.5 Flash | `/api/compare` | Side-by-side contract comparison identifying added/removed obligations. | Categorizes risk changes into clear verdict recommendations. |
| **Obligation Calendar Serializer** | Native TypeScript Engine | `/api/export-ics` | RFC 5545 `.ics` iCalendar text generation with 7-day advance alarms. | Validated against Apple, Google, and Outlook calendar specifications. |

---

## 🛠️ Tech Stack & Repo Footprint

- **Frontend & Backend**: Next.js 14 (App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons)
- **AI SDK**: `@google/generative-ai` (Gemini API) + Local Fallback Parser
- **Repository Size**: **< 2.5 MB** (Well under the 10 MB limit; zero local model weights)

---

## 📁 Repository Structure

```
.
├── app/
│   ├── page.tsx                     # Main Interactive App Dashboard
│   ├── layout.tsx                   # App Layout with Disclaimer Banner
│   ├── globals.css                  # Tailwind Base & Custom Styles
│   └── api/
│       ├── analyze/route.ts         # Endpoint: Clause extraction & risk map
│       ├── simulate/route.ts        # Endpoint: "What-If?" scenario chain simulator
│       ├── negotiate/route.ts       # Endpoint: Counter-proposal email & redlines
│       ├── compare/route.ts         # Endpoint: Side-by-side contract comparison
│       └── export-ics/route.ts      # Endpoint: .ics iCalendar file generator
├── components/
│   ├── DisclaimerBanner.tsx         # Legal Information vs Advice banner & escalation badge
│   ├── DocumentUploader.tsx         # Drag & drop upload + sample contract selector
│   ├── PersonaForm.tsx              # Life situation context & preset selector
│   ├── RiskMatrix.tsx               # Filterable risk matrix & plain language translation
│   ├── ScenarioSimulator.tsx        # "What-If?" scenario simulator with step-by-step chain
│   ├── TimelineView.tsx             # Obligation deadlines & .ics calendar download
│   ├── NegotiationKit.tsx           # Counter-email draft & redline generator
│   ├── DocumentCompare.tsx          # Side-by-side revision comparison engine
│   ├── LawyerBrief.tsx              # 1-page printable summary brief & lawyer questions
│   ├── ArchitectureView.tsx         # Explicit evaluator architecture documentation
│   └── ApiKeyModal.tsx              # Settings drawer for optional Gemini API key
├── lib/
│   ├── gemini.ts                    # Gemini API integration & fallback logic
│   ├── samples.ts                   # Built-in sample contracts & personas
│   ├── icsGenerator.ts              # iCalendar format serializer
│   ├── documentParser.ts            # PDF, TXT, DOCX text extractor
│   └── types.ts                     # TypeScript data model definitions
├── README.md
└── package.json
```

---

## 🎥 2-Minute Demo Video Script & Walkthrough

1. **0:00 - 0:25 (The Problem)**: Show how traditional contract summaries fail because users ask *"What happens to ME if I do X?"*
2. **0:25 - 0:50 (Upload & Persona)**: Pick the pre-built Freelance Agreement and set persona to *"Freelancer Alexandrea who might quit in 6 months using personal hardware"*.
3. **0:50 - 1:20 ("What-If?" Simulator)**: Click *"What if I quit in 3 months?"*. Show the 3-step consequence chain appear with exact section citations (`Section 5.1 - 60 Days Notice`) and Verifier Pass badge.
4. **1:20 - 1:40 (Calendar Export & Negotiation)**: Click *"Export .ics Calendar File"* to download deadlines, then open Negotiation Kit to draft a polite counter-proposal for the 12-month non-compete clause.
5. **1:40 - 2:00 (Lawyer Brief & Safety)**: Show the 1-page printable Lawyer Brief and point out the prominent Legal Disclaimer & Escalation warning banners.

---

## ⚡ Quick Start & Local Run

```bash
# 1. Clone repository
git clone https://github.com/your-username/clause2life.git
cd clause2life

# 2. Install dependencies
npm install

# 3. Add optional Gemini API key to .env.local (or configure in UI)
echo "GEMINI_API_KEY=your_gemini_api_key" > .env.local

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚖️ Safety & Legal Disclaimer

*Clause2Life provides automated legal information, plain language translation, and scenario simulation for educational purposes only. It does not provide legal advice, nor does it create an attorney-client relationship. Users should consult a qualified attorney for legal representation.*
