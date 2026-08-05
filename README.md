# EduCap 🎓

**Student-first education loan risk planning platform.**

EduCap helps students understand the _true_ cost of their education loan before signing — modeling inflation-adjusted expenses, moratorium interest traps, EMI burden, and FOIR risk — with AI-driven salary forecasting and actionable plain-language diagnostics.

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or a hosted instance like Supabase)
- A Google Gemini API key (optional — app works without it using rule-based fallback)

### 1. Clone & set up environment

```bash
# Server
cp server/.env.example server/.env
# Fill in: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY
```

### 2. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Set up the database

```bash
cd server
npm run db:migrate   # Creates tables
npm run db:generate  # Generates Prisma client
```

### 4. Run in development

```bash
# Terminal 1 — server (port 3001)
cd server && npm run dev

# Terminal 2 — client (port 5173)
cd client && npm run dev
```

Visit **http://localhost:5173** 🚀

---

## Project Structure

```
EduCap/
├── client/                  # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/      # Navbar, FOIRGauge, Charts, ResultsPanel
│       ├── pages/           # Landing, Wizard, Auth, Dashboard, Compare
│       ├── services/        # Axios API client
│       ├── store/           # Zustand auth + wizard state
│       └── utils/           # Formatters, helpers
└── server/                  # Node.js + Express + TypeScript backend
    ├── src/
    │   ├── routes/          # auth, plans, calculate, export
    │   ├── services/        # financialEngine.ts, aiService.ts
    │   ├── middleware/       # JWT auth, premium guard
    │   └── utils/           # Prisma singleton
    └── prisma/
        └── schema.prisma    # User, Plan, RiskReport models
```

---

## Running Tests

```bash
cd server && npm test
```

Tests cover all financial formula functions (FR-1 through FR-5) with boundary conditions.

---

## Key Formulas

| Formula | Description |
|---|---|
| `Σ tuition×(1+i_edu)^n + living×(1+i_inf)^n` | Total inflated education expense |
| `P(1 + r×t)` / `P(1+r/12)^n` | Moratorium balance (simple / compound) |
| `P×r(1+r)^n / ((1+r)^n - 1)` | Monthly EMI (reducing balance) |
| `(EMI / Salary) × 100` | FOIR % |
| Safe ≤ 30% · Moderate 30–45% · High Stress >45% | Risk bands |

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `GEMINI_API_KEY` | Google Gemini API key (optional) |
| `PORT` | Server port (default: 3001) |
| `CLIENT_ORIGIN` | CORS allowed origin (default: http://localhost:5173) |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## Disclaimer

EduCap provides estimates and financial education, **not licensed financial advice**. All projections are based on inputs provided and carry inherent assumptions about future inflation and salary outcomes. Consult a certified financial advisor before making borrowing decisions.
