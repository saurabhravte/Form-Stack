'use client';

import { ArrowLeft, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

export default function ResponsesPage() {
  const { id: formId } = useParams<{ id: string }>();
  const [expanded, setExpanded] = useState<string | null>(null);

  const form = trpc.forms.get.useQuery({ id: formId });
  const responses = trpc.responses.listForForm.useQuery({ formId });
  const utils = trpc.useUtils();

  const exportCsv = async () => {
    try {
      const csv = await utils.analytics.exportCsv.fetch({ formId });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.data?.slug ?? 'responses'}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (e) {
      toast.error('Export failed');
    }
  };

  const fields = (form.data?.fields as Array<{ id: string; label: string }> | undefined) ?? [];
  const fieldMap = new Map(fields.map((f) => [f.id, f.label]));

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <Link href={`/dashboard/forms/${formId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to builder
      </Link>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Responses</h1>
          <p className="text-muted-foreground mt-1">
            {form.data?.title ?? 'Loading…'} ·{' '}
            <span className="font-medium text-foreground">{responses.data?.items.length ?? 0}</span> shown
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/forms/${formId}/analytics`}>View analytics</Link>
          </Button>
          <Button onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {responses.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading responses…
        </div>
      )}

      {responses.data?.items.length === 0 && (
        <Card className="p-10 text-center">
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold mb-1">No responses yet</h3>
          <p className="text-sm text-muted-foreground">
            Share your form link to start collecting answers.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {responses.data?.items.map((r) => {
          const isOpen = expanded === r.id;
          const answers = (r.answers as { fieldId: string; value: unknown }[]) ?? [];
          return (
            <Card key={r.id} className="overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-medium font-mono">{r.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{answers.length} answers</Badge>
                </div>
              </button>
              {isOpen && (
                <div className="px-5 py-4 border-t border-border bg-muted/30 animate-fade-in">
                  <dl className="space-y-3">
                    {answers.map((a, i) => (
                      <div key={i}>
                        <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                          {fieldMap.get(a.fieldId) ?? a.fieldId}
                        </dt>
                        <dd className="text-sm">{formatValue(a.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
