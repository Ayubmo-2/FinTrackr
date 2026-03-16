# FinTrackr

A personal finance tracker built as a full-stack SaaS — track income and expenses, set budgets, visualise spending trends, and upgrade to Pro for unlimited usage and CSV exports.

**Live site:** [FinTrackr([url](https://fintrackr-alpha.vercel.app/login))

**Test account:** `test@fintrackr.dev` / `Test1234!`

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit + RTK Query, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookie) |
| Payments | Stripe Subscriptions |
| Deploy | Vercel (frontend) · Railway (backend) |

---

## Features

- **Dashboard** — summary cards, 30-day spending line chart, category pie chart
- **Transactions** — create, edit, delete with filters (type, category, date range)
- **Budgets** — per-category monthly limits with live progress bars
- **Free tier** — 50 transactions/month
- **Pro tier ($5/mo)** — unlimited transactions + CSV export
- **Auth** — register, email verification, login, token rotation, forgot/reset password

---

## Environment variables

Key server vars:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `ACCESS_TOKEN_SECRET` | 64-byte hex string (`openssl rand -hex 64`) |
| `REFRESH_TOKEN_SECRET` | 64-byte hex string (`openssl rand -hex 64`) |
| `STRIPE_SECRET_KEY` | From Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or dashboard |
| `CLIENT_URL` | Your frontend URL (for CORS) |

---

## API overview

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/transactions
POST   /api/transactions
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/export   (Pro only)

GET    /api/budgets
POST   /api/budgets
DELETE /api/budgets/:id

GET    /api/stats/summary

POST   /api/stripe/checkout
GET    /api/stripe/portal
POST   /api/stripe/webhook
```
