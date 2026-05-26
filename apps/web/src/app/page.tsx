'use client';

import { ArrowRight, Globe, Lock, Pencil, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col paper-bg">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-16 md:pb-24">
        <div className="container mx-auto px-4 relative">
          {/* Floating doodles in the background */}
          <div className="hidden md:block absolute -top-4 left-8 opacity-40 animate-float-y">
            <CornerStamp />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* LEFT: copy + CTA */}
            <div className="relative">
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                Create forms.
                <br />
                Collect{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-accent-violet">stories</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-accent-violet/60"
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
                .
              </h1>

              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                Design beautiful forms, collect responses, and turn data into meaningful
                experiences.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Link href="/auth/sign-up">
                    Create Your First Form <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-xl">
                  <Link href="/explore">
                    Explore Templates <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT: animated stamp illustration */}
            <div className="relative flex items-center justify-center min-h-[360px]">
              <AnimatedStamp />
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP */}
      <section className="container mx-auto px-4 pb-12 md:pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatStamp value="20K+" label="Forms Created" color="mint" icon={<Pencil className="h-5 w-5" />} />
          <StatStamp value="15K+" label="Happy Users" color="peach" icon={<TrendingUp className="h-5 w-5" />} />
          <StatStamp value="500+" label="Templates" color="lavender" icon={<Globe className="h-5 w-5" />} />
          <StatStamp value="99.9%" label="Uptime" color="butter" icon={<Lock className="h-5 w-5" />} />
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Everything you need to create
          </h2>
          <svg className="mx-auto mt-2 w-44 h-3 text-accent-amber/70" viewBox="0 0 100 12" preserveAspectRatio="none">
            <path d="M0,8 Q25,2 50,6 T100,4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            doodle={<DoodlePencil />}
            title="Easy to Create"
            text="Build forms in minutes with our simple builder."
            underline="#10B981"
          />
          <FeatureCard
            doodle={<DoodleGlobe />}
            title="Collect Anywhere"
            text="Share forms anywhere and collect responses effortlessly."
            underline="#F59E0B"
          />
          <FeatureCard
            doodle={<DoodleChart />}
            title="Powerful Insights"
            text="Turn responses into actionable insights instantly."
            underline="#8B5CF6"
          />
          <FeatureCard
            doodle={<DoodleLock />}
            title="Secure & Reliable"
            text="Your data is safe with enterprise-grade security."
            underline="#06B6D4"
          />
        </div>
      </section>

      {/* JOIN CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-accent-violet/15 dark:bg-accent-violet/10 p-6 md:p-10 border border-accent-violet/20">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-6">
            <div className="hidden md:block">
              <DoodleEnvelope />
            </div>
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold">Join thousands of creators</h3>
              <p className="text-muted-foreground mt-1">Start your journey with FormStack today.</p>
            </div>
            <Button size="lg" asChild className="rounded-xl">
              <Link href="/auth/sign-up">
                Start Creating Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED STAMP (the centerpiece of the hero)
   ───────────────────────────────────────────────────────────── */
function AnimatedStamp() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square">
      {/* Flowing dashed line around the stamp */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 50 200 Q 50 50, 200 50 Q 350 50, 350 200 Q 350 350, 200 350 Q 50 350, 50 200 Z"
          stroke="hsl(var(--fg) / 0.35)"
          strokeWidth="2"
          strokeDasharray="6 8"
          strokeLinecap="round"
          fill="none"
          className="animate-stamp-flow"
        />
      </svg>

      {/* Paper plane that loops */}
      <div className="absolute top-6 right-10 text-accent-violet animate-plane-loop">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
        </svg>
      </div>

      {/* The stamp itself */}
      <div className="absolute inset-10 flex items-center justify-center animate-stamp-wobble">
        <div className="relative w-full h-full bg-surface border-[3px] border-dashed border-foreground rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl">
          {/* Sun */}
          <div className="absolute top-6 right-8 h-8 w-8 rounded-full bg-amber-400" />
          {/* Cloud */}
          <svg className="absolute top-8 left-6 text-foreground" width="56" height="24" viewBox="0 0 56 24" fill="none">
            <path
              d="M8 16 Q4 16 4 12 Q4 8 8 8 Q10 4 16 4 Q22 4 24 8 Q28 8 28 12 Q28 16 24 16 Z"
              stroke="currentColor" strokeWidth="1.5" fill="none"
            />
            <path
              d="M30 18 Q26 18 26 14 Q28 10 32 10 Q34 6 40 6 Q46 6 48 10 Q52 10 52 14 Q52 18 48 18 Z"
              stroke="currentColor" strokeWidth="1.5" fill="none"
            />
          </svg>

          {/* Person waving */}
          <svg className="text-foreground mt-6" width="140" height="160" viewBox="0 0 140 160" fill="none">
            {/* Head */}
            <circle cx="70" cy="38" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
            {/* Hair */}
            <path d="M52 28 Q60 16 70 18 Q82 18 88 28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="62" cy="38" r="1.5" fill="currentColor" />
            <circle cx="78" cy="38" r="1.5" fill="currentColor" />
            {/* Smile */}
            <path d="M64 46 Q70 50 76 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Body */}
            <path
              d="M50 70 Q50 64 56 62 L84 62 Q90 64 90 70 L90 120 L50 120 Z"
              stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"
            />
            {/* Waving arm */}
            <path d="M50 70 L30 50 L32 38" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Hand */}
            <circle cx="32" cy="36" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
            {/* Other arm */}
            <path d="M90 70 L100 100" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Mountains in bg */}
            <path d="M50 120 L70 95 L90 120 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>

          {/* "Made for creators" circular badge */}
          <div className="absolute -bottom-6 -right-4 w-24 h-24 rounded-full border-2 border-dashed border-foreground bg-surface flex items-center justify-center animate-stamp-spin">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <path id="circle-text" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
              </defs>
              <text className="fill-foreground font-display text-[10px] tracking-widest font-bold">
                <textPath href="#circle-text">MADE FOR CREATORS · MADE FOR CREATORS · </textPath>
              </text>
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Doodle illustrations for the feature cards
   ───────────────────────────────────────────────────────────── */
