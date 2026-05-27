<div align="center">

# Form-Stack

**A modern, open-source form builder inspired by Typeform.**
Built with end-to-end type safety using Next.js, tRPC, and Drizzle ORM.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be?logo=trpc)](https://trpc.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[🌐 Live Demo](https://form-stack-web.vercel.app) · [📖 Documentation](#-getting-started) · [🐛 Report Bug](https://github.com/saurabhravte/Form-Stack/issues)

</div>

---

## About

Form-Stack is a self-hostable, full-stack form builder that brings the elegant, one-question-at-a-time experience of Typeform to an open-source project you control. Build beautiful forms, share them with a link, and collect responses without paying per submission or worrying about vendor lock-in.

It is designed as a **production-grade monorepo template** for full-stack TypeScript applications, demonstrating clean separation between a Next.js frontend and an Express + tRPC backend, with shared types flowing seamlessly from the database to the UI.

---

##  Features

-  **Beautiful form builder** — drag-friendly UI for designing multi-step forms
-  **End-to-end type safety** — tRPC + TypeScript ensure your API contract is always in sync
-  **Redis-backed rate limiting** — protect your endpoints from abuse
-  **JWT authentication** — secure, cookie-based sessions out of the box
-  **Built-in analytics** — track views, completion rates, and per-field drop-off
-  **Theme presets** — choose from curated visual styles or build your own
-  **Form templates** — kickstart common use cases (surveys, sign-ups, feedback)
-  **CSV export** — download responses for offline analysis
-  **Monorepo architecture** — shared schema, types, and utilities across apps

---

##  Screenshots

<div align="center">

### Dashboard
*Manage all your forms in one place*

![Dashboard](./docs/dashboard.png)

---

### Form Builder
*Design questions, configure validation, customize the look*

![Form Builder](./docs/form-create.png)

---


### Homepage
*formstack landing page*

![Analytics](./docs/homepage.png)

</div>


---

##  Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| **Frontend**     | [Next.js 14](https://nextjs.org/) (App Router)      |
| **Backend**      | [Express](https://expressjs.com/) + [tRPC 11](https://trpc.io/) |
| **Language**     | [TypeScript 5](https://www.typescriptlang.org/)     |
| **Database**     | PostgreSQL 16 via [Drizzle ORM](https://orm.drizzle.team/) |
| **Cache / Rate Limiting** | Redis 7                                    |
| **Auth**         | JWT + bcrypt + httpOnly cookies                     |
| **Email**        | [Resend](https://resend.com/)                       |
| **Monorepo**     | [Turborepo](https://turborepo.com/) + pnpm workspaces |
| **Deployment**   | Vercel (frontend) · Render (API) · Neon (DB) · Upstash (Redis) |

---

##  Architecture

Form-Stack uses a **decoupled frontend-backend** architecture, allowing you to scale and deploy each independently.

```
┌─────────────────┐        tRPC over HTTPS        ┌─────────────────┐
│                 │  ─────────────────────────►   │                 │
│   Next.js Web   │                                │   Express API   │
│    (Vercel)     │  ◄─────────────────────────   │    (Render)     │
│                 │      JSON + superjson          │                 │
└─────────────────┘                                └────────┬────────┘
                                                            │
                                              ┌─────────────┴─────────────┐
                                              │                           │
                                       ┌──────▼──────┐            ┌───────▼──────┐
                                       │  PostgreSQL │            │    Redis     │
                                       │    (Neon)   │            │  (Upstash)   │
                                       └─────────────┘            └──────────────┘
```

The frontend never touches the database directly — all data flows through type-safe tRPC procedures.

---

##  Project Structure

```
Form-Stack/
├── apps/
│   ├── web/                 # Next.js frontend (form builder + public form pages)
│   └── api/                 # Express + tRPC backend
├── packages/
│   ├── db/                  # @formstack/db — Drizzle schema, migrations, seed
│   ├── shared/              # @formstack/shared — shared types, themes, errors
│   ├── eslint-config/       # Shared ESLint rules
│   └── typescript-config/   # Shared tsconfig presets
├── docker-compose.yml       # Local Postgres + Redis
├── turbo.json               # Turborepo pipeline
└── pnpm-workspace.yaml      # Workspace configuration
```

---

##  Getting Started

### Prerequisites

- **Node.js** ≥ 20 ([install](https://nodejs.org/))
- **pnpm** 9+ — `npm install -g pnpm@9`
- **Docker** + **Docker Compose** ([install](https://docs.docker.com/get-docker/))

### 1. Clone & install

```bash
git clone https://github.com/saurabhravte/Form-Stack.git
cd Form-Stack
pnpm install
```

### 2. Start Postgres & Redis locally

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **Redis** on `localhost:6379`

### 3. Configure environment variables

Create the following files:

**`packages/db/.env`**

```env
DATABASE_URL="postgresql://formstack:formstack@localhost:5432/formstack"
```

**`apps/api/.env`**

```env
DATABASE_URL="postgresql://formstack:formstack@localhost:5432/formstack"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="generate-with-openssl-rand-base64-32"
WEB_URL="http://localhost:3000"
PORT=4000
```

**`apps/web/.env.local`**

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```
> 💡 Generate a secure JWT secret with `openssl rand -base64 32`

### 4. Set up the database

```bash
pnpm --filter @formstack/shared build   # build shared package first
pnpm db:push                            # create tables in Postgres
pnpm db:seed                            # seed themes & templates
```

### 5. Run the dev servers

```bash
pnpm dev
```

This starts both apps in parallel:

- **Web** → http://localhost:3000
- **API** → http://localhost:4000
- **API Docs** → http://localhost:4000/docs

---

##  Available Scripts

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `pnpm dev`         | Start all apps in development mode         |
| `pnpm build`       | Build all apps and packages                |
| `pnpm lint`        | Lint the entire monorepo                   |
| `pnpm format`      | Format code with Prettier                  |
| `pnpm check-types` | Type-check all packages                    |
| `pnpm db:push`     | Push schema changes to the database        |
| `pnpm db:migrate`  | Run pending migrations                     |
| `pnpm db:seed`     | Seed the database with starter data        |
| `pnpm db:studio`   | Open Drizzle Studio (visual DB browser)    |

Filter to a specific package:

```bash
pnpm dev --filter @formstack/web
pnpm build --filter @formstack/api
```

---

##  Deploying to Production (Free)

Form-Stack can be deployed entirely on free tiers:

| Service             | Hosts                  | Free Tier             |
| ------------------- | ---------------------- | --------------------- |
| **Vercel**          | `apps/web` (Next.js)   | Unlimited deployments |
| **Render**          | `apps/api` (Express)   | 750 hours/month       |
| **Neon**            | PostgreSQL database    | 0.5 GB storage        |
| **Upstash**         | Redis                  | 10K commands/day      |

A detailed deployment walkthrough is available in [`DEPLOYMENT.md`](./DEPLOYMENT.md) (or open an issue if you get stuck — happy to help!).

---

##  How It Works

1. **`apps/web`** — A Next.js App Router site hosting the dashboard, form builder, and public form-taking pages.
2. **`apps/api`** — An Express server that mounts tRPC at `/trpc/*` and exposes auto-generated OpenAPI docs at `/docs`.
3. **`packages/db`** — Owns the Drizzle schema, migrations, and seed scripts. Both the API and CLI scripts import from here.
4. **`packages/shared`** — Shared TypeScript types (themes, error classes, validation schemas) used across the monorepo.
5. **Redis** — Powers `express-rate-limit` to protect auth endpoints and form submission from abuse.
6. **Turborepo** — Caches builds across packages so re-runs are nearly instant in CI.

---


##  License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**Saurabh Ravte**

- 🌐 GitHub: [@saurabhravte](https://github.com/saurabhravte)
- 💼 Built as a hackathon project — turned into a real, deployable app

---

<div align="center">

**If Form-Stack helped you or inspired your own project, please consider giving it a ⭐ on GitHub!**

Made with ❤️ and a lot of debugging.

</div>