<div align="center">

# CoreGrid

### The Autonomous Enterprise System

**One intelligent grid for HR, CRM, Inventory, Finance & Projects — with private, on-device AI.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](#-license)

[**Live Demo**](https://coregrid.vercel.app) · [Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Deploy](#-deployment)

</div>

---

## ✦ Overview

**CoreGrid** is a full-stack, production-grade **Enterprise Resource Planning (ERP)** platform that unifies a company's core operations into a single, calm workspace. It pairs a deeply relational data model (30+ entities) with **role-based access control**, **live cross-module analytics**, and **privacy-first AI** that runs locally through [Ollama](https://ollama.ai) — so sensitive business data never leaves your infrastructure.

It ships in two modes:

- **🛰️ Standalone Demo Mode** — runs anywhere (including Vercel) with **zero backend**. A realistic sample company is served from an in-memory, Prisma-compatible engine so you can explore the entire product instantly.
- **🏢 Full Mode** — backed by PostgreSQL, NextAuth and Ollama for real deployments.

> **Try it now:** the [live demo](https://coregrid.vercel.app) loads a complete sample enterprise — 60 employees, 20 customers, a $4M+ pipeline, invoices, projects and more. No signup required.

---

## ✦ Features

### Core modules

| Module | What it does |
| --- | --- |
| 📊 **Dashboard** | Real-time, cross-module KPIs, trends and alerts |
| 👥 **HR** | Employees, departments, attendance, payroll, leave, reviews |
| 📈 **CRM** | Customers, contacts, deal pipeline, activities |
| 📦 **Inventory** | Products, categories, suppliers, stock movements, purchase orders |
| 💰 **Finance** | Invoicing, expenses, approvals, collection & financial reports |
| 🗂️ **Projects** | Boards, tasks, priorities, time logs tied to departments |

### Platform

- **🤖 Private AI** — local LLM analysis for HR, finance, inventory, sales & projects; AI email drafting and resume parsing. Nothing is sent to a third party.
- **🔐 RBAC** — seven roles (Admin, HR, Sales, Inventory, Finance, Project Manager, Employee) enforced in middleware and on the server.
- **🧾 Audit logging** — every critical action recorded.
- **🧱 Universal data tables** — sort, filter, paginate and export across every record.
- **🎨 Cinematic UI** — handcrafted dark interface, responsive to mobile, with real photography (no template look).
- **⚡ Type-safe end to end** — TypeScript, Zod validation, Prisma models.

---

## ✦ Tech Stack

**Frontend** · Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui · Recharts · React Hook Form + Zod
**Backend** · Next.js Route Handlers · Prisma ORM · PostgreSQL · NextAuth.js · bcrypt
**AI** · Ollama (local LLM, e.g. Llama 3.2)
**Tooling / Ops** · Docker & Docker Compose · Nginx · Vercel

---

## ✦ Architecture

```
app/
├─ (dashboard)/        Authenticated workspace (HR, CRM, Inventory, Finance, Projects…)
├─ auth/               Login & register (cinematic split-screen)
├─ api/                Route handlers per module + analytics + AI
└─ page.tsx            Marketing landing page

components/            UI primitives, charts, layout, marketing sections
lib/
├─ auth/               Session + RBAC helpers
├─ ai/                 Ollama client & domain assistants
├─ demo/               Standalone demo engine (see below)
└─ images.ts           Curated Unsplash photography manifest
prisma/                Schema (30+ models) + seed
```

### The standalone demo engine

To make the product fully explorable without a database, `lib/demo/` implements a **Prisma-compatible in-memory query engine**:

- `dataset.ts` — a deterministic, realistic sample company (employees, customers, deals, invoices, projects…).
- `engine.ts` — supports `findMany / findFirst / findUnique / count / aggregate / groupBy` plus `where`, `include`, `select`, `orderBy`, `take`, and Decimal handling — the same surface the app already uses.
- `prisma.ts` transparently swaps the real client for the demo engine when `NEXT_PUBLIC_USE_MOCKS=true` (or no `DATABASE_URL` is present), and auth is bypassed with a demo admin identity.

The result: **the same components and API routes power both the demo and a real deployment** — no forked code paths.

---

## ✦ Quick Start

### Option A — Standalone demo (no database)

```bash
git clone https://github.com/shahriar-ahmed-seam/coregrid.git
cd coregrid
npm install
echo "NEXT_PUBLIC_USE_MOCKS=true" > .env.local
npm run dev
```

Open **http://localhost:3000** — the full workspace is ready with sample data.

### Option B — Full stack (PostgreSQL + AI)

**Prerequisites:** Node 20+, PostgreSQL 14+, and [Ollama](https://ollama.ai) for AI.

```bash
cp .env.example .env          # set DATABASE_URL, NEXTAUTH_SECRET, etc.
npm install
npm run db:push               # apply schema
npm run db:seed               # load sample data
ollama pull llama3.2          # enable AI features
npm run dev
```

**Default logins** (full mode): `admin@coregrid.com` · `password123` (all seeded users share this password).

---

## ✦ Deployment

### Vercel (demo)

1. Import the repo in Vercel.
2. Set the environment variable `NEXT_PUBLIC_USE_MOCKS=true`.
3. Deploy. That's it — no database required.

### Docker (full)

```bash
npm run docker:run     # app + PostgreSQL + Nginx
npm run docker:logs
```

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the production guide.

---

## ✦ Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_USE_MOCKS` | `true` to run the standalone demo (no DB) | demo |
| `DATABASE_URL` | PostgreSQL connection string | full |
| `NEXTAUTH_URL` | App URL | full |
| `NEXTAUTH_SECRET` | Session secret (32+ chars) | full |
| `OLLAMA_BASE_URL` | Ollama endpoint (default `http://localhost:11434`) | AI |
| `OLLAMA_MODEL` | Model name (default `llama3.2`) | AI |

---

## ✦ Scripts

```bash
npm run dev          # development server
npm run build        # production build (runs prisma generate)
npm run start        # production server
npm run db:push      # push schema to database
npm run db:seed      # seed sample data
npm run db:studio    # open Prisma Studio
npm run docker:run   # full stack via Docker Compose
```

---

## ✦ Credits

Photography from talented creators on [Unsplash](https://unsplash.com). Built with Next.js, Prisma, Tailwind CSS and shadcn/ui.

## ✦ License

Released under the [MIT License](./LICENSE).

<div align="center">
<sub>CoreGrid — run your entire company on one intelligent grid.</sub>
</div>
