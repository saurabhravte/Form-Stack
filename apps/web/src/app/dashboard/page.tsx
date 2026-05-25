'use client';

import { ArrowUpRight, BarChart3, Eye, FileText, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

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

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Welcome back, {user?.name.split(' ')[0] ?? 'there'}.
          </h1>
          <p className="text-muted-foreground mt-1.5">Here&apos;s how your workspace is doing today.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="h-4 w-4" /> New form
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard
          icon={<FileText className="h-4 w-4 text-primary" />}
          label="Total forms"
          value={stats.data?.formCount ?? '—'}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-accent-lime" />}
          label="Published"
          value={stats.data?.publishedCount ?? '—'}
        />
        <StatCard
          icon={<Eye className="h-4 w-4 text-accent-teal" />}
          label="Total responses"
          value={stats.data?.totalResponses ?? '—'}
        />
        <StatCard
          icon={<BarChart3 className="h-4 w-4 text-accent-violet" />}
          label="Plan"
          value={<span className="capitalize">Pro</span>}
        />
      </div>

      <section className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Your forms</h2>
          <p className="text-sm text-muted-foreground">Drafts, published, and archived.</p>
        </div>
      </section>

      {forms.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {forms.data?.length === 0 && (
        <Card className="p-10 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <CardTitle className="mb-1">No forms yet</CardTitle>
          <CardDescription className="mb-5">Get started with a template or build from scratch.</CardDescription>
          <Button asChild>
            <Link href="/dashboard/forms/new">Create your first form</Link>
          </Button>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.data?.map((f) => (
          <Link key={f.id} href={`/dashboard/forms/${f.id}`} className="group">
            <Card className="h-full p-5 hover:border-foreground/30 transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={f.status === 'published' ? 'success' : f.status === 'archived' ? 'warning' : 'secondary'}>
                  {f.status}
                </Badge>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="font-display font-semibold mb-1 line-clamp-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
                {f.description || '— no description —'}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {f.responseCount} responses
                </span>
                <span className="capitalize">{f.visibility}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-display font-bold">{value}</div>
    </Card>
  );
}
