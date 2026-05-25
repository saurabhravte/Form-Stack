import { CreateFormSchema, PublishFormSchema, UpdateFormSchema } from "@formstack/shared";
import { z } from "zod";

import { formController } from "../controllers/form.controller";

import { protectedProcedure, publicProcedure, router } from "../trpc/context";

export const formsRouter = router({
  listMine: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(({ ctx, input }) => formController.listByWorkspace(ctx.user.id, input.workspaceId)),

  workspaceStats: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(({ ctx, input }) => formController.workspaceStats(ctx.user.id, input.workspaceId)),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => formController.getById(ctx.user.id, input.id)),

  create: protectedProcedure
    .input(CreateFormSchema)
    .mutation(({ ctx, input }) => formController.create(ctx.user.id, input)),

  update: protectedProcedure
    .input(UpdateFormSchema)
    .mutation(({ ctx, input }) => formController.update(ctx.user.id, input)),

  publish: protectedProcedure
    .input(PublishFormSchema)
    .mutation(({ ctx, input }) => formController.publish(ctx.user.id, input.id, input.visibility)),

  unpublish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => formController.unpublish(ctx.user.id, input.id)),

  archive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => formController.archive(ctx.user.id, input.id)),

  clone: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => formController.clone(ctx.user.id, input.id)),

  listPublic: publicProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(50).default(24), cursor: z.string().nullish() })
        .optional(),
    )
    .query(({ input }) => formController.listPublic(input?.limit, input?.cursor ?? undefined)),

  getPublicBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(({ input }) => formController.getPublicBySlug(input.slug)),
});

export type FormsRouter = typeof formsRouter;
