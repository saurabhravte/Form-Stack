# Form-Stack

> A TypeForm-style form builder built with a modern, type-safe stack. Created as a hackathon project, powered by **tRPC**, **Next.js**, and **Turborepo**.

Form-Stack lets you create, share, and collect responses from beautiful, one-question-at-a-time forms — similar to TypeForm — with end-to-end type safety from the database all the way to the React components.

---

##  Features

- 🧱 **Drag-friendly form builder** — design multi-step forms with different question types
- 🔁 **End-to-end type safety** — tRPC + TypeScript means no API contracts to maintain
- ⚡ **Real-time responses** — Redis-backed cache for fast reads
- 🗄️ **PostgreSQL storage** — durable storage for forms and submissions
- 🧩 **Monorepo architecture** — shared UI, config, and DB packages via Turborepo
- 🎨 **Reusable UI library** — `@repo/ui` shared across apps
- 🐳 **Dockerized dev DB** — Postgres + Redis spin up with one command

---

##  Tech Stack

| Layer            | Tech                                              |
| ---------------- | ------------------------------------------------- |
| Framework        | [Next.js](https://nextjs.org/) (App Router)       |
| API              | [tRPC](https://trpc.io/) — type-safe RPC          |
| Language         | [TypeScript](https://www.typescriptlang.org/)     |
| Database         | PostgreSQL 16                                     |
| Cache            | Redis 7                                           |
| Monorepo         | [Turborepo](https://turborepo.com/) + pnpm        |
| Linting / Format | ESLint + Prettier                                 |
| Runtime          | Node.js ≥ 20                                      |

---

##  Project Structure

```
Form-Stack/
├── apps/
│   ├── web/                 # Main Next.js app (form builder + public form pages)
│   └── docs/                # Documentation Next.js app
├── packages/
│   ├── db/                  # @formstack/db — schema, migrations, seed
│   ├── ui/                  # @repo/ui — shared React components
│   ├── eslint-config/       # @repo/eslint-config — shared ESLint config
│   └── typescript-config/   # @repo/typescript-config — shared tsconfigs
├── docker-compose.yml       # Postgres + Redis for local dev
├── turbo.json               # Turborepo pipeline config
├── pnpm-workspace.yaml      # pnpm workspaces config
└── setup.sh                 # One-shot setup helper
```

---

##  Getting Started

### Prerequisites

- **Node.js** ≥ 20 ([install](https://nodejs.org/))
- **pnpm** 9.x — `npm install -g pnpm@9`
- **Docker** + **Docker Compose** ([install](https://docs.docker.com/get-docker/))
- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/saurabhravte/Form-Stack.git
cd Form-Stack
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the database & cache

This boots Postgres 16 and Redis 7 in containers:

```bash
docker compose up -d
```

Defaults:

- **Postgres** → `postgres://formstack:formstack@localhost:5432/formstack`
- **Redis** → `redis://localhost:6379`

### 4. Set up environment variables

Create a `.env` file in `apps/web` (and in `packages/db` if needed) — see [Environment Variables](#-environment-variables) below.

### 5. Run database migrations + seed

```bash
pnpm db:push        # push schema to the DB
pnpm db:seed        # seed sample data (optional)
```

You can browse the database with:

```bash
pnpm db:studio
```

### 6. Start the dev servers

```bash
pnpm dev
```

This starts every app in the monorepo in parallel. By default:

- `web` → http://localhost:3000
- `docs` → http://localhost:3001

To run just one app:

```bash
pnpm dev --filter=web
```

---

##  Environment Variables

Create `apps/web/.env.local` (and `packages/db/.env` if your DB package reads from there):

```env
# Database
DATABASE_URL="postgres://formstack:formstack@localhost:5432/formstack"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth (if using auth)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Public app URL (used for share links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> Generate a secret: `openssl rand -base64 32`

---

##  Available Scripts

All scripts run from the repo root.

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `pnpm dev`             | Start every app in dev mode                   |
| `pnpm build`           | Build every app and package                   |
| `pnpm lint`            | Lint the whole monorepo                       |
| `pnpm format`          | Prettier-format all files                     |
| `pnpm check-types`     | Type-check the whole monorepo                 |
| `pnpm db:push`         | Push schema changes to the DB                 |
| `pnpm db:migrate`      | Run migrations                                |
| `pnpm db:seed`         | Seed sample data                              |
| `pnpm db:studio`       | Open the DB studio UI                         |

Filter to one app or package:

```bash
pnpm dev --filter=web
pnpm build --filter=docs
```

---

##  How It Works

1. **`apps/web`** hosts the form builder UI and the public form-taking pages.
2. **tRPC routers** (typically under `apps/web/src/server`) expose type-safe procedures the React app calls directly — no REST or GraphQL layer to maintain.
3. **`@formstack/db`** owns the schema, migrations, and seed scripts. The same types are imported by tRPC procedures, so a schema change flows up to the UI automatically.
4. **Redis** is used as a cache/queue layer for hot reads (e.g. counts, presence) and can power background jobs.
5. **Turborepo** orchestrates builds and caches across the monorepo so re-runs are nearly instant.


---

## 👤 Author

**Saurabh Ravte**

- GitHub: [@saurabhravte](https://github.com/saurabhravte)

If Form-Stack helped you, drop a ⭐ on the repo — it really helps!