'use client';

import { ArrowUpRight, Eye, FileText, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

const FILTERS = ['all', 'draft', 'published', 'archived'] as const;
type Filter = (typeof FILTERS)[number];

export default function FormsListPage() {
  const workspaceId = useAuthStore((s) => s.workspaceId);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const forms = trpc.forms.listMine.useQuery(
    { workspaceId: workspaceId ?? '' },
    { enabled: !!workspaceId },
  );

  const filtered = useMemo(() => {
    if (!forms.data) return [];
    return forms.data.filter((f) => {
      if (filter !== 'all' && f.status !== filter) return false;
      if (search && !f.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [forms.data, filter, search]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Forms</h1>
          <p className="text-muted-foreground mt-1">All the forms in your workspace.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="h-4 w-4" /> New form
          </Link>
        </Button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg border border-border bg-surface">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {forms.isLoading && <div className="text-sm text-muted-foreground">Loading forms…</div>}
      {filtered.length === 0 && !forms.isLoading && (
        <Card className="p-10 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold mb-1">No forms match this filter</h3>
          <p className="text-sm text-muted-foreground mb-5">Try a different filter or create a new form.</p>
          <Button asChild>
            <Link href="/dashboard/forms/new">Create form</Link>
          </Button>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((f) => (
          <Link key={f.id} href={`/dashboard/forms/${f.id}`} className="group">
            <Card className="h-full p-5 hover:border-foreground/30 hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <Badge
                  variant={f.status === 'published' ? 'success' : f.status === 'archived' ? 'warning' : 'secondary'}
                >
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
