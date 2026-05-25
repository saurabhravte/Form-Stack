'use client';

import { ArrowUpRight, Compass } from 'lucide-react';
import Link from 'next/link';

import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

export default function ExplorePage() {
  const forms = trpc.forms.listPublic.useQuery({ limit: 24 });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mb-10">
          <Badge variant="outline" className="mb-3">
            <Compass className="h-3 w-3 text-primary" /> Public gallery
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Explore public forms</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Real forms built on FormStack and shared openly. Click through to fill one out.
          </p>
        </div>

        {forms.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.data?.items.map((f) => (
            <Link key={f.id} href={`/f/${f.slug}`} target="_blank" className="group">
              <Card className="p-6 h-full hover:border-foreground/30 hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary">{f.themeId}</Badge>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1 line-clamp-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
                  {f.description || '— no description —'}
                </p>
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{f.responseCount} responses</span>
                  <span className="font-mono">/f/{f.slug}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {forms.data?.items.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            No public forms yet — check back soon.
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
