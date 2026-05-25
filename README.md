# FormStack

> A Typeform-style form builder for the hackathon era. Themed, typed, tracked.

FormStack is a full-stack form builder SaaS scaffold. Build forms with 25+ field types, pick from 7 themed presets, share public/unlisted links, and track real-time analytics — all running on a type-safe Turborepo monorepo wired end to end with tRPC + Zod + Drizzle + Scalar.

```
┌────────────────────────────────────────────────────────────────┐
│  Next.js 14 (App Router)  →  tRPC v11  →  Drizzle / Postgres   │
│            │                     │                  │          │
│       Zod schemas ────── @formstack/shared ─────── Zod schemas │
└────────────────────────────────────────────────────────────────┘
```

---

## Demo credentials

Run the seed (`pnpm db:seed`), then sign in with:

| Field    | Value                  |
|----------|------------------------|
| Email    | `demo@formstack.dev`   |
| Password | `Demo1234!`            |

The demo workspace ships with 3 themed, published sample forms with real seeded responses:

- 🎬 **Best Movie of the Decade** — `midnight-cinema` theme, public
- 🌸 **Anime Fan Census 2026** — `shonen-sunrise` theme, public
- 🎮 **GameDevHQ Feedback** — `arcade-neon` theme, unlisted

…plus 6 templates and 7 starter themes.

---

## Tech stack

| Layer        | Choice                                                          |
|--------------|-----------------------------------------------------------------|
| Monorepo     | Turborepo + pnpm workspaces                                     |
| Backend      | Express + tRPC v11 (`/trpc/*`) + Scalar reference (`/docs`)     |
| Database     | Postgres 16 + Drizzle ORM (typed, transactional)                |
| Auth         | bcrypt + JWT, HTTP-only cookies, server-side revocation         |
| Validation   | Zod everywhere (shared schemas — one source of truth)           |
| Frontend     | Next.js 14 (App Router), React 18, Tailwind, shadcn primitives  |
| State        | Zustand (auth, builder) + TanStack Query (server cache)         |
| Forms        | React Hook Form + `@hookform/resolvers/zod`                     |
| Charts       | Recharts                                                        |
| Email        | Resend (graceful no-op fallback when key missing)               |
| Rate limit   | `express-rate-limit` on submit / login / register               |

---

## Monorepo layout

```
formstack/
├── apps/
│   ├── api/              # Express + tRPC server (port 4000)
│   └── web/              # Next.js client (port 3000)
└── packages/
    ├── shared/           # Zod schemas, ApiError/ApiResponse, themes, field meta
    ├── db/               # Drizzle schema + seed
    ├── eslint-config/    # Shared lint rules
    └── typescript-config/# Shared tsconfig presets
```

---

## Architecture decisions

- **No business logic in tRPC procedures.** Procedures are one-line delegations to controllers. Controllers extend `BaseController` (membership checks, `assertFound`, error normalization) and hold all DB access and business rules. This kept routers under 40 lines and made unit tests possible without spinning up tRPC.
- **`ApiError` + `ApiResponse` in `@formstack/shared`.** Thrown everywhere. The Express `errorHandler` and the tRPC `errorFormatter` both unwrap it into the same JSON envelope, so the frontend can rely on `error.data.code` and `error.data.details` regardless of transport.
- **Shared Zod schemas drive validation on both sides.** `RegisterStep1Schema`, `FieldConfigSchema` (discriminated union over 29 `kind`s), `SubmitResponseSchema` — all imported from `@formstack/shared`. Server-side, every procedure has `.input(Schema)`; client-side, react-hook-form gets the same schema via `zodResolver()`.
- **Session strategy.** JWT carries `{ sub: userId, sid: sessionId }`. The `sessions` table stores `sha256(token)` so the server can revoke (logout, password change, suspicious activity) without rolling JWT secrets. Cookie is `httpOnly`, `sameSite=lax` (dev) / `none` (prod with secure), 7-day max-age.
- **Form visibility.**
  - `draft` → `getPublicBySlug` returns 404. Form is invisible.
  - `private` → 404 publicly. Creator-only access.
  - `unlisted` → fetchable by slug, not indexed in `/explore`.
  - `public` → fetchable + listed.
- **Rate limits** are targeted at sensitive routes only (`auth.login`, `auth.register`, `responses.submit`) so authoring throughput is uncapped.

---

## Setup

You need: **Node 20+**, **pnpm 9+**, and **Docker Desktop**.

```bash
# 1. Install
git clone <repo> formstack && cd formstack
pnpm install

# 2. Spin up Postgres + Redis
docker-compose up -d

# 3. Environment
cp .env.example .env

# 4. Push schema and seed demo data
pnpm db:push
pnpm db:seed

# 5. Start everything (api on :4000, web on :3000) — one command, Turbo runs both
pnpm dev
```

