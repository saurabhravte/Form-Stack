


import { config } from 'dotenv';
import path from 'node:path';
config({ path: path.resolve(__dirname, '../../../.env') });
config();

import { apiReference } from '@scalar/express-api-reference';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import {
  errorHandler,
  loginLimiter,
  publicSubmitLimiter,
  registerLimiter,
  requestLog,
} from './middlewares';
import { appRouter } from './routers';
import { createContext } from './trpc/context';

const PORT = Number(process.env.PORT ?? 4000);
const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like curl / Postman with no Origin header.
      if (!origin) return callback(null, true);

      const allowed = (process.env.WEB_URL ?? 'http://localhost:3000')
        .split(',')
        .map((s) => s.trim());

      if (allowed.includes(origin)) return callback(null, true);
      // Auto-allow Vercel previews so PR deployments work without a redeploy.
      if (/\.vercel\.app$/.test(new URL(origin).hostname)) return callback(null, true);

      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(requestLog);

app.get('/', (_req, res) => {
  res.json({
    name: 'FormStack API',
    version: '0.1.0',
    docs: '/docs',
    trpc: '/trpc',
    health: '/health',
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// --- Targeted rate limits (applied BEFORE the tRPC mount) -----------------
// tRPC procedures map to URL paths like `/trpc/auth.login`, `/trpc/auth.register`,
// and `/trpc/responses.submit`. We attach per-path limiters at the Express layer
// so they short-circuit before tRPC ever sees the request.
const trpcRouteLimiter = (procedure: string, limiter: import('express').RequestHandler) => {
  app.use((req, res, next) => {
    if (req.path === `/trpc/${procedure}`) return limiter(req, res, next);
    next();
  });
};

trpcRouteLimiter('auth.login', loginLimiter);
trpcRouteLimiter('auth.register', registerLimiter);
trpcRouteLimiter('responses.submit', publicSubmitLimiter);

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error(`[trpc:${path}]`, error);
      }
    },
  }),
);

// --- Scalar API reference (auto-generated from a curated OpenAPI doc) -----
const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'FormStack API',
    version: '0.1.0',
    description:
      'Type-safe form builder backend. Most routes are exposed via tRPC at `/trpc/{procedure}` ' +
      'using JSON+superjson over POST. This document highlights the procedures most useful when ' +
      'inspecting or integrating the API.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'auth', description: 'Sign up, sign in, session management.' },
    { name: 'forms', description: 'CRUD for forms (creator-only).' },
    { name: 'responses', description: 'Public form submissions + creator views.' },
    { name: 'analytics', description: 'Per-form analytics & CSV export.' },
    { name: 'themes', description: 'Theme presets.' },
    { name: 'templates', description: 'Pre-built form templates.' },
  ],
  paths: {
    '/trpc/auth.register': {
      post: {
        tags: ['auth'],
        summary: 'Create a new account + workspace',
        responses: { '200': { description: 'User created' } },
      },
    },
    '/trpc/auth.login': {
      post: {
        tags: ['auth'],
        summary: 'Issue a session cookie',
        responses: { '200': { description: 'Authenticated' } },
      },
    },
    '/trpc/auth.logout': {
      post: { tags: ['auth'], summary: 'Revoke the current session' },
    },
    '/trpc/auth.me': {
      get: { tags: ['auth'], summary: 'Get the current user (or null)' },
    },
    '/trpc/forms.listMine': {
      get: { tags: ['forms'], summary: 'List forms in the current workspace' },
    },
    '/trpc/forms.create': {
      post: { tags: ['forms'], summary: 'Create a draft form' },
    },
    '/trpc/forms.update': {
      post: { tags: ['forms'], summary: 'Update fields/settings (Zod-validated)' },
    },
    '/trpc/forms.publish': {
      post: { tags: ['forms'], summary: 'Publish a form (requires ≥1 field)' },
    },
    '/trpc/forms.unpublish': { post: { tags: ['forms'], summary: 'Move back to draft' } },
    '/trpc/forms.archive': { post: { tags: ['forms'], summary: 'Archive a form' } },
    '/trpc/forms.clone': { post: { tags: ['forms'], summary: 'Duplicate as a new draft' } },
    '/trpc/forms.getPublicBySlug': {
      get: {
        tags: ['forms'],
        summary: 'Resolve a public/unlisted form for the public renderer',
      },
    },
    '/trpc/forms.listPublic': {
      get: { tags: ['forms'], summary: 'Paginated explore feed (public forms only)' },
    },
    '/trpc/responses.submit': {
      post: {
        tags: ['responses'],
        summary: 'Submit a response to a published form (rate-limited)',
      },
    },
    '/trpc/responses.listForForm': {
      get: { tags: ['responses'], summary: 'Creator: list responses with cursor pagination' },
    },
    '/trpc/analytics.overview': {
      get: {
        tags: ['analytics'],
        summary: 'Views, unique views, completion rate, avg duration',
      },
    },
    '/trpc/analytics.dailyResponses': {
      get: { tags: ['analytics'], summary: 'Time-series of responses (day-grain)' },
    },
    '/trpc/analytics.fieldCompletion': {
      get: { tags: ['analytics'], summary: 'Per-field completion rates' },
    },
    '/trpc/themes.list': { get: { tags: ['themes'], summary: 'All starter themes' } },
    '/trpc/templates.list': { get: { tags: ['templates'], summary: 'All form templates' } },
  },
};

app.get('/openapi.json', (_req, res) => res.json(openApiSpec));

app.use(
  '/docs',
  apiReference({
    spec: { content: openApiSpec },
    theme: 'purple',
  }),
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.info(`✓ FormStack API listening on http://localhost:${PORT}`);
  console.info(`  → tRPC:  http://localhost:${PORT}/trpc`);
  console.info(`  → Docs:  http://localhost:${PORT}/docs`);
});
