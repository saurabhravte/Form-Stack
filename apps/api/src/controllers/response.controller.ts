import { createHash } from 'node:crypto';

import { ApiError, type SubmitResponseInput } from '@formstack/shared';
import { and, desc, eq, sql } from 'drizzle-orm';

import { db, forms, responses, type FormRow } from '../db';
import { emailService } from '../services/email.service';

import { BaseController } from './base.controller';
import { formController } from './form.controller';

interface SubmitContext {
  ipAddress?: string;
  userAgent?: string;
}

interface FormField {
  id: string;
  kind: string;
  required: boolean;
  config?: Record<string, unknown>;
}

export class ResponseController extends BaseController {
  /** Public — anyone can call. Validates against the form's live schema. */
  async submit(input: SubmitResponseInput, ctx: SubmitContext = {}) {
    const [form] = await db.select().from(forms).where(eq(forms.id, input.formId)).limit(1);
    this.assertFound(form, 'Form');

    if (form.status !== 'published') throw ApiError.gone('This form is not accepting responses');
    if (form.visibility === 'private') throw ApiError.forbidden('This form is private');
    if (form.closesAt && form.closesAt < new Date()) throw ApiError.gone('This form is closed');
    if (form.responseLimit !== null && form.responseCount >= form.responseLimit) {
      throw ApiError.gone('This form has reached its response limit');
    }

    this.validateAnswersAgainstFields(input.answers, form.fields as FormField[]);

    const ipHash = ctx.ipAddress
      ? createHash('sha256').update(ctx.ipAddress).digest('hex').slice(0, 32)
      : null;

    const [row] = await db
      .insert(responses)
      .values({
        formId: form.id,
        answers: input.answers as Array<{ fieldId: string; value: unknown }>,
        metadata: { ...input.metadata, userAgent: ctx.userAgent },
        ipHash,
      })
      .returning();
    if (!row) throw ApiError.internal('Failed to record response');

    // Increment counter (cheap, denormalized).
    await db
      .update(forms)
      .set({ responseCount: sql`${forms.responseCount} + 1` })
      .where(eq(forms.id, form.id));

    // Fire-and-forget creator notification (does nothing if email is unconfigured).
    void this.notifyCreator(form, row.id);

    return { id: row.id, message: 'Response saved' };
  }

  /** List responses for a form (creator-only). */
  async listForForm(userId: string, formId: string, limit = 50, cursor?: Date) {
    const form = await formController.getById(userId, formId);
    await this.assertWorkspaceMembership(userId, form.workspaceId, 'viewer');

    const query = db
      .select()
      .from(responses)
      .where(
        and(
          eq(responses.formId, formId),
          cursor ? sql`${responses.createdAt} < ${cursor}` : sql`TRUE`,
        ),
      )
      .orderBy(desc(responses.createdAt))
      .limit(limit + 1);

    const rows = await query;
    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const last = rows.pop()!;
      nextCursor = last.createdAt.toISOString();
    }
    return { items: rows, nextCursor };
  }

  // ---- internals ------------------------------------------------

  private validateAnswersAgainstFields(answers: SubmitResponseInput['answers'], fields: FormField[]) {
    const byId = new Map(fields.map((f) => [f.id, f]));

    // Required-field check
    for (const f of fields) {
      if (!f.required) continue;
      if (f.kind === 'welcome_screen' || f.kind === 'statement') continue;
      const ans = answers.find((a) => a.fieldId === f.id);
      const empty = ans === undefined || ans.value === null || ans.value === '' ||
        (Array.isArray(ans.value) && ans.value.length === 0);
      if (empty) throw ApiError.unprocessable(`Field "${f.id}" is required`, { fieldId: f.id });
    }

    // Per-answer type sanity
    for (const a of answers) {
      const f = byId.get(a.fieldId);
      if (!f) throw ApiError.badRequest(`Unknown field ${a.fieldId}`);
      this.validateAnswerForKind(f, a.value);
    }
  }

  private validateAnswerForKind(field: FormField, value: unknown) {
    if (value === null || value === undefined) return;
    switch (field.kind) {
      case 'email':
        if (typeof value !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
          throw ApiError.unprocessable('Invalid email', { fieldId: field.id });
        }
        break;
      case 'number':
        if (typeof value !== 'number' || Number.isNaN(value)) {
          throw ApiError.unprocessable('Expected a number', { fieldId: field.id });
        }
        break;
      case 'yes_no':
      case 'checkbox':
        if (typeof value !== 'boolean') throw ApiError.unprocessable('Expected boolean', { fieldId: field.id });
        break;
      case 'multi_select':
        if (!Array.isArray(value)) throw ApiError.unprocessable('Expected array', { fieldId: field.id });
        break;
      case 'rating':
      case 'opinion_scale':
        if (typeof value !== 'number') throw ApiError.unprocessable('Expected number', { fieldId: field.id });
        break;
      default:
        // Other kinds accept any JSON-serializable value.
        break;
    }
  }

  private async notifyCreator(form: FormRow, responseId: string) {
    try {
      if (!(form.settings as { notifyOnResponse?: boolean })?.notifyOnResponse) return;
      await emailService.send({
        to: 'creator@example.com', // resolved by emailService in a full impl
        subject: `New response to "${form.title}"`,
        text: `A new response (${responseId}) was just submitted.`,
      });
    } catch (err) {
      // Notifications never block the user-visible response.
      console.warn('notifyCreator failed', err);
    }
  }
}

export const responseController = new ResponseController();
