/**
 * Seed script — bootstraps a demo-ready database so judges can log in
 * and click around without having to create anything themselves.
 *
 * Run with:  pnpm db:seed
 *
 * Demo credentials (printed at the end of the run):
 *   email:    demo@formstack.dev
 *   password: Demo1234!
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { STARTER_THEMES } from '@formstack/shared';

import { db } from './index';
import { formEvents, forms, responses, templates, themes, users, workspaceMembers, workspaces } from './schema';

const DEMO_EMAIL = 'demo@formstack.dev';
const DEMO_PASSWORD = 'Demo1234!';

async function clear() {
  // Order matters — children first.
  await db.delete(formEvents);
  await db.delete(responses);
  await db.delete(forms);
  await db.delete(templates);
  await db.delete(themes);
  await db.delete(workspaceMembers);
  await db.delete(workspaces);
  await db.delete(users);
}

async function seedThemes() {
  for (const t of STARTER_THEMES) {
    await db
      .insert(themes)
      .values({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        tokens: t.tokens as unknown as Record<string, string>,
        isStarter: true,
      })
      .onConflictDoNothing();
  }
}

async function seedDemoUser() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [user] = await db
    .insert(users)
    .values({
      email: DEMO_EMAIL,
      name: 'Demo Creator',
      passwordHash,
      emailVerifiedAt: new Date(),
    })
    .returning();
  if (!user) throw new Error('Failed to create demo user');

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: 'Demo Workspace',
      slug: 'demo',
      plan: 'pro',
      ownerId: user.id,
    })
    .returning();
  if (!workspace) throw new Error('Failed to create demo workspace');

  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId: user.id,
    role: 'owner',
  });

  return { user, workspace };
}

/** Helpers to build field configs quickly. */
const field = (kind: string, label: string, extra: Record<string, unknown> = {}) => ({
  id: randomUUID(),
  kind,
  label,
  required: extra.required ?? false,
  hidden: false,
  conditional: null,
  config: extra.config ?? {},
  description: extra.description,
});

async function seedForms(workspaceId: string, userId: string) {
  const sampleForms: Array<{
    title: string;
    description: string;
    slug: string;
    themeId: string;
    type: 'survey' | 'feedback' | 'lead_gen';
    visibility: 'public' | 'unlisted';
    fields: unknown[];
    fakeResponseCount: number;
  }> = [
    {
      title: '🎬 Best Movie of the Decade',
      description: 'Tell us which film truly defined the 2020s.',
      slug: 'best-movie-decade',
      themeId: 'midnight-cinema',
      type: 'survey',
      visibility: 'public',
      fields: [
        field('welcome_screen', 'Welcome, cinephile!', { config: { ctaLabel: 'Pick your favorite' } }),
        field('short_text', 'What movie are you nominating?', { required: true }),
        field('single_select', 'Genre', {
          required: true,
          config: { options: ['Drama', 'Sci-Fi', 'Action', 'Horror', 'Comedy', 'Other'] },
        }),
        field('rating', 'How would you rate it?', { required: true, config: { max: 5 } }),
        field('long_text', 'Why does it deserve the title?', { config: { rows: 5, maxLength: 1000 } }),
        field('email', 'Your email (optional, to see results)', { config: {} }),
      ],
      fakeResponseCount: 42,
    },
    {
      title: '🌸 Anime Fan Census 2026',
      description: 'A quick survey for the anime community.',
      slug: 'anime-fan-census',
      themeId: 'shonen-sunrise',
      type: 'survey',
      visibility: 'public',
      fields: [
        field('short_text', 'Your alias / username', { required: true }),
        field('multi_select', 'Favorite genres', {
          required: true,
          config: { options: ['Shonen', 'Seinen', 'Shoujo', 'Mecha', 'Isekai', 'Slice of life'] },
        }),
        field('opinion_scale', 'How often do you watch anime?', {
          config: { min: 0, max: 10, leftLabel: 'Never', rightLabel: 'Every day' },
        }),
        field('yes_no', 'Have you read the manga first?', {}),
        field('long_text', 'Your all-time favorite series and why', { config: { rows: 4 } }),
      ],
      fakeResponseCount: 87,
    },
    {
      title: '🎮 GameDevHQ Community Feedback',
      description: 'Help us shape what we build next.',
      slug: 'gamedevhq-feedback',
      themeId: 'arcade-neon',
      type: 'feedback',
      visibility: 'unlisted',
      fields: [
        field('email', 'Email', { required: true }),
        field('dropdown', 'Which platform do you ship to most?', {
          required: true,
          config: { options: ['PC', 'Console', 'Mobile', 'Web', 'VR'] },
        }),
        field('opinion_scale', 'How likely are you to recommend us?', {
          config: { min: 0, max: 10, leftLabel: 'Not at all', rightLabel: 'Definitely' },
        }),
        field('long_text', 'What should we build next?', { required: true, config: { rows: 6 } }),
        field('file_upload', 'Drop a sketch (optional)', { config: { maxSizeMb: 5, accept: 'image/*' } }),
      ],
      fakeResponseCount: 23,
    },
  ];

  for (const form of sampleForms) {
    const [row] = await db
      .insert(forms)
      .values({
        workspaceId,
        createdByUserId: userId,
        title: form.title,
        description: form.description,
        slug: form.slug,
        themeId: form.themeId,
        type: form.type,
        visibility: form.visibility,
        status: 'published',
        fields: form.fields,
        settings: { showProgress: true, thankYouMessage: 'Thanks — your response was saved.' },
        publishedAt: new Date(),
      })
      .returning();
    if (!row) continue;

    // Generate fake responses
    for (let i = 0; i < form.fakeResponseCount; i++) {
      const answers = (form.fields as Array<{ id: string; kind: string }>)
        .filter((f) => f.kind !== 'welcome_screen' && f.kind !== 'statement')
        .map((f) => ({ fieldId: f.id, value: randomAnswerFor(f.kind) }));
      await db.insert(responses).values({
        formId: row.id,
        answers,
        metadata: { userAgent: 'seed-script', durationMs: 30_000 + Math.floor(Math.random() * 120_000) },
      });
    }

    // Update the denormalized count and seed view-events
    await db
      .update(forms)
      .set({ responseCount: form.fakeResponseCount })
      .where(sql`${forms.id} = ${row.id}`);

    const viewCount = form.fakeResponseCount * (3 + Math.floor(Math.random() * 4));
    const viewRows = Array.from({ length: viewCount }, () => ({
      formId: row.id,
      type: 'view',
      sessionId: randomUUID(),
    }));
    if (viewRows.length) await db.insert(formEvents).values(viewRows);
  }
}

