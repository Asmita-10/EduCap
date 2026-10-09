# EduCap 🎓 — Student Loan Risk Planning & Financial Decision Platform

**EduCap** is a student-first financial planning platform engineered to help students navigate the complexities of education loans. Built using a **deterministic Node.js calculation engine** combined with a **credit-efficient RAG AI Chatbot**, EduCap eliminates probabilistic AI errors in loan math while providing plain-language debt mitigation strategies and risk reports.

---

## 🚀 Key Features

- **Inflation-Adjusted Expense Forecasting:** Computes multi-year compounded tuition and living expense increases using customizable education (~8% p.a.) and general (~6% p.a.) inflation benchmarks.
- **Moratorium Interest Trap Detection:** Simulates interest accrual and capitalization during college study and grace periods, displaying exact total cost differences between full deferral and partial simple interest payments.
- **FOIR (Fixed Obligation to Income Ratio) Risk Rating:** Evaluates debt vulnerability by comparing projected post-graduation EMIs against expected entry-level salaries, categorizing risk into **Safe (≤30%)**, **Moderate (30%–45%)**, or **High Stress (>45%)**.
- **Deterministic Amortization Schedules:** Generates full year-by-year EMI repayment splits (Principal vs. Interest) with 100% mathematical precision.
- **Credit-Efficient RAG AI Assistant:** An in-memory RAG chatbot powered by `knowledgeBase.json` and `gemini-1.5-flash` that answers student financial queries without wasting API credits.
- **Simplified Financial Terms Glossary (`/terms-explained`):** A dedicated, single-column full-width glossary explaining complex loan terms (Moratorium, FOIR, Amortization, Section 80E, Collateral) in plain language with real-time keyword search.
- **Downloadable PDF Reports:** Exports comprehensive loan risk breakdowns for side-by-side plan comparisons and offline review.
- **Secure Dual Portal & Authentication:** Built-in JWT authentication with role enforcement (`STUDENT` vs `ADMIN`) and automated database seeding on server startup.

---

## 🛠️ Tech Stack Architecture

### Frontend
- **Framework:** React.js + TypeScript (Vite)
- **Styling:** Tailwind CSS (Theme: Warm Light Cream `#FAF9F6` / `#F2F0ED`, Slate `#111827`, Emerald Accent `#1E5D50`)
- **Icons & UI Utilities:** Lucide React (`lucide-react`), Framer Motion (`framer-motion`)
- **HTTP Client:** Axios (Custom API instances)
- **Deployment:** Render / Vercel

### Backend
- **Runtime:** Node.js + Express.js (TypeScript)
- **Financial Calculation Engine:** Custom deterministic Node.js mathematical engine (Zero LLM reliance for arithmetic)
- **Authentication:** JSON Web Tokens (JWT) & `bcryptjs` password hashing
- **Deployment:** Render Web Services

### AI & Data Engine
- **Primary AI Model:** Google Gemini API (`gemini-1.5-flash`)
- **RAG Architecture:** Hybrid In-Memory Token Matching & Fallback Retrieval
- **Knowledge Base:** 15-item structured JSON database (`knowledgeBase.json`) covering loan rules, RBI guidelines, tax benefits (Section 80E), credit score impacts, and bank comparisons.

### Database & Security
- **Database:** MongoDB Atlas (Cloud NoSQL)
- **ORM:** Prisma ORM (`@prisma/client`)
- **Automated Seeding:** Startup database seeder (`ensureAdminExists()`)

---

## 🧠 How the RAG Chatbot Works

To balance mathematical accuracy, high-quality responses, and credit efficiency, EduCap uses a **Hybrid RAG Pipeline**:

```text
[User Query]
     │
     ▼
[Token & Keyword Search] ──► (Matches against knowledgeBase.json)
     │
     ├─► Relevant Match Found ──► Top 3-4 Chunks
     │
     └─► Low / No Keyword Match ─► Fallback: Passes Full Knowledge Base (~500 words)
     │
     ▼
[Gemini 1.5 Flash API]
     │
     ▼
[Conversational Answer / Out-of-Scope Fallback]
```

- **Domain Filter:** Queries completely unrelated to education financial planning (e.g., cricket scores, weather) are caught and safely returned with *"I don't have that information in my guide."*
- **Synthesis Engine:** The LLM reads the retrieved context and synthesizes natural 2–4 sentence responses rather than outputting raw verbatim JSON text.

---

## 📂 Repository Structure

```text
educap/
├── client/                      # React TypeScript Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI (Header, EduCapChatbot, Modals)
│   │   ├── pages/               # Page Views (Calculator, FinancialTermsPage, AdminLogin)
│   │   ├── services/            # Axios API Configuration
│   │   └── data/                # Local UI asset references
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # Express Node.js Backend
│   ├── src/
│   │   ├── controllers/         # ChatController, AuthController, CalcController
│   │   ├── routes/              # Express API Routes (/api/chat, /api/auth, /api/admin)
│   │   └── index.ts             # Server entry point & startup db seeder
│   ├── data/
│   │   └── knowledgeBase.json   # 15-item RAG Knowledge Base
│   ├── prisma/                  # Prisma Schema & MongoDB configurations
│   ├── seed.js                  # Standalone Database Seeder
│   └── package.json
└── README.md
```
---

## 🗝️ Default Admin Credentials

For testing and administrative portal access:

- **Admin Portal Path:** `/admin/login` 
- **Email:** `admin@gmail.com`
- **Password:** `password` 

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
