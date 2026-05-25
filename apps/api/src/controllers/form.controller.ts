import { randomBytes } from 'node:crypto';

import {
  ApiError,
  FieldConfigSchema,
  FormSettingsSchema,
  type FieldConfig,
} from '@formstack/shared';
import { and, asc, count, desc, eq, sql } from 'drizzle-orm';

import { db, forms, themes, type FormRow } from '../db';

import { BaseController } from './base.controller';

export interface CreateFormDto {
  workspaceId: string;
  title: string;
  description?: string;
  type?: FormRow['type'];
  themeId?: string;
  templateId?: string | null;
}

export interface UpdateFormDto {
  id: string;
  title?: string;
  description?: string;
  slug?: string;
  visibility?: FormRow['visibility'];
  status?: FormRow['status'];
  themeId?: string;
  fields?: FieldConfig[];
  settings?: Record<string, unknown>;
}

export class FormController extends BaseController {
  /** List forms in a workspace (creator dashboard). */
  async listByWorkspace(userId: string, workspaceId: string) {
    await this.assertWorkspaceMembership(userId, workspaceId, 'viewer');
    return db
      .select()
      .from(forms)
      .where(eq(forms.workspaceId, workspaceId))
      .orderBy(desc(forms.updatedAt));
  }

  /** Discover — only public + published forms, paginated. */
  async listPublic(limit = 24, cursor?: string) {
    const rows = await db
      .select()
      .from(forms)
      .where(and(eq(forms.visibility, 'public'), eq(forms.status, 'published')))
      .orderBy(desc(forms.publishedAt))
      .limit(limit + 1);

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const last = rows.pop()!;
      nextCursor = last.id;
    }
    return { items: rows, nextCursor };
  }

  /** Get one form by id — owner/member access. */
  async getById(userId: string, id: string) {
    const [form] = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
    this.assertFound(form, 'Form');
    await this.assertWorkspaceMembership(userId, form.workspaceId, 'viewer');
    return form;
  }

  /**
   * Get the public-facing view of a form by slug.
   * Enforces the visibility rules:
   *  - draft   -> 404 (looks like it doesn't exist to the public)
   *  - private -> 404
   *  - unlisted -> ok via direct link (the slug *is* the link)
   *  - public  -> ok and also appears on /explore
   *
   * Also returns a sanitized form (no creator info, no internal counters).
   */
  async getPublicBySlug(slug: string) {
    const [form] = await db.select().from(forms).where(eq(forms.slug, slug)).limit(1);
    if (!form) throw ApiError.notFound('This form does not exist or is no longer available');
    if (form.status !== 'published') throw ApiError.notFound('This form is not currently accepting responses');
    if (form.visibility === 'private') throw ApiError.notFound('This form is not currently accepting responses');

    if (form.closesAt && form.closesAt < new Date()) {
      throw ApiError.gone('This form is closed.');
    }
    if (form.responseLimit !== null && form.responseCount >= form.responseLimit) {
      throw ApiError.gone('This form has reached its response limit.');
    }

    // Hydrate the theme alongside the form so the public renderer can apply tokens
    // without an extra round-trip.
    const [theme] = await db.select().from(themes).where(eq(themes.id, form.themeId)).limit(1);

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      slug: form.slug,
      themeId: form.themeId,
      theme: theme ?? null,
      fields: form.fields,
      settings: form.settings,
    };
  }

  /** Create. */
  async create(userId: string, dto: CreateFormDto): Promise<FormRow> {
    await this.assertWorkspaceMembership(userId, dto.workspaceId, 'editor');
    const slug = await this.generateUniqueSlug(dto.title);

    const [row] = await db
      .insert(forms)
      .values({
        workspaceId: dto.workspaceId,
        createdByUserId: userId,
        title: dto.title,
        description: dto.description,
        slug,
        type: dto.type ?? 'form',
        themeId: dto.themeId ?? 'crimson-default',
        status: 'draft',
        visibility: 'unlisted',
        fields: [],
        settings: {},
      })
      .returning();
    if (!row) throw ApiError.internal('Failed to create form');
    return row;
  }

  /** Update — handles title/desc/slug/visibility/status/fields/settings in one call. */
  async update(userId: string, dto: UpdateFormDto): Promise<FormRow> {
    const existing = await this.getById(userId, dto.id);
    await this.assertWorkspaceMembership(userId, existing.workspaceId, 'editor');

    const patch: Partial<FormRow> = { updatedAt: new Date() };
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.themeId !== undefined) patch.themeId = dto.themeId;
    if (dto.visibility !== undefined) patch.visibility = dto.visibility;
    if (dto.status !== undefined) patch.status = dto.status;

    if (dto.slug !== undefined && dto.slug !== existing.slug) {
      const clash = await db.select({ id: forms.id }).from(forms).where(eq(forms.slug, dto.slug)).limit(1);
      if (clash.length) throw ApiError.conflict('That URL is already taken', { field: 'slug' });
      patch.slug = dto.slug;
    }

    if (dto.fields !== undefined) {
      // Re-validate fields strictly server-side. Defense in depth — the
      // tRPC input validator already ran, but if anyone calls .update with
      // ad-hoc fields, this catches it.
      for (const f of dto.fields) {
        const parsed = FieldConfigSchema.safeParse(f);
        if (!parsed.success) throw ApiError.unprocessable('Invalid field config', parsed.error.flatten());
      }
      patch.fields = dto.fields;
    }

    if (dto.settings !== undefined) {
      const parsed = FormSettingsSchema.partial().safeParse(dto.settings);
      if (!parsed.success) throw ApiError.unprocessable('Invalid form settings', parsed.error.flatten());
      patch.settings = { ...(existing.settings as Record<string, unknown>), ...parsed.data };
    }

    const [updated] = await db.update(forms).set(patch).where(eq(forms.id, dto.id)).returning();
    this.assertFound(updated, 'Form');
    return updated;
  }

  async publish(userId: string, id: string, visibility: FormRow['visibility'] = 'unlisted') {
    const form = await this.getById(userId, id);
    if (!Array.isArray(form.fields) || form.fields.length === 0) {
      throw ApiError.badRequest('Add at least one field before publishing');
    }
    const [updated] = await db
      .update(forms)
      .set({ status: 'published', visibility, publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    this.assertFound(updated, 'Form');
    return updated;
  }

  async unpublish(userId: string, id: string) {
    const form = await this.getById(userId, id);
    const [updated] = await db
      .update(forms)
      .set({ status: 'draft', updatedAt: new Date() })
      .where(eq(forms.id, form.id))
      .returning();
    this.assertFound(updated, 'Form');
    return updated;
  }

  async archive(userId: string, id: string) {
    const form = await this.getById(userId, id);
    const [updated] = await db
      .update(forms)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(forms.id, form.id))
      .returning();
    this.assertFound(updated, 'Form');
    return updated;
  }

  /** Clone — duplicates fields+settings into a fresh draft. */
  async clone(userId: string, id: string): Promise<FormRow> {
    const src = await this.getById(userId, id);
    const newSlug = await this.generateUniqueSlug(`${src.title} (copy)`);

    const [row] = await db
      .insert(forms)
      .values({
        workspaceId: src.workspaceId,
        createdByUserId: userId,
        title: `${src.title} (copy)`,
        description: src.description,
        slug: newSlug,
        type: src.type,
        status: 'draft',
        visibility: 'unlisted',
        themeId: src.themeId,
        fields: src.fields,
        settings: src.settings,
      })
      .returning();
    if (!row) throw ApiError.internal('Failed to clone form');
    return row;
  }

  /** Stats: total forms in a workspace. */
  async workspaceStats(userId: string, workspaceId: string) {
    await this.assertWorkspaceMembership(userId, workspaceId, 'viewer');
    const [total] = await db
      .select({ count: count() })
      .from(forms)
      .where(eq(forms.workspaceId, workspaceId));
    const [published] = await db
      .select({ count: count() })
      .from(forms)
      .where(and(eq(forms.workspaceId, workspaceId), eq(forms.status, 'published')));
    const totalResponses = await db
      .select({ sum: sql<number>`COALESCE(SUM(${forms.responseCount}), 0)::int` })
      .from(forms)
      .where(eq(forms.workspaceId, workspaceId));

    return {
      formCount: total?.count ?? 0,
      publishedCount: published?.count ?? 0,
      totalResponses: totalResponses[0]?.sum ?? 0,
    };
  }

  // ---- internals ------------------------------------------------

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'form';

    for (let i = 0; i < 5; i++) {
      const candidate = i === 0 ? base : `${base}-${randomBytes(3).toString('hex')}`;
      const [clash] = await db.select({ id: forms.id }).from(forms).where(eq(forms.slug, candidate)).limit(1);
      if (!clash) return candidate;
    }
    return `${base}-${randomBytes(6).toString('hex')}`;
  }
}

export const formController = new FormController();
