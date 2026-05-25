import { ApiError, COOKIE_NAME, LoginInputSchema, RegisterInputSchema } from "@formstack/shared";

import { authController } from "../controllers/auth.controller";

import { protectedProcedure, publicProcedure, router } from "../trpc/context";

export const authRouter = router({
  register: publicProcedure.input(RegisterInputSchema).mutation(async ({ ctx, input }) => {
    const result = await authController.register(input, {
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
    });
    ctx.setCookie(result.cookie.name, result.cookie.value, result.cookie.options);
    return { user: result.user, workspaceId: result.workspaceId };
  }),

  login: publicProcedure.input(LoginInputSchema).mutation(async ({ ctx, input }) => {
    const result = await authController.login(input, {
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
    });
    ctx.setCookie(result.cookie.name, result.cookie.value, result.cookie.options);
    return { user: result.user, workspaceId: result.workspaceId };
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const directive = await authController.logout(ctx.cookieToken);
    ctx.setCookie(directive.name, directive.value, directive.options);
    return { ok: true };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const workspaceId = await authController.getPrimaryWorkspaceId(ctx.user.id);
    return {
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        avatarUrl: ctx.user.avatarUrl,
      },
      workspaceId,
    };
  }),

  whoami: protectedProcedure.query(({ ctx }) => ({ id: ctx.user.id, email: ctx.user.email })),
});

export type AuthRouter = typeof authRouter;
export { COOKIE_NAME };

export { ApiError };
