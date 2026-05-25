import { ApiError, RATE_LIMITS } from '@formstack/shared';
import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';

/** Global error handler — every thrown error in the REST surface comes here. */
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  if (err instanceof ZodError) {
    const apiErr = ApiError.unprocessable('Validation failed', err.flatten());
    return res.status(apiErr.statusCode).json(apiErr.toJSON());
  }
  console.error('[unhandled]', err);
  const apiErr = ApiError.internal(err instanceof Error ? err.message : 'Internal error');
  return res.status(apiErr.statusCode).json(apiErr.toJSON());
};

/** Public-submission rate limiter — 10 submissions per minute per IP. */
export const publicSubmitLimiter = rateLimit({
  windowMs: RATE_LIMITS.publicSubmit.windowMs,
  max: RATE_LIMITS.publicSubmit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const err = ApiError.tooMany('Too many submissions, please wait a moment.');
    res.status(err.statusCode).json(err.toJSON());
  },
});

/** Login limiter — slow down credential stuffing. */
export const loginLimiter = rateLimit({
  windowMs: RATE_LIMITS.authLogin.windowMs,
  max: RATE_LIMITS.authLogin.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const err = ApiError.tooMany('Too many login attempts, please wait a minute.');
    res.status(err.statusCode).json(err.toJSON());
  },
});

export const registerLimiter = rateLimit({
  windowMs: RATE_LIMITS.authRegister.windowMs,
  max: RATE_LIMITS.authRegister.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const err = ApiError.tooMany('Too many sign-up attempts, please wait a minute.');
    res.status(err.statusCode).json(err.toJSON());
  },
});

/** Light request log. */
export const requestLog = (req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.info('→', req.method, req.url);
  }
  next();
};
