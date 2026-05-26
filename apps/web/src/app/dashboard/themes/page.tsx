'use client';

import { Palette, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { getThemeDoodle, isLightColor, readableOn } from '@/lib/theme-utils';

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl md:text-4xl font-bold">Themes</h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          {themes.data?.length ?? 0} starter themes. Pick one when creating a form, or override every token.
        </p>
      </header>

      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-display text-lg font-semibold">{CATEGORY_LABELS[cat] ?? cat}</h2>
            <Badge variant="secondary">{list.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {list.map((t) => {
              const tokens = (t.tokens ?? {}) as Record<string, string>;
              const bg = tokens.background ?? '#0E1116';
              const fg = readableOn(bg, tokens.foreground);
              const primary = tokens.primary ?? '#D7263D';
              const Doodle = getThemeDoodle((t as { category?: string }).category ?? 'default');
              const light = isLightColor(bg);

              return (
                <Card
                  key={t.id}
                  className="overflow-hidden transition-transform hover:-translate-y-0.5"
                >
                  <div
                    className="relative aspect-[4/3] p-4 flex flex-col justify-between overflow-hidden"
                    style={{ background: bg, color: fg }}
                  >
                    {/* Doodle vector background */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ opacity: light ? 0.12 : 0.18 }}
                    >
                      <Doodle />
                    </div>

                    <div className="relative flex items-center justify-between text-[10px]" style={{ opacity: 0.85 }}>
                      <span className="uppercase tracking-widest font-semibold">Theme</span>
                      <span className="font-mono">{t.id}</span>
                    </div>

                    <div className="relative">
                      {/* Sample text — now uses Tailwind-friendly readable color */}
                      <div className="font-display font-bold text-lg leading-tight mb-1" style={{ color: fg }}>
                        {(t as { name?: string }).name ?? t.id}
                      </div>
                      <div className="text-xs mb-3" style={{ color: fg, opacity: 0.8 }}>
                        Sample form heading
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-6 rounded-full" style={{ background: primary }} />
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: tokens.accent ?? primary }}
                        />
                        <span className="h-2 w-2 rounded-full" style={{ background: fg, opacity: 0.3 }} />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <Card className="p-5 md:p-6 mt-6 bg-gradient-to-br from-primary/5 to-accent-amber/5 border-primary/20">
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