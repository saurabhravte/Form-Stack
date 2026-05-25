import { ApiError, COOKIE_NAME } from '@formstack/shared';
import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { authController } from '../controllers/auth.controller';
import type { UserRow } from '../db';

export interface Ctx {
  user: UserRow | null;
  ipAddress?: string;
  userAgent?: string;
  cookieToken?: string;
  // Surfaces so controllers can set cookies in response (login/logout)
  setCookie: (name: string, value: string, options: Record<string, unknown>) => void;
}

export const createContext = async ({ req, res }: CreateExpressContextOptions): Promise<Ctx> => {
  const token: string | undefined = req.cookies?.[COOKIE_NAME];
  let user: UserRow | null = null;
  if (token) {
    try {
      user = await authController.verify(token);
    } catch {
      // anonymous — fall through
    }
  }
  return {
    user,
    cookieToken: token,
    ipAddress: (req.ip ?? req.headers['x-forwarded-for']?.toString())?.split(',')[0]?.trim(),
    userAgent: req.headers['user-agent'],
    setCookie: (name, value, options) => res.cookie(name, value, options),
  };
};

const t = initTRPC.context<Ctx>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const cause = error.cause;
    if (cause instanceof ApiError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          httpStatus: cause.statusCode,
          code: cause.code,
          details: cause.details,
        },
      };
    }
    if (cause instanceof ZodError) {
      return {
        ...shape,
        data: { ...shape.data, code: 'UNPROCESSABLE_ENTITY', details: cause.flatten() },
      };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

/** Requires an authenticated user; injects `ctx.user` as non-null. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED', cause: ApiError.unauthorized() });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
