'use client';

import {
  AlignLeft,
  ArrowLeft,
  CheckSquare,
  ChevronUp,
  ChevronDown,
  Copy,
  ExternalLink,
  GripVertical,
  Hash,
  ListChecks,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Star,
  Sparkles,
  Send,
  ToggleRight,
  Trash2,
  Type,
  Calendar,
  Globe,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { FIELD_KIND_META, type FieldKind } from '@formstack/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { trpc } from '@/lib/trpc';

const ICONS: Partial<Record<FieldKind, React.ComponentType<{ className?: string }>>> = {
  short_text: Type,
  long_text: AlignLeft,
  email: Mail,
  phone: Phone,
  address: MapPin,
  website: Globe,
  single_select: ListChecks,
  multi_select: CheckSquare,
  dropdown: ListChecks,
  yes_no: ToggleRight,
  rating: Star,
  opinion_scale: Hash,
  number: Hash,
  date: Calendar,
  checkbox: CheckSquare,
  statement: Sparkles,
  welcome_screen: Sparkles,
};

const PALETTE_GROUPS: { title: string; kinds: FieldKind[] }[] = [
  { title: 'Contact', kinds: ['short_text', 'long_text', 'email', 'phone', 'address', 'website'] },
  { title: 'Choice', kinds: ['single_select', 'multi_select', 'dropdown', 'yes_no', 'checkbox'] },
  { title: 'Rating', kinds: ['rating', 'opinion_scale'] },
  { title: 'Data', kinds: ['number', 'date'] },
  { title: 'Other', kinds: ['statement', 'welcome_screen', 'signature', 'file_upload'] },
];

interface BuilderField {
  id: string;
  kind: FieldKind;
  label: string;
  description?: string;
  required: boolean;
  hidden: boolean;
  conditional: null;
  config: Record<string, unknown>;
}

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const formId = params.id;

  const formQuery = trpc.forms.get.useQuery({ id: formId }, { enabled: !!formId });
  const themesQuery = trpc.themes.list.useQuery();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [themeId, setThemeId] = useState('crimson-default');
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const f = formQuery.data;
    if (!f) return;
    setTitle(f.title);
    setDescription(f.description ?? '');
    setThemeId(f.themeId);
    setFields((f.fields as BuilderField[]) ?? []);
    setSelectedId(((f.fields as BuilderField[])?.[0]?.id) ?? null);
    setDirty(false);
  }, [formQuery.data]);

  const update = trpc.forms.update.useMutation({
    onSuccess: () => {
      toast.success('Saved');
      setDirty(false);
      utils.forms.get.invalidate({ id: formId });
      utils.forms.listMine.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const publish = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success('Form published');
      utils.forms.get.invalidate({ id: formId });
    },
    onError: (e) => toast.error(e.message),
  });

  const unpublish = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success('Form moved to draft');
      utils.forms.get.invalidate({ id: formId });
    },
  });

  const clone = trpc.forms.clone.useMutation({
    onSuccess: (f) => {
      toast.success('Form duplicated');
      router.push(`/dashboard/forms/${f.id}`);
    },
  });

  const selectedField = useMemo(
    () => fields.find((f) => f.id === selectedId) ?? null,
    [fields, selectedId],
  );

  const addField = (kind: FieldKind) => {
    const meta = FIELD_KIND_META[kind];
    const id = crypto.randomUUID();
    const newField: BuilderField = {
      id,
      kind,
      label: meta.label,
      required: false,
      hidden: false,
      conditional: null,
      config: meta.defaultConfig(),
    };
    setFields((prev) => [...prev, newField]);
    setSelectedId(id);
    setDirty(true);
  };

  const updateField = (id: string, patch: Partial<BuilderField>) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, ...patch, config: { ...f.config, ...((patch.config as Record<string, unknown>) ?? {}) } }
          : f,
      ),
    );
    setDirty(true);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDirty(true);
  };

  const moveField = (id: string, dir: -1 | 1) => {
    setFields((prev) => {
      const i = prev.findIndex((f) => f.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
    setDirty(true);
  };

  const onSave = () => {
    update.mutate({
      id: formId,
      title,
      description: description || undefined,
      themeId,
      fields: fields as any,
    });
  };

  const onPublish = () => {
    if (fields.length === 0) {
      toast.error('Add at least one field before publishing.');
      return;
    }
    if (dirty) {
      toast.error('Save your changes first.');
      return;
    }
    publish.mutate({ id: formId, visibility: 'public' });
  };

  if (formQuery.isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading form…</div>;
  }
  if (!formQuery.data) {
    return <div className="p-10 text-sm text-muted-foreground">Form not found.</div>;
  }
  const form = formQuery.data;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="h-14 border-b border-border bg-surface flex items-center px-4 gap-3 flex-shrink-0">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          className="bg-transparent font-display font-semibold text-base min-w-0 flex-1 focus:outline-none border-b border-transparent focus:border-border"
          placeholder="Untitled form"
        />
        <Badge variant={form.status === 'published' ? 'success' : form.status === 'archived' ? 'warning' : 'secondary'}>
          {form.status}
        </Badge>
        {dirty && <Badge variant="warning">unsaved</Badge>}

        <div className="ml-auto flex items-center gap-2">
          {form.status === 'published' && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/f/${form.slug}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" /> View
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/responses`}>Responses</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/analytics`}>Analytics</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => clone.mutate({ id: formId })}>
            <Copy className="h-3.5 w-3.5" /> Clone
          </Button>
          <Button variant="outline" size="sm" onClick={onSave} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
          {form.status === 'published' ? (
            <Button variant="destructive" size="sm" onClick={() => unpublish.mutate({ id: formId })}>
              Unpublish
            </Button>
          ) : (
            <Button size="sm" onClick={onPublish} disabled={publish.isPending}>
              <Send className="h-3.5 w-3.5" /> Publish
            </Button>
          )}
        </div>
      </div>

      {/* Three-pane workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_340px] overflow-hidden">
        {/* CANVAS — wider now that the palette moved into the right tabs */}
        <div className="overflow-y-auto scrollbar-thin bg-background">
          <div className="max-w-2xl mx-auto p-6 md:p-10">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              className="font-display text-3xl font-bold w-full bg-transparent border-none focus:outline-none mb-2"
              placeholder="Untitled form"
            />
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDirty(true);
              }}
              rows={2}
              className="w-full bg-transparent border-none focus:outline-none text-muted-foreground resize-none mb-8"
              placeholder="Add a description…"
            />

            <div className="space-y-3">
              {fields.length === 0 && (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-border rounded-lg">
                  <Plus className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Pick a field from the left to start.</p>
                </div>
              )}
              {fields.map((f, i) => {
                const meta = FIELD_KIND_META[f.kind];
                const Icon = ICONS[f.kind] ?? Type;
                const sel = f.id === selectedId;
                return (
                  <Card
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      sel ? 'border-primary ring-2 ring-primary/20' : 'hover:border-foreground/30',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            {meta.label}
                          </span>
                          {f.required && <Badge variant="outline" className="text-[10px] py-0">required</Badge>}
                        </div>
                        <div className="font-medium text-sm">{f.label || <span className="text-muted-foreground italic">Untitled</span>}</div>
                        {f.description && <div className="text-xs text-muted-foreground mt-0.5">{f.description}</div>}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(f.id, -1);
                          }}
                          disabled={i === 0}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(f.id, 1);
                          }}
                          disabled={i === fields.length - 1}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(f.id);
                          }}
                          className="p-1 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT RAIL — tabbed: Add field / Configure */}
        <aside className="border-l border-border bg-surface overflow-hidden flex flex-col">
          <RightRail
            paletteGroups={PALETTE_GROUPS}
            icons={ICONS}
            onAddField={addField}
            selectedField={selectedField}
            updateField={(patch) => selectedField && updateField(selectedField.id, patch)}
            onCloseSelected={() => setSelectedId(null)}
            themeId={themeId}
            themes={themesQuery.data ?? []}
            onThemeChange={(id) => {
              setThemeId(id);
              setDirty(true);
            }}
            form={form}
          />
        </aside>
      </div>
    </div>
  );
}

