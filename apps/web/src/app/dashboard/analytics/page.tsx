'use client';

import { BarChart3, Eye, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

export default function WorkspaceAnalyticsPage() {
  const workspaceId = useAuthStore((s) => s.workspaceId);
  const stats = trpc.forms.workspaceStats.useQuery(
    { workspaceId: workspaceId ?? '' },
    { enabled: !!workspaceId },
  );
  const forms = trpc.forms.listMine.useQuery(
    { workspaceId: workspaceId ?? '' },
    { enabled: !!workspaceId },
  );

  const sorted = forms.data
    ? [...forms.data].sort((a, b) => b.responseCount - a.responseCount).slice(0, 10)
    : [];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="font-display text-3xl md:text-4xl font-bold">Analytics</h1>
        </div>
        <p className="text-muted-foreground">A workspace-wide view. Click a form for its detailed breakdown.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
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
          label="Top form responses"
          value={sorted[0]?.responseCount ?? '—'}
        />
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Top forms by responses</h2>
        {sorted.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No data yet. Publish a form and share its link.
          </Card>
        )}
        <div className="space-y-2">
          {sorted.map((f, i) => {
            const maxResponses = sorted[0]?.responseCount ?? 1;
            const pct = maxResponses ? Math.round((f.responseCount / maxResponses) * 100) : 0;
            return (
              <Link
                key={f.id}
                href={`/dashboard/forms/${f.id}/analytics`}
                className="block group"
              >
                <Card className="p-4 hover:border-foreground/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-mono text-muted-foreground w-6">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="font-medium truncate">{f.title}</div>
                        <Badge
                          variant={f.status === 'published' ? 'success' : 'secondary'}
                          className="text-[10px]"
                        >
                          {f.status}
                        </Badge>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-semibold">{f.responseCount}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        responses
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
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
