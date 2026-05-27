'use client';

import {
  ArrowUpRight,
  Award,
  BarChart3,
  Briefcase,
  Eye,
  FileText,
  Layout,
  MessageSquare,
  MoreVertical,
  Plus,
  Share2,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

const PASTEL = ['mint', 'peach', 'lavender', 'butter'] as const;
type Pastel = (typeof PASTEL)[number];

const TEMPLATE_ICON: Record<string, React.ReactNode> = {
  feedback: <MessageSquare className="h-4 w-4" />,
  registration: <FileText className="h-4 w-4" />,
  job_app: <Briefcase className="h-4 w-4" />,
  survey: <BarChart3 className="h-4 w-4" />,
  default: <FileText className="h-4 w-4" />,
};

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString();
}

export default function DashboardPage() {
  const workspaceId = useAuthStore((s) => s.workspaceId);
  const user = useAuthStore((s) => s.user);

  const stats = trpc.forms.workspaceStats.useQuery(
    { workspaceId: workspaceId ?? '' },
    { enabled: !!workspaceId },
  );
  const forms = trpc.forms.listMine.useQuery(
    { workspaceId: workspaceId ?? '' },
    { enabled: !!workspaceId },
  );
  // FIX: pull real templates instead of a hardcoded list.
  const templates = trpc.templates.list.useQuery();

  const recentForms = (forms.data ?? []).slice(0, 5);
  const popularTemplates = (templates.data ?? []).slice(0, 4);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Greeting + New Form CTA */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-4xl font-bold">
            Hello, {user?.name.split(' ')[0] ?? 'there'}! <span className="inline-block">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            Here&apos;s what&apos;s happening with your forms today.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/dashboard/forms/new">
            <Plus className="h-4 w-4" /> Create New Form
          </Link>
        </Button>
      </header>

      {/* Stat cards — all real numbers from workspaceStats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard
          color="mint"
          icon={<FileText className="h-5 w-5" />}
          label="Total Forms"
          value={fmt(stats.data?.formCount)}
          sub={`${stats.data?.publishedCount ?? 0} published`}
        />
        <StatCard
          color="peach"
          icon={<Users className="h-5 w-5" />}
          label="Total Responses"
          value={fmt(stats.data?.totalResponses)}
          sub="Across all forms"
        />
        <StatCard
          color="lavender"
          icon={<Eye className="h-5 w-5" />}
          label="Views"
          value={fmt(stats.data?.totalViews)}
          sub={`${fmt(stats.data?.uniqueViews)} unique`}
        />
        <StatCard
          color="butter"
          icon={<Award className="h-5 w-5" />}
          label="Completion Rate"
          value={
            stats.data?.completionRate !== undefined
              ? `${stats.data.completionRate}%`
              : '—'
          }
          sub="Responses ÷ unique views"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
        <section>
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold">Recent Forms</h2>
              <Link href="/dashboard/forms" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>

            {forms.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {forms.data?.length === 0 && (
              <Card className="p-8 text-center border-dashed">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <CardTitle className="mb-1">No forms yet</CardTitle>
                <CardDescription className="mb-5">
                  Get started with a template or build from scratch.
                </CardDescription>
                <Button asChild>
                  <Link href="/dashboard/forms/new">Create your first form</Link>
                </Button>
              </Card>
            )}

            <div className="space-y-2">
              {recentForms.map((f, i) => (
                <Link
                  key={f.id}
                  href={`/dashboard/forms/${f.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group"
                >
                  <div
                    className={`h-11 w-11 rounded-lg grid place-items-center text-foreground/80 bg-pastel-${PASTEL[i % PASTEL.length]}`}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{f.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {f.responseCount} responses
                    </div>
                  </div>
                  <Badge
                    variant={
                      f.status === 'published'
                        ? 'success'
                        : f.status === 'archived'
                          ? 'warning'
                          : 'secondary'
                    }
                    className="hidden sm:inline-flex"
                  >
                    {f.status}
                  </Badge>
                  <button
                    className="p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Explore Templates banner — the big number now reflects real data */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-3">
            <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base mb-1">Explore Templates</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Professionally designed templates for every need.
                </p>
                <Button size="sm" variant="outline" asChild className="rounded-lg">
                  <Link href="/templates">
                    Browse Templates <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
              <div className="hidden sm:block text-foreground/80">
                <TemplateDoodle />
              </div>
            </div>
            <div className="bg-pastel-mint border border-border rounded-2xl p-5 flex flex-col justify-center">
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {fmt(stats.data?.totalResponses)}
              </div>
              <p className="text-sm text-foreground/80 italic">
                Responses collected — the best forms feel like a conversation.
              </p>
            </div>
          </div>
        </section>

        {/* Sidebar column */}
        <aside className="space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <h3 className="font-display font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAction icon={<Plus className="h-4 w-4" />} label="Create New Form" href="/dashboard/forms/new" color="mint" />
              <QuickAction icon={<Layout className="h-4 w-4" />} label="Use Template" href="/templates" color="peach" />
              <QuickAction icon={<Upload className="h-4 w-4" />} label="Import Form" href="/dashboard/forms/new" color="lavender" />
              <QuickAction icon={<Share2 className="h-4 w-4" />} label="Share Your Form" href="/dashboard/forms" color="butter" />
            </div>
          </div>

          {/* Popular Templates: real data from templates.list */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">Popular Templates</h3>
              <Link href="/templates" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {templates.isLoading && (
                <div className="text-xs text-muted-foreground">Loading…</div>
              )}
              {!templates.isLoading && popularTemplates.length === 0 && (
                <div className="text-xs text-muted-foreground">No templates available.</div>
              )}
              {popularTemplates.map((t, i) => (
                <PopularItem
                  key={t.id}
                  href={`/templates#${t.slug}`}
                  icon={TEMPLATE_ICON[t.category] ?? TEMPLATE_ICON.default}
                  label={t.title}
                  color={PASTEL[i % PASTEL.length]}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── components ─── */

function StatCard({
  color,
  icon,
  label,
  value,
  sub,
}: {
  color: Pastel;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  const bg = {
    mint: 'bg-pastel-mint',
    peach: 'bg-pastel-peach',
    lavender: 'bg-pastel-lavender',
    butter: 'bg-pastel-butter',
  }[color];
  return (
    <div className={`${bg} rounded-2xl border border-border p-4 md:p-5`}>
      <div className="text-foreground/70 mb-3">{icon}</div>
      <div className="text-xs text-foreground/70 mb-1">{label}</div>
      <div className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-foreground/60 font-medium">{sub}</div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: Pastel;
}) {
  const bg = {
    mint: 'bg-pastel-mint',
    peach: 'bg-pastel-peach',
    lavender: 'bg-pastel-lavender',
    butter: 'bg-pastel-butter',
  }[color];
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors"
    >
      <div className={`${bg} h-9 w-9 rounded-lg grid place-items-center text-foreground/80`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function PopularItem({
  icon,
  label,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  color: Pastel;
  href: string;
}) {
  const bg = {
    mint: 'bg-pastel-mint',
    peach: 'bg-pastel-peach',
    lavender: 'bg-pastel-lavender',
    butter: 'bg-pastel-butter',
  }[color];
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors"
    >
      <div className={`${bg} h-9 w-9 rounded-lg grid place-items-center text-foreground/80`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function TemplateDoodle() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
      <rect x="6" y="14" width="36" height="44" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="6" width="36" height="44" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
      <path d="M22 18 L40 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 26 L36 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 34 L40 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}