function randomAnswerFor(kind: string): unknown {
  switch (kind) {
    case 'short_text':
      return ['Dune Part Two', 'Everything Everywhere', 'Oppenheimer', 'Past Lives'][Math.floor(Math.random() * 4)];
    case 'long_text':
      return 'It changed how I think about the craft. The pacing was deliberate and the soundtrack was excellent.';
    case 'email':
      return `respondent${Math.floor(Math.random() * 10_000)}@example.com`;
    case 'single_select':
      return ['Drama', 'Sci-Fi', 'Action'][Math.floor(Math.random() * 3)];
    case 'multi_select':
      return ['Shonen', 'Seinen'];
    case 'dropdown':
      return ['PC', 'Console', 'Mobile'][Math.floor(Math.random() * 3)];
    case 'rating':
      return 3 + Math.floor(Math.random() * 3);
    case 'opinion_scale':
      return Math.floor(Math.random() * 11);
    case 'yes_no':
      return Math.random() > 0.5;
    case 'file_upload':
      return null;
    default:
      return null;
  }
}

async function seedTemplates() {
  const tpls = [
    {
      slug: 'contact-us',
      title: 'Contact us',
      description: 'A simple contact form with name, email and message.',
      category: 'contact',
      themeId: 'crimson-default',
    },
    {
      slug: 'event-rsvp',
      title: 'Event RSVP',
      description: 'Collect attendee details and dietary preferences.',
      category: 'events',
      themeId: 'devcon-event',
    },
    {
      slug: 'product-feedback',
      title: 'Product feedback',
      description: 'NPS + a short follow-up open question.',
      category: 'feedback',
      themeId: 'yc-startup',
    },
    {
      slug: 'job-application',
      title: 'Job application',
      description: 'Resume upload, contact info, links.',
      category: 'hr',
      themeId: 'crimson-default',
    },
    {
      slug: 'newsletter-signup',
      title: 'Newsletter signup',
      description: 'Email + topic preferences.',
      category: 'marketing',
      themeId: 'yc-startup',
    },
    {
      slug: 'bug-report',
      title: 'Bug report',
      description: 'Steps to reproduce, screenshots, severity.',
      category: 'product',
      themeId: 'terminal-os',
    },
  ];

  for (const t of tpls) {
    await db
      .insert(templates)
      .values({
        slug: t.slug,
        title: t.title,
        description: t.description,
        category: t.category,
        themeId: t.themeId,
        fields: [
          field('short_text', 'Name', { required: true }),
          field('email', 'Email', { required: true }),
          field('long_text', 'Message', { required: true, config: { rows: 4 } }),
        ],
        settings: { thankYouMessage: 'Thanks — we will be in touch shortly.' },
      })
      .onConflictDoNothing();
  }
}

async function main() {
  console.info('🌱 Clearing existing data…');
  await clear();
  console.info('🎨 Seeding themes…');
  await seedThemes();
  console.info('🧰 Seeding templates…');
  await seedTemplates();
  console.info('👤 Seeding demo user + workspace…');
  const { user, workspace } = await seedDemoUser();
  console.info('📝 Seeding sample forms with responses…');
  await seedForms(workspace.id, user.id);

  console.info('\n✅ Done!');
  console.info('   Demo email:    %s', DEMO_EMAIL);
  console.info('   Demo password: %s', DEMO_PASSWORD);
  console.info('   Workspace:     %s (%s)', workspace.name, workspace.slug);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
