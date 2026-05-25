import { ApiError } from '@formstack/shared';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';

import { db, formEvents, forms, responses } from '../db';

import { BaseController } from './base.controller';
import { formController } from './form.controller';

export interface OverviewRow {
  formId: string;
  totalViews: number;
  uniqueViews: number;
  totalResponses: number;
  completionRate: number;
  avgDurationMs: number;
}

export class AnalyticsController extends BaseController {
  /** Top-level metrics for the form detail page. */
  async overview(userId: string, formId: string): Promise<OverviewRow> {
    const form = await formController.getById(userId, formId);

    const [views] = await db
      .select({
        total: count(),
        unique: sql<number>`COUNT(DISTINCT ${formEvents.sessionId})::int`,
      })
      .from(formEvents)
      .where(and(eq(formEvents.formId, form.id), eq(formEvents.type, 'view')));

    const [responseAgg] = await db
      .select({
        total: count(),
        avgDuration: sql<number>`COALESCE(AVG((${responses.metadata}->>'durationMs')::int), 0)::int`,
      })
      .from(responses)
      .where(eq(responses.formId, form.id));

    const totalViews = views?.total ?? 0;
    const uniqueViews = views?.unique ?? 0;
    const totalResponses = responseAgg?.total ?? 0;
    const completionRate = uniqueViews ? totalResponses / uniqueViews : 0;

    return {
      formId: form.id,
      totalViews,
      uniqueViews,
      totalResponses,
      completionRate: Math.round(completionRate * 1000) / 10, // percentage with 1 decimal
      avgDurationMs: responseAgg?.avgDuration ?? 0,
    };
  }

  /** Time series — responses per day for the last N days. */
  async dailyResponses(userId: string, formId: string, days = 30) {
    const form = await formController.getById(userId, formId);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await db
      .select({
        bucket: sql<string>`to_char(date_trunc('day', ${responses.createdAt}), 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(responses)
      .where(and(eq(responses.formId, form.id), gte(responses.createdAt, since)))
      .groupBy(sql`date_trunc('day', ${responses.createdAt})`)
      .orderBy(sql`date_trunc('day', ${responses.createdAt})`);

    return rows;
  }

  /** Field-level completion (drop-off). */
  async fieldCompletion(userId: string, formId: string) {
    const form = await formController.getById(userId, formId);

    const allResponses = await db
      .select({ answers: responses.answers })
      .from(responses)
      .where(eq(responses.formId, form.id));

    const fields = (form.fields as Array<{ id: string; label: string; kind: string }>) ?? [];
    return fields.map((f) => {
      const completed = allResponses.filter((r) => {
        const a = r.answers.find((x) => x.fieldId === f.id);
        return a !== undefined && a.value !== null && a.value !== '';
      }).length;
      const rate = allResponses.length ? completed / allResponses.length : 0;
      return {
        fieldId: f.id,
        label: f.label,
        kind: f.kind,
        completed,
        total: allResponses.length,
        rate: Math.round(rate * 1000) / 10,
      };
    });
  }

  /** CSV export. Streams not implemented here — we build a string and let the route ship it. */
  async exportCsv(userId: string, formId: string): Promise<string> {
    const form = await formController.getById(userId, formId);
    const fields = (form.fields as Array<{ id: string; label: string }>) ?? [];

    const rows = await db
      .select()
      .from(responses)
      .where(eq(responses.formId, form.id))
      .orderBy(desc(responses.createdAt));

    const header = ['Submitted at', ...fields.map((f) => f.label.replace(/"/g, '""'))];
    const lines = [header.map((h) => `"${h}"`).join(',')];

    for (const r of rows) {
      const cells = [r.createdAt.toISOString(), ...fields.map((f) => {
        const a = r.answers.find((x) => x.fieldId === f.id);
        const v = a?.value;
        if (v === null || v === undefined) return '';
        return typeof v === 'string' ? v : JSON.stringify(v);
      })];
      lines.push(cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
    }
    return lines.join('\n');
  }

  /** Record an analytics event (called from the public form page on view/start/etc). */
  async recordEvent(input: { formId: string; type: string; fieldId?: string; sessionId?: string }) {
    const [form] = await db.select({ id: forms.id }).from(forms).where(eq(forms.id, input.formId)).limit(1);
    if (!form) throw ApiError.notFound('Form not found');
    await db.insert(formEvents).values({
      formId: form.id,
      type: input.type,
      fieldId: input.fieldId,
      sessionId: input.sessionId,
    });
    return { ok: true };
  }
}

export const analyticsController = new AnalyticsController();
