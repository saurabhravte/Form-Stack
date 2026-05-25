'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

export default function TemplatesPage() {
  const templates = trpc.templates.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mb-10">
          <Badge variant="outline" className="mb-3">
            <Sparkles className="h-3 w-3 text-primary" /> Templates
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Start from a template.</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Battle-tested form layouts for the most common jobs. Tweak everything, of course.
          </p>
        </div>

        {templates.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.data?.map((tpl) => (
            <Card key={tpl.slug} className="p-6 hover:border-foreground/30 transition-colors">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {tpl.category ?? 'General'}
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{tpl.title}</h3>
              {tpl.description && (
                <p className="text-sm text-muted-foreground mb-5 line-clamp-3 min-h-[3.5rem]">
                  {tpl.description}
                </p>
              )}
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/auth/sign-up">
                  Use template <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
