'use client';

import { Palette, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { trpc } from '@/lib/trpc';

const CATEGORY_LABELS: Record<string, string> = {
  default: 'FormStack',
  india: 'India',
  festival: 'Festivals',
  japan: 'Japan',
  season: 'Seasons',
  nature: 'Nature',
  os: 'Operating systems',
  games: 'Games',
  movies: 'Movies',
  anime: 'Anime',
  startups: 'Startups',
  tech: 'Tech',
  events: 'Events',
  community: 'Community',
};

export default function ThemesPage() {
  const themes = trpc.themes.list.useQuery();

  const grouped =
    themes.data?.reduce<Record<string, typeof themes.data>>((acc, t) => {
      const cat = (t as { category?: string }).category ?? 'default';
      (acc[cat] ||= []).push(t);
      return acc;
    }, {}) ?? {};

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-5 w-5 text-primary" />
          <h1 className="font-display text-3xl md:text-4xl font-bold">Themes</h1>
        </div>
        <p className="text-muted-foreground">
          {themes.data?.length ?? 0} starter themes. Pick one when creating a form, or override every token.
        </p>
      </header>

      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-display text-lg font-semibold">{CATEGORY_LABELS[cat] ?? cat}</h2>
            <Badge variant="secondary">{list.length}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {list.map((t) => {
              const tokens = (t.tokens ?? {}) as Record<string, string>;
              return (
                <Card
                  key={t.id}
                  className="overflow-hidden transition-transform hover:-translate-y-0.5"
                >
                  <div
                    className="aspect-[4/3] p-4 flex flex-col justify-between"
                    style={{ background: tokens.background, color: tokens.foreground }}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-70">
                      <span className="uppercase tracking-widest">Theme</span>
                      <span className="font-mono">{t.id}</span>
                    </div>
                    <div>
                      <div className="font-display font-semibold text-base leading-tight mb-2">
                        {(t as { name?: string }).name ?? t.id}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-6 rounded-full" style={{ background: tokens.primary }} />
                        <span className="h-2 w-2 rounded-full" style={{ background: tokens.accent }} />
                        <span
                          className={cn('h-2 w-2 rounded-full opacity-30')}
                          style={{ background: tokens.foreground }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <Card className="p-6 mt-6 bg-gradient-to-br from-primary/5 to-accent-amber/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-display font-semibold mb-1">Custom themes coming soon</h3>
            <p className="text-sm text-muted-foreground">
              Override every CSS token (background, foreground, primary, radius, fonts) per workspace.
              Stored in the <code className="font-mono text-foreground">themes</code> table; rendered live
              via CSS variables on the public renderer.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
