import { authRouter } from './auth.router';
import { formsRouter } from './forms.router';
import { analyticsRouter, responsesRouter } from './responses.router';
import { templatesRouter, themesRouter } from './themes.router';

import { router } from '../trpc/context';

export const appRouter = router({
  auth: authRouter,
  forms: formsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  themes: themesRouter,
  templates: templatesRouter,
});

export type AppRouter = typeof appRouter;