Open:

- **Web:**         http://localhost:3000
- **API health:**  http://localhost:4000/health
- **API docs:**    http://localhost:4000/docs   ← Scalar reference (kept off the public navbar; this is a dev-only surface)

---

## Useful commands

```bash
pnpm dev                # api + web concurrently
pnpm build              # turbo build, both apps
pnpm lint               # eslint, both apps + packages
pnpm check-types        # tsc --noEmit across the monorepo

pnpm --filter @formstack/db db:push      # apply schema to Postgres
pnpm --filter @formstack/db db:seed      # reset + seed demo data
pnpm --filter @formstack/db db:studio    # open Drizzle Studio
```

---

## Feature inventory

### ✅ Built and working

- **Auth.** Sign up (3-step), sign in (2-step), sign out, cookie session, server-side session revocation, login + register rate limiting.
- **Workspaces.** Created with the first user. Role-based membership table (`owner`/`admin`/`editor`/`viewer`) with rank-checked guards in `BaseController.assertWorkspaceMembership`.
- **Forms.** CRUD, slug auto-generation with collision retry, publish (requires ≥1 field), unpublish, archive, clone (duplicates as draft).
- **Form builder.** Three-pane layout — field palette grouped by category (Contact / Choice / Rating / Data / Other), canvas with inline reorder + delete, right-pane config (label, help text, required, options, scale max, placeholder) and theme picker.
- **25+ field types in the schema, 18+ rendered** — short/long text, email, phone, address, website, single/multi/dropdown, picture choice, yes/no, legal, checkbox, opinion scale, rating, ranking, number, date, signature, file upload, welcome screen, statement, redirect, plus permissive shapes for payment, scheduler, video, audio, FAQ, question group, matrix.
- **19 themed presets** seeded: 7 originals (Crimson, Midnight Cinema, Shōnen Sunrise, Arcade Neon, YC Startup, Terminal OS, DevCon) plus 12 new (Mumbai Monsoon, Jaipur Pink City, Kerala Backwaters, Diwali, Holi, Tokyo Night, Kyoto Sakura, Windows ‘95, Windows XP, Deep Forest, Autumn Leaves, Winter Frost). Tokens drive `--theme-*` CSS vars on the public renderer.
- **Public form renderer** at `/f/[slug]`. Applies the form's theme tokens, enforces visibility rules, records `view` + `submit` events, posts to `responses.submit` with `durationMs` in metadata.
- **Responses.** Public submit (rate-limited 10/min/IP), creator-only `listForForm` with cursor pagination, per-response answer drill-down UI, CSV export via `/trpc/analytics.exportCsv`.
- **Analytics.** Total views, unique views (by sessionId), total responses, completion rate, average duration. Daily time series + per-field completion bar chart (Recharts).
- **API reference.** Scalar UI at `/docs` reading from a curated `/openapi.json`.
- **Marketing pages.** Landing (hero, feature grid, theme gallery, CTA), Pricing (4 tiers from `PLAN_PRICING` with monthly/yearly toggle), Explore (public form gallery), Templates, API docs, 404.
- **Themes.** Black-and-white shade palette with crimson `#D7263D` primary and small accent touches (amber, teal, violet, lime). Light/dark toggle via the theme provider; Poppins everywhere.

### 🚧 Scaffolded but not finished

- **Conditional logic.** The Zod schema accepts a `conditional` clause on each field but the renderer + builder UI don't evaluate it yet.
- **Multi-page forms.** `FormSettingsSchema.multiPage` is wired in storage; the public renderer still emits all fields on one page.
- **Drag-and-drop reorder.** Builder uses up/down chevrons; swap for `dnd-kit` in a follow-up.
- **Integrations.** Slack/Notion/Sheets/Calendly are listed in the marketing copy but the integration plumbing is not implemented.

### 🔮 Not started

- AI form generator, branching logic UI, webhook config UI, SSO, embedded forms (`<script>` widget), QR code per form, paid plan billing.

---

## Where to find things

- Want to change validation rules? → `packages/shared/src/schemas.ts`
- New field type? → add to `FIELD_KINDS` (`packages/shared/src/constants.ts`), `FIELD_KIND_META` (`packages/shared/src/fields.ts`), `FieldConfigSchema` (`packages/shared/src/schemas.ts`), then render in `apps/web/src/components/forms/field-renderer.tsx`.
- New theme? → push a row into the `themes` table (see `packages/db/src/seed.ts`).
- New error shape? → `ApiError.factories` in `packages/shared/src/errors.ts`.

---

## License

MIT.
