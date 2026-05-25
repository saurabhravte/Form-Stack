import { eq } from 'drizzle-orm';

import { db, templates, themes } from '../db';
import { publicProcedure, router } from '../trpc/context';

export const themesRouter = router({
  list: publicProcedure.query(() => db.select().from(themes)),
  byId: publicProcedure
    .input((v) => v as { id: string })
    .query(({ input }) => db.select().from(themes).where(eq(themes.id, input.id)).limit(1).then((r) => r[0])),
});

export const templatesRouter = router({
  list: publicProcedure.query(() => db.select().from(templates)),
  bySlug: publicProcedure
    .input((v) => v as { slug: string })
    .query(({ input }) =>
      db.select().from(templates).where(eq(templates.slug, input.slug)).limit(1).then((r) => r[0]),
    ),
});

export type ThemesRouter = typeof themesRouter;
export type TemplatesRouter = typeof templatesRouter;