function CornerStamp() {
  return (
    <svg width="110" height="140" viewBox="0 0 110 140" fill="none" className="text-foreground">
      <rect x="6" y="6" width="98" height="128" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="55" cy="55" r="20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <text x="55" y="95" textAnchor="middle" className="fill-current font-display text-[9px] tracking-widest">
        FORMS
      </text>
      <text x="55" y="108" textAnchor="middle" className="fill-current font-display text-[9px] tracking-widest">
        THAT
      </text>
      <text x="55" y="121" textAnchor="middle" className="fill-current font-display text-[9px] tracking-widest">
        CONNECT
      </text>
    </svg>
  );
}

function DoodlePencil() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" className="text-foreground">
      <path d="M14 60 L52 22 L62 32 L24 70 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M52 22 L58 16 L68 26 L62 32" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 60 L20 74" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="68" cy="14" r="2" fill="currentColor" />
      <circle cx="12" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function DoodleGlobe() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" className="text-foreground">
      <circle cx="40" cy="40" r="22" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="40" cy="40" rx="10" ry="22" stroke="currentColor" strokeWidth="2" />
      <path d="M18 40 L62 40" stroke="currentColor" strokeWidth="2" />
      <path d="M22 28 L58 28" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 52 L58 52" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="22" r="4" fill="#EF4444" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DoodleChart() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" className="text-foreground">
      <path d="M10 70 L70 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="18" y="48" width="10" height="22" stroke="currentColor" strokeWidth="2" />
      <rect x="34" y="36" width="10" height="34" stroke="currentColor" strokeWidth="2" fill="#F59E0B" fillOpacity="0.3" />
      <rect x="50" y="22" width="10" height="48" stroke="currentColor" strokeWidth="2" fill="#EF4444" fillOpacity="0.3" />
      <path d="M16 42 L34 30 L50 20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="20" r="3" fill="#EF4444" />
    </svg>
  );
}

function DoodleLock() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" className="text-foreground">
      <rect x="18" y="36" width="44" height="32" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M26 36 L26 26 Q26 14 40 14 Q54 14 54 26 L54 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="50" r="3" fill="currentColor" />
      <path d="M40 53 L40 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DoodleEnvelope() {
  return (
    <svg viewBox="0 0 120 80" width="120" height="80" fill="none" className="text-foreground">
      <rect x="8" y="20" width="80" height="50" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 24 L48 50 L88 24" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M92 14 Q104 8 116 14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M96 30 Q108 24 116 30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Stat & feature card components
   ───────────────────────────────────────────────────────────── */
function StatStamp({
  value,
  label,
  color,
  icon,
}: {
  value: string;
  label: string;
  color: 'mint' | 'peach' | 'lavender' | 'butter';
  icon: React.ReactNode;
}) {
  const bg = {
    mint: 'bg-pastel-mint',
    peach: 'bg-pastel-peach',
    lavender: 'bg-pastel-lavender',
    butter: 'bg-pastel-butter',
  }[color];
  return (
    <div
      className={`${bg} rounded-xl border-2 border-dashed border-foreground/40 p-4 md:p-5 flex items-center gap-4 transition-transform hover:-translate-y-0.5`}
    >
      <div className="text-foreground/80 flex-shrink-0">{icon}</div>
      <div>
        <div className="font-display text-2xl md:text-3xl font-bold text-foreground">{value}</div>
        <div className="text-xs md:text-sm text-foreground/70">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  doodle,
  title,
  text,
  underline,
}: {
  doodle: React.ReactNode;
  title: string;
  text: string;
  underline: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 transition-all hover:border-foreground/30 hover:-translate-y-0.5">
      <div className="mb-4">{doodle}</div>
      <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{text}</p>
      <svg className="w-16 h-2" viewBox="0 0 64 8" preserveAspectRatio="none">
        <path
          d="M0,4 Q16,0 32,4 T64,4"
          stroke={underline}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}