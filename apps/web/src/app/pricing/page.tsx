'use client';

import { ArrowRight, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { PLAN_LIMITS, PLAN_PRICING, type PlanTier } from '@formstack/shared';

import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';

const FEATURES: Record<PlanTier, string[]> = {
  free: [
    '3 forms',
    '100 responses / mo',
    '1 workspace',
    'All 25+ field types',
    '19 starter themes',
    'CSV export',
  ],
  pro: [
    '50 forms',
    '5,000 responses / mo',
    '3 workspaces',
    'Custom themes',
    'Analytics dashboard',
    'Remove FormStack branding',
    'Email notifications',
  ],
  team: [
    '500 forms',
    '50,000 responses / mo',
    '10 workspaces',
    'Team members + roles',
    'API access',
    'Webhooks',
    'Priority support',
  ],
  enterprise: [
    'Unlimited everything',
    'SSO / SAML',
    'Custom data retention',
    'Dedicated CSM',
    'On-prem available',
    '24/7 SLA',
  ],
};

const ORDER: PlanTier[] = ['free', 'pro', 'team', 'enterprise'];

// USD → INR conversion (approx for a hackathon — round to nice numbers).
const TO_INR: Record<PlanTier, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 1599, yearly: 15990 },
  team: { monthly: 4099, yearly: 40990 },
  enterprise: { monthly: 0, yearly: 0 },
};

const formatINR = (n: number) =>
  '₹' + n.toLocaleString('en-IN');

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [selected, setSelected] = useState<PlanTier>('pro');

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-12 pb-10 text-center">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="h-3 w-3 text-primary" /> Pricing
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Plans that scale with your forms.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
            Free to start. Pay only when your forms start paying you back.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full border border-border bg-surface">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-colors',
                !yearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5',
                yearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              Yearly
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  yearly ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700',
                )}
              >
                −17%
              </span>
            </button>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ORDER.map((tier) => {
              const p = PLAN_PRICING[tier];
              const inr = TO_INR[tier];
              const lim = PLAN_LIMITS[tier];
              const isEnterprise = tier === 'enterprise';
              const price = yearly ? Math.round(inr.yearly / 12) : inr.monthly;
              const active = selected === tier;

              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelected(tier)}
                  className="text-left focus:outline-none"
                >
                  <Card
                    className={cn(
                      'relative p-6 flex flex-col h-full transition-all',
                      active
                        ? 'border-primary ring-2 ring-primary/30 -translate-y-1 shadow-xl shadow-primary/10'
                        : 'hover:border-foreground/30 hover:-translate-y-0.5',
                    )}
                  >
                    {active && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <Badge>Selected</Badge>
                      </div>
                    )}

                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      {p.label}
                    </div>
                    <div className="font-display text-4xl font-bold mb-1 leading-none">
                      {isEnterprise ? 'Custom' : formatINR(price)}
                    </div>
                    <div className="text-xs text-muted-foreground mb-5">
                      {isEnterprise
                        ? 'Annual contract'
                        : tier === 'free'
                        ? 'Forever'
                        : `per month · billed ${yearly ? 'yearly' : 'monthly'}`}
                    </div>

                    <Button
                      asChild
                      variant={active ? 'default' : 'outline'}
                      className="w-full mb-6"
                    >
                      <Link
                        href={isEnterprise ? 'mailto:sales@formstack.dev' : '/auth/sign-up'}
                      >
                        {isEnterprise ? 'Contact sales' : tier === 'free' ? 'Start free' : 'Choose plan'}
                        {!isEnterprise && <ArrowRight className="h-3.5 w-3.5" />}
                      </Link>
                    </Button>

                    <ul className="space-y-2.5 text-sm">
                      {FEATURES[tier].map((feat) => (
                        <li key={feat} className="flex gap-2 items-start">
                          <Check
                            className={cn(
                              'h-4 w-4 mt-0.5 flex-shrink-0',
                              active ? 'text-primary' : 'text-muted-foreground',
                            )}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
                      {Number.isFinite(lim.forms) ? `${lim.forms} forms` : 'Unlimited forms'} ·{' '}
                      {Number.isFinite(lim.responses)
                        ? `${lim.responses.toLocaleString('en-IN')} responses`
                        : 'Unlimited'}
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ['No card required', 'Start free, upgrade only when you outgrow it.'],
              ['Cancel anytime', 'One-click downgrade. Data stays, limits change.'],
              ['No hidden fees', 'No per-seat trickery. No add-on tax.'],
            ].map(([title, body]) => (
              <Card key={title} className="p-5">
                <h4 className="font-display font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> {title}
                </h4>
                <p className="text-sm text-muted-foreground">{body}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
