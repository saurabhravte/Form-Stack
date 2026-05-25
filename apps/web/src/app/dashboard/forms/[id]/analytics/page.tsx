'use client';

import { ArrowLeft, BarChart3, Clock, Eye, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

export default function AnalyticsPage() {
  const { id: formId } = useParams<{ id: string }>();

  const form = trpc.forms.get.useQuery({ id: formId });
  const overview = trpc.analytics.overview.useQuery({ formId });
  const daily = trpc.analytics.dailyResponses.useQuery({ formId, days: 30 });
  const fieldComp = trpc.analytics.fieldCompletion.useQuery({ formId });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <Link
        href={`/dashboard/forms/${formId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to builder
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">{form.data?.title ?? 'Loading…'}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat
          icon={<Eye className="h-4 w-4 text-accent-teal" />}
          label="Total views"
          value={overview.data?.totalViews ?? '—'}
        />
        <Stat
          icon={<Users className="h-4 w-4 text-accent-violet" />}
          label="Unique visitors"
          value={overview.data?.uniqueViews ?? '—'}
        />
        <Stat
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          label="Completion rate"
          value={overview.data ? `${overview.data.completionRate}%` : '—'}
        />
        <Stat
          icon={<Clock className="h-4 w-4 text-accent-amber" />}
          label="Avg time"
          value={
            overview.data
              ? `${Math.round((overview.data.avgDurationMs ?? 0) / 1000)}s`
              : '—'
          }
        />
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold">Responses over time</h3>
          <span className="text-xs text-muted-foreground">last 30 days</span>
        </div>
        <div className="h-64">
          {daily.data && daily.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bucket" stroke="hsl(var(--muted-fg))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-fg))" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--surface))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#D7263D"
                  strokeWidth={2}
                  dot={{ fill: '#D7263D', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">
              No data yet
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-accent-violet" />
          <h3 className="font-display font-semibold">Per-field completion</h3>
          <span className="text-xs text-muted-foreground">where people drop off</span>
        </div>
        <div className="h-72">
          {fieldComp.data && fieldComp.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldComp.data} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-fg))" fontSize={11} domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="hsl(var(--muted-fg))"
                  fontSize={11}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--surface))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, 'Completion']}
                />
                <Bar dataKey="rate" fill="#D7263D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">
              No data yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
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
