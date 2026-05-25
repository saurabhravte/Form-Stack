import {
  ArrowRight,
  BarChart3,
  Code2,
  Eye,
  Layers,
  Lock,
  Palette,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden -mt-24 pt-32 md:pt-40 pb-20 md:pb-28">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
        <div className="absolute -top-32 right-1/4 h-[26rem] w-[26rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-20 left-1/4 h-[20rem] w-[20rem] rounded-full bg-accent-amber/15 blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 gap-1.5 animate-fade-in">
              <Sparkles className="h-3 w-3 text-primary" />
              v0.1 · type-safe forms, end to end
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight animate-fade-in">
              Forms people <br className="hidden md:block" />
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">actually finish.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,8 Q25,2 50,6 T100,4"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in">
              The Typeform-style builder with 25+ field types, 19 themed presets, real-time analytics,
              and a public flow that works without an account. Type-safe from Zod schema to React Hook Form.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
              <Button size="lg" asChild className="rounded-full">
                <Link href="/auth/sign-up">
                  Start building free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full">
                <Link href="/explore">Browse public forms</Link>
              </Button>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground bg-surface/60 backdrop-blur border border-border/60 rounded-full px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Demo: <code className="font-mono text-foreground">demo@formstack.dev</code> ·{' '}
              <code className="font-mono text-foreground">Demo1234!</code>
            </div>
          </div>

          {/* Hero device mock */}
          <div className="relative mx-auto mt-16 max-w-4xl animate-fade-in">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/40 via-accent-amber/30 to-accent-violet/40 blur-xl opacity-50" />
            <div className="relative rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl shadow-black/10">
              <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">formstack.dev/f/anime-census</span>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-10 border-r border-border">
                  <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
                    Question 3 of 7
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3 leading-snug">
                    Which series defined your 2026?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">Pick the one you couldn&apos;t stop talking about.</p>
                  <div className="space-y-2">
                    {[
                      "Frieren · Beyond Journey's End",
                      'Solo Leveling',
                      'Kaiju No. 8',
                      'Other',
                    ].map((opt, i) => (
                      <div
                        key={opt}
                        className={`px-4 py-3 rounded-lg border text-sm transition-colors ${
                          i === 0 ? 'border-primary bg-primary/5 text-foreground font-medium' : 'border-border'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-32 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[43%] bg-primary" />
                      </div>
                      <span>43%</span>
                    </div>
                    <button className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1">
                      Continue <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="hidden md:block p-8 bg-gradient-to-br from-primary/5 via-transparent to-accent-violet/5 relative">
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                      Live preview · analytics
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Tile label="Views" value="1,284" />
                      <Tile label="Submitted" value="892" />
                      <Tile label="Completion" value="69%" />
                      <Tile label="Avg time" value="2m 14s" />
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="text-[10px] uppercase text-muted-foreground mb-2">Daily responses</div>
                      <svg viewBox="0 0 200 60" className="w-full h-16">
                        <path
                          d="M0,40 L20,30 L40,35 L60,20 L80,25 L100,15 L120,22 L140,10 L160,18 L180,8 L200,15"
                          fill="none"
                          stroke="#D7263D"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO FEATURES */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <Badge variant="outline" className="mb-3">What you get</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Everything in one stack
          </h2>
          <p className="mt-4 text-muted-foreground">
            A monorepo built the way you&apos;d ship a real product. No microservice cosplay, no half-finished primitives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-[180px]">
          {/* Big feature: themed presets */}
          <div className="md:col-span-2 md:row-span-2 rounded-2xl border border-border bg-surface p-6 md:p-8 overflow-hidden relative group transition-all hover:border-foreground/20">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="relative">
              <Palette className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-display text-2xl font-bold mb-2">19 themed presets</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Mumbai Monsoon, Kyoto Sakura, Diwali Festival, Windows 95, Deep Forest. Pick one in a click;
                override every token if you must.
              </p>
              <div className="grid grid-cols-5 gap-2 max-w-md">
                {[
                  ['#1B2430', '#F58A1F'],
                  ['#FFF1E6', '#D63384'],
                  ['#1A0B2E', '#F2B134'],
                  ['#0F0A1E', '#FF2D95'],
                  ['#008080', '#FFFF00'],
                  ['#0E1A14', '#7CB342'],
                  ['#FBF3E8', '#C2410C'],
                  ['#F0F6FA', '#0EA5E9'],
                  ['#FFF7F8', '#E68AA8'],
                  ['#FFFCF5', '#E84A8C'],
                ].map(([bg, accent], i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg border border-border/50 p-2 flex items-end transition-transform group-hover:-translate-y-0.5"
                    style={{ background: bg, transitionDelay: `${i * 30}ms` }}
                  >
                    <span className="h-1.5 w-4 rounded-full" style={{ background: accent }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <BentoCard
            icon={<Layers className="h-5 w-5 text-accent-teal" />}
            title="25+ field types"
            text="Contact, choice, rating, signature, payment, scheduler."
          />
          <BentoCard
            icon={<BarChart3 className="h-5 w-5 text-accent-violet" />}
            title="Real analytics"
            text="Views, drop-off, per-field stats, CSV export."
          />

          <BentoCard
            icon={<Workflow className="h-5 w-5 text-accent-lime" />}
            title="Type-safe end-to-end"
            text="tRPC v11 + Zod. One schema, both sides."
            className="md:col-span-1"
          />
          <BentoCard
            icon={<Lock className="h-5 w-5 text-primary" />}
            title="Auth, done right"
            text="HTTP-only cookies, server-side revocation, rate limits."
          />
          <BentoCard
            icon={<Code2 className="h-5 w-5 text-accent-amber" />}
            title="Scalar API docs"
            text="Open at /docs on the API server. Read the OpenAPI spec, copy curl snippets."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-10 md:p-20 text-center">
          <div className="absolute inset-0 grid-bg opacity-[0.04]" />
          <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-accent-violet/20 blur-3xl" />
          <div className="relative">
            <Zap className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Ready when the judges are.
            </h2>
            <p className="mt-4 max-w-xl mx-auto opacity-80">
              Seeded with three themed sample forms, real responses, real analytics. Spin it up locally in two commands.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="secondary" asChild className="rounded-full">
                <Link href="/auth/sign-in">Use demo account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full border-background/30 text-background hover:bg-background hover:text-foreground"
              >
                <Link href="/explore">
                  See live forms <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function BentoCard({
  icon,
  title,
  text,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 transition-all hover:border-foreground/20 hover:-translate-y-0.5 ${className ?? ''}`}
    >
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted mb-3">{icon}</div>
      <h3 className="font-display font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="font-display font-semibold text-sm">{value}</div>
    </div>
  );
}
