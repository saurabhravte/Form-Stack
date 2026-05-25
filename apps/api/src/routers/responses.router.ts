import { SubmitResponseSchema } from "@formstack/shared";
import { z } from "zod";

import { analyticsController } from "../controllers/analytics.controller";
import { responseController } from "../controllers/response.controller";

import { protectedProcedure, publicProcedure, router } from "../trpc/context";

export const responsesRouter = router({
  submit: publicProcedure
    .input(SubmitResponseSchema)
    .mutation(({ ctx, input }) =>
      responseController.submit(input, { ipAddress: ctx.ipAddress, userAgent: ctx.userAgent }),
    ),

  listForForm: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().datetime().nullish(),
      }),
    )
    .query(({ ctx, input }) =>
      responseController.listForForm(
        ctx.user.id,
        input.formId,
        input.limit,
        input.cursor ? new Date(input.cursor) : undefined,
      ),
    ),
});

export const analyticsRouter = router({
  overview: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(({ ctx, input }) => analyticsController.overview(ctx.user.id, input.formId)),

  dailyResponses: protectedProcedure
    .input(
      z.object({ formId: z.string().uuid(), days: z.number().int().min(1).max(180).default(30) }),
    )
    .query(({ ctx, input }) =>
      analyticsController.dailyResponses(ctx.user.id, input.formId, input.days),
    ),

  fieldCompletion: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(({ ctx, input }) => analyticsController.fieldCompletion(ctx.user.id, input.formId)),

  recordEvent: publicProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        type: z.enum(["view", "start", "field_seen", "field_completed", "submit", "drop"]),
        fieldId: z.string().uuid().optional(),
        sessionId: z.string().optional(),
      }),
    )
    .mutation(({ input }) => analyticsController.recordEvent(input)),

  exportCsv: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(({ ctx, input }) => analyticsController.exportCsv(ctx.user.id, input.formId)),
});

export type ResponsesRouter = typeof responsesRouter;
export type AnalyticsRouter = typeof analyticsRouter;