interface RightRailProps {
  paletteGroups: { title: string; kinds: FieldKind[] }[];
  icons: Partial<Record<FieldKind, React.ComponentType<{ className?: string }>>>;
  onAddField: (k: FieldKind) => void;
  selectedField: BuilderField | null;
  updateField: (patch: Partial<BuilderField>) => void;
  onCloseSelected: () => void;
  themeId: string;
  themes: { id: string; name?: string; tokens: Record<string, string> }[];
  onThemeChange: (id: string) => void;
  form: { id: string; slug: string; status: string; visibility: string };
}

function RightRail(props: RightRailProps) {
  const { paletteGroups, icons, onAddField, selectedField } = props;
  const [tab, setTab] = useState<'add' | 'config'>(selectedField ? 'config' : 'add');

  // Auto-switch to configure when a field is selected
  useEffect(() => {
    if (selectedField) setTab('config');
  }, [selectedField?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="border-b border-border p-2 flex gap-1">
        <TabButton active={tab === 'add'} onClick={() => setTab('add')}>
          Add field
        </TabButton>
        <TabButton active={tab === 'config'} onClick={() => setTab('config')}>
          {selectedField ? 'Configure' : 'Form settings'}
        </TabButton>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'add' && (
          <div className="p-3">
            {paletteGroups.map((g) => (
              <div key={g.title} className="mb-4">
                <div className="text-[11px] text-muted-foreground px-1 mb-1.5 uppercase tracking-wider">
                  {g.title}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {g.kinds.map((k) => {
                    const meta = FIELD_KIND_META[k];
                    const Icon = icons[k] ?? Type;
                    return (
                      <button
                        key={k}
                        onClick={() => onAddField(k)}
                        className="flex items-center gap-2 p-2 rounded-md border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'config' && (
          <>
            {selectedField ? (
              <FieldConfigPanel
                field={selectedField}
                onChange={props.updateField}
                onClose={props.onCloseSelected}
              />
            ) : (
              <FormSettingsPanel
                themeId={props.themeId}
                themes={props.themes}
                onThemeChange={props.onThemeChange}
                form={props.form}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

/* -------------------- Field config -------------------- */

function FieldConfigPanel({
  field,
  onChange,
  onClose,
}: {
  field: BuilderField;
  onChange: (patch: Partial<BuilderField>) => void;
  onClose: () => void;
}) {
  const hasOptions = ['single_select', 'multi_select', 'dropdown', 'picture_choice', 'ranking'].includes(
    field.kind,
  );
  const options = (field.config?.options as string[] | undefined) ?? [];

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Field settings
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <Label>Label</Label>
        <Input value={field.label} onChange={(e) => onChange({ label: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Help text</Label>
        <Textarea
          rows={2}
          value={field.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Shown beneath the label"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="accent-primary"
          checked={field.required}
          onChange={(e) => onChange({ required: e.target.checked })}
        />
        Required
      </label>

      {hasOptions && (
        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-1">
              <Input
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  onChange({ config: { ...field.config, options: next } });
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  const next = options.filter((_, j) => j !== i);
                  onChange({ config: { ...field.config, options: next } });
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() =>
              onChange({ config: { ...field.config, options: [...options, `Option ${options.length + 1}`] } })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add option
          </Button>
        </div>
      )}

      {field.kind === 'rating' && (
        <div className="space-y-2">
          <Label>Scale max ({(field.config?.max as number) ?? 5})</Label>
          <input
            type="range"
            min={3}
            max={10}
            value={(field.config?.max as number) ?? 5}
            onChange={(e) => onChange({ config: { ...field.config, max: Number(e.target.value) } })}
            className="w-full accent-primary"
          />
        </div>
      )}

      {(field.kind === 'short_text' || field.kind === 'long_text' || field.kind === 'email' || field.kind === 'phone' || field.kind === 'website') && (
        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={(field.config?.placeholder as string) ?? ''}
            onChange={(e) => onChange({ config: { ...field.config, placeholder: e.target.value } })}
          />
        </div>
      )}
    </div>
  );
}

function FormSettingsPanel({
  themeId,
  themes,
  onThemeChange,
  form,
}: {
  themeId: string;
  themes: { id: string; name: string; tokens: Record<string, string> }[];
  onThemeChange: (id: string) => void;
  form: { id: string; slug: string; status: string; visibility: string };
}) {
  return (
    <div className="p-4 space-y-5">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Form settings</div>

      <div className="space-y-2">
        <Label>Theme</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={cn(
                'text-left p-2 rounded-md border text-xs',
                themeId === t.id ? 'border-primary ring-2 ring-primary/30' : 'border-border',
              )}
              style={{ background: t.tokens.background, color: t.tokens.foreground }}
            >
              <div className="font-medium">{t.name}</div>
              <div className="mt-1 h-1 w-5 rounded-full" style={{ background: t.tokens.primary }} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Public link</div>
        <Input value={`/f/${form.slug}`} readOnly className="text-xs font-mono" />
        <p className="text-[11px] text-muted-foreground">
          Public after publishing. Unlisted forms are reachable only via this link.
        </p>
      </div>
    </div>
  );
}
