import { randomUUID, createHash } from 'node:crypto';

import {
  ApiError,
  COOKIE_NAME,
  type LoginInput,
  type RegisterInput,
} from '@formstack/shared';
import bcrypt from 'bcryptjs';
import { and, eq, isNull } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { db, sessions, users, workspaceMembers, workspaces, type UserRow } from '../db';

import { BaseController } from './base.controller';

export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

 export interface AuthResult {
  user: PublicUserShape;
  workspaceId: string;
  token: string;
  cookie: CookieDirective;
}

export interface PublicUserShape {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string; 
}

export interface CookieDirective {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: '/';
    maxAge: number;
    domain?: string;
  };
}

export class AuthController extends BaseController {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly cookieDomain: string | undefined;
  private readonly sessionTtlMs: number;
  private readonly isProd: boolean;

  constructor() {
    super();
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be set and at least 32 characters');
    }
    this.jwtSecret = secret;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
    // Browsers reject explicit `Domain=localhost` (and a few similar bare hostnames),
    // which silently breaks sign-in in dev. Leave the cookie host-only in those cases.
    const rawDomain = process.env.COOKIE_DOMAIN;
    this.cookieDomain =
      rawDomain && rawDomain !== 'localhost' && !rawDomain.startsWith('127.')
        ? rawDomain
        : undefined;
    this.sessionTtlMs = 7 * 24 * 60 * 60 * 1000;
    this.isProd = process.env.NODE_ENV === 'production';
  }

  /** Sign-up — creates user + workspace + membership + session in one transaction. */
  async register(input: RegisterInput, ctx: SessionContext = {}): Promise<AuthResult> {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);
    if (existing.length) throw ApiError.conflict('An account with this email already exists');

    const slugTaken = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, input.workspaceSlug.toLowerCase()))
      .limit(1);
    if (slugTaken.length) throw ApiError.conflict('That workspace URL is taken', { field: 'workspaceSlug' });

    const passwordHash = await bcrypt.hash(input.password, 12);

    const [user] = await db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
      })
      .returning();
    if (!user) throw ApiError.internal('Failed to create user');

    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: input.workspaceName,
        slug: input.workspaceSlug.toLowerCase(),
        ownerId: user.id,
        plan: 'free',
      })
      .returning();
    if (!workspace) throw ApiError.internal('Failed to create workspace');

    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner',
    });

    const { token } = await this.issueSession(user, ctx);

    return {
      user: this.toPublicUser(user),
      workspaceId: workspace.id,
      token,
      cookie: this.cookieDirective(token),
    };
  }

  /** Login — verify password, issue new session. */
  async login(input: LoginInput, ctx: SessionContext = {}): Promise<AuthResult> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid email or password');

    const [membership] = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    const { token } = await this.issueSession(user, ctx);

    return {
      user: this.toPublicUser(user),
      workspaceId: membership?.workspaceId ?? '',
      token,
      cookie: this.cookieDirective(token),
    };
  }

  /** Revoke session and produce a cookie directive that clears the cookie. */
  async logout(token: string | undefined): Promise<CookieDirective> {
    if (token) {
      const tokenHash = this.hashToken(token);
      await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)));
    }
    return this.clearCookieDirective();
  }

  /**
   * Verify a JWT and validate the matching session is still alive.
   * Returns the user row; throws ApiError.unauthorized on any failure.
   *
   * The auth middleware calls this on every protected request.
   */
  async verify(token: string | undefined): Promise<UserRow> {
    if (!token) throw ApiError.unauthorized();

    let payload: { sub: string; sid: string };
    try {
      payload = jwt.verify(token, this.jwtSecret) as typeof payload;
    } catch {
      throw ApiError.unauthorized('Session expired, please sign in again');
    }

    const tokenHash = this.hashToken(token);
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)))
      .limit(1);
    if (!session) throw ApiError.unauthorized('Session no longer valid');
    if (session.expiresAt < new Date()) throw ApiError.unauthorized('Session expired');

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user) throw ApiError.unauthorized();

    return user;
  }

  // ---- internals -------------------------------------------------

  private async issueSession(user: UserRow, ctx: SessionContext): Promise<{ token: string; sessionId: string }> {
    const sessionId = randomUUID();
    const token = jwt.sign({ sub: user.id, sid: sessionId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    await db.insert(sessions).values({
      userId: user.id,
      tokenHash: this.hashToken(token),
      userAgent: ctx.userAgent?.slice(0, 500),
      ipAddress: ctx.ipAddress,
      expiresAt: new Date(Date.now() + this.sessionTtlMs),
    });

    return { token, sessionId };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(user: UserRow): PublicUserShape {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(), 
    };
  }

  private cookieDirective(token: string): CookieDirective {
    return {
      name: COOKIE_NAME,
      value: token,
      options: {
        httpOnly: true,
        secure: this.isProd,
        sameSite: this.isProd ? 'none' : 'lax',
        path: '/',
        maxAge: this.sessionTtlMs,
        ...(this.cookieDomain ? { domain: this.cookieDomain } : {}),
      },
    };
  }

  /** For the `me` endpoint — returns the user's primary workspace id, or null. */
  async getPrimaryWorkspaceId(userId: string): Promise<string | null> {
    const [m] = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))
      .limit(1);
    return m?.workspaceId ?? null;
  }

  private clearCookieDirective(): CookieDirective {
    return {
      name: COOKIE_NAME,
      value: '',
      options: {
        httpOnly: true,
        secure: this.isProd,
        sameSite: this.isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 0,
        ...(this.cookieDomain ? { domain: this.cookieDomain } : {}),
      },
    };
  }
}

export const authController = new AuthController();
