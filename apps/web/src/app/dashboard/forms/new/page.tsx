'use client';

import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

export default function NewFormPage() {
  const router = useRouter();
  const workspaceId = useAuthStore((s) => s.workspaceId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [themeId, setThemeId] = useState('crimson-default');

  const themes = trpc.themes.list.useQuery();
  const templates = trpc.templates.list.useQuery();

  const create = trpc.forms.create.useMutation({
    onSuccess: () => {
      toast.success('Form created');
      // BUG FIX #7: redirect to dashboard instead of form builder
      router.push('/dashboard');
    },
    onError: (e) => toast.error(e.message),
  });

  const onCreate = () => {
    if (!workspaceId) return;
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    create.mutate({
      workspaceId,
      title: title.trim(),
      description: description.trim() || undefined,
      themeId,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <h1 className="font-display text-2xl md:text-4xl font-bold mb-2">Create a new form</h1>
      <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
        Give it a name and a theme — you can change everything later.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-6">
        <Card className="p-5 md:p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Form title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Customer feedback Q2"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description (optional)</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this form is for"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themes.data?.map((t) => {
                const isLight = isLightColor(t.tokens.background);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`text-left p-3 rounded-md border-2 transition-all ${
                      themeId === t.id
                        ? 'border-primary ring-2 ring-primary/30 scale-[0.98]'
                        : 'border-border hover:border-foreground/30'
                    }`}
                    style={{
                      background: t.tokens.background,
                      color: isLight ? '#111111' : '#FAFAFA',
                    }}
                  >
                    <div className="text-[10px] opacity-70 truncate">{t.id}</div>
                    <div className="font-display font-semibold text-sm leading-tight truncate">
                      {t.name}
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="h-1.5 w-6 rounded-full" style={{ background: t.tokens.primary }} />
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: t.tokens.accent ?? t.tokens.primary }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button onClick={onCreate} disabled={create.isPending || !title.trim()}>
              {create.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                'Create form'
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold">Or start from a template</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Pre-filled with sensible fields you can edit.
          </p>
          <div className="flex flex-col gap-2">
            {templates.data?.map((tpl) => (
              <button
                key={tpl.slug}
                onClick={() => {
                  setTitle(tpl.title);
                  if (tpl.description) setDescription(tpl.description);
                  toast.success(`Loaded template: ${tpl.title}`);
                }}
                className="text-left p-3 rounded-md border border-border hover:border-foreground/30 transition-colors"
              >
                <div className="text-sm font-medium">{tpl.title}</div>
                {tpl.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {tpl.description}
                  </div>
                )}
              </button>
            ))}
            {templates.isLoading && (
              <div className="text-xs text-muted-foreground">Loading templates…</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Decide black-or-white preview text based on a theme's background.
 * Handles `#rgb`, `#rrggbb`, and falls back to assuming dark.
 */
function isLightColor(hex?: string): boolean {
  if (!hex) return false;
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (full.length !== 6) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Perceptual luminance
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}