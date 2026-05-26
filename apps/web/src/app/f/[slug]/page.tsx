'use client';

import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FieldRenderer, type RenderableField } from '@/components/forms/field-renderer';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { getThemeDoodle, isLightColor, readableOn } from '@/lib/theme-utils';

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [done, setDone] = useState<{ message: string } | null>(null);
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    return crypto.randomUUID();
  });
  const startedAt = useMemo(() => Date.now(), []);

  const formQuery = trpc.forms.getPublicBySlug.useQuery({ slug }, { enabled: !!slug });
  const submit = trpc.responses.submit.useMutation({
    onSuccess: (r) => {
      setDone({ message: r.message ?? 'Thanks for your response!' });
      try {
        recordEvent.mutate({ formId: formQuery.data!.id, type: 'submit', sessionId });
      } catch {
        /* noop */
      }
    },
  });
  const recordEvent = trpc.analytics.recordEvent.useMutation();

  const fields = useMemo(
    () => ((formQuery.data?.fields as RenderableField[] | undefined) ?? []),
    [formQuery.data],
  );

  const { control, handleSubmit, formState } = useForm<Record<string, unknown>>({
    defaultValues: useMemo(
      () => Object.fromEntries(fields.map((f) => [f.id, undefined])),
      [fields],
    ),
  });

  useEffect(() => {
    if (formQuery.data && sessionId) {
      recordEvent.mutate({ formId: formQuery.data.id, type: 'view', sessionId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formQuery.data?.id, sessionId]);

  // Resolve theme tokens + readable fg
  const theme = formQuery.data?.theme as
    | { category?: string; tokens?: Record<string, string> }
    | undefined;
  const tokens = theme?.tokens ?? {};
  const bg = tokens.background ?? '#FBF8F1';
  const fg = readableOn(bg, tokens.foreground);
  const primary = tokens.primary ?? '#D7263D';
  const surface = tokens.surface ?? (isLightColor(bg) ? '#FFFFFF' : '#1A1D22');
  const Doodle = getThemeDoodle(theme?.category);

  const themeStyle = {
    '--theme-bg': bg,
    '--theme-fg': fg,
    '--theme-surface': surface,
    '--theme-primary': primary,
    '--theme-border': isLightColor(bg) ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)',
  } as React.CSSProperties;

  if (formQuery.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!formQuery.data) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-center">
        <div>
          <div className="text-5xl mb-2">🔍</div>
          <h1 className="font-display text-2xl font-bold mb-1">Form not found</h1>
          <p className="text-sm text-muted-foreground">It may be unpublished or private.</p>
          <Button asChild className="mt-4">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }
  const form = formQuery.data;

  if (done) {
    return (
      <div
        className="min-h-screen grid place-items-center px-4 text-center relative overflow-hidden"
        style={{ ...themeStyle, background: bg, color: fg }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ color: fg, opacity: 0.08 }}>
          <Doodle />
        </div>
        <div className="max-w-md animate-fade-in relative">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">{done.message}</h1>
          <p className="text-sm opacity-70 mb-6">Your response was recorded successfully.</p>
          <button
            onClick={() => {
              setDone(null);
              window.scrollTo(0, 0);
            }}
            className="px-5 py-2.5 rounded-md font-medium border transition-colors"
            style={{ borderColor: fg, color: fg }}
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = handleSubmit((values) => {
    const answers = fields
      .filter((f) => f.kind !== 'welcome_screen' && f.kind !== 'statement')
      .map((f) => ({ fieldId: f.id, value: values[f.id] }));

    submit.mutate({
      formId: form.id,
      answers,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        durationMs: Date.now() - startedAt,
      },
    });
  });

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ ...themeStyle, background: bg, color: fg }}
    >
      {/* Doodle vector watermark for playful feel */}
      <div className="absolute inset-0 pointer-events-none" style={{ color: fg, opacity: 0.07 }}>
        <Doodle />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8 md:py-16">
        <header className="mb-8 md:mb-10">
          <h1 className="font-display text-2xl md:text-4xl font-bold mb-2" style={{ color: fg }}>
            {form.title}
          </h1>
          {form.description && (
            <p className="text-sm md:text-base" style={{ color: fg, opacity: 0.75 }}>
              {form.description}
            </p>
          )}
        </header>

        <form onSubmit={onSubmit} className="space-y-6 md:space-y-8">
          {fields.map((f) => (
            <FieldRenderer
              key={f.id}
              field={f as RenderableField}
              control={control as never}
              error={formState.errors[f.id] as never}
              themed
            />
          ))}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submit.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 shadow-sm"
              style={{ background: primary, color: '#fff' }}
            >
              {submit.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  Submit <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            {submit.error && (
              <p className="mt-3 text-sm text-red-500">{submit.error.message}</p>
            )}
          </div>
        </form>

        <footer
          className="mt-12 md:mt-16 pt-6 border-t text-xs flex items-center justify-between"
          style={{ borderColor: 'var(--theme-border)', color: fg, opacity: 0.6 }}
        >
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-100">
            <ShieldCheck className="h-3 w-3" />
            Powered by FormStack
          </Link>
          <span>Your response is private.</span>
        </footer>
      </div>
    </div>
  );
}