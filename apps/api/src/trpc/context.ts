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

/**
 * Maps the backend's `ApiError` onto the matching tRPC error code so that
 * operational 4xx errors (409 conflict, 404 not found, 401, ...) are NOT
 * reported as INTERNAL_SERVER_ERROR. Without this, a routine "workspace URL
 * is taken" 409 goes out to the client as a 500 and is logged with a full
 * stack trace by the `onError` handler in index.ts.
 */
type TrpcCode = ConstructorParameters<typeof TRPCError>[0]['code'];

const STATUS_TO_TRPC: Record<number, TrpcCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_SUPPORTED',
  408: 'TIMEOUT',
  409: 'CONFLICT',
  412: 'PRECONDITION_FAILED',
  413: 'PAYLOAD_TOO_LARGE',
  422: 'UNPROCESSABLE_CONTENT',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
};

const errorMapper = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw new TRPCError({
        code: STATUS_TO_TRPC[err.statusCode] ?? 'INTERNAL_SERVER_ERROR',
        message: err.message,
        cause: err,
      });
    }
    throw err;
  }
});

export const publicProcedure = t.procedure.use(errorMapper);

/** Requires an authenticated user; injects `ctx.user` as non-null. */
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED', cause: ApiError.unauthorized() });
  return next({ ctx: { ...ctx, user: ctx.user } });
});