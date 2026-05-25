'use client';

import type { ChangeEvent } from 'react';
import { Controller, type Control, type FieldError } from 'react-hook-form';

import type { FieldKind } from '@formstack/shared';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';

export interface RenderableField {
  id: string;
  kind: FieldKind;
  label: string;
  helpText?: string;
  required?: boolean;
  config: Record<string, unknown>;
}

interface Props {
  field: RenderableField;
  control: Control<Record<string, unknown>>;
  error?: FieldError;
}

const normOptions = (raw: unknown): { label: string; value: string }[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((o) => {
    if (typeof o === 'string') return { label: o, value: o };
    if (o && typeof o === 'object' && 'value' in o) {
      const item = o as { label?: string; value: string };
      return { label: item.label ?? item.value, value: item.value };
    }
    return { label: String(o), value: String(o) };
  });
};

const cfg = <T,>(field: RenderableField, key: string, fallback: T): T => {
  const v = field.config?.[key];
  return v === undefined || v === null ? fallback : (v as T);
};

export function FieldRenderer({ field, control, error }: Props) {
  const labelEl = (
    <Label htmlFor={field.id} className="text-base font-display font-semibold flex items-center gap-1.5">
      {field.label}
      {field.required && <span className="text-primary">*</span>}
    </Label>
  );
  const helpEl = field.helpText ? (
    <p className="text-xs text-muted-foreground">{field.helpText}</p>
  ) : null;
  const errEl = error?.message ? <p className="text-xs text-primary">{error.message}</p> : null;

  return (
    <div className="space-y-2 animate-fade-in">
      {labelEl}
      {helpEl}
      <Controller
        control={control}
        name={field.id}
        rules={{
          required: field.required ? `${field.label} is required` : false,
        }}
        render={({ field: rhf }) => {
          switch (field.kind) {
            case 'short_text':
            case 'website':
              return (
                <Input
                  id={field.id}
                  placeholder={cfg(field, 'placeholder', '')}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                  onBlur={rhf.onBlur}
                />
              );
            case 'long_text':
              return (
                <Textarea
                  id={field.id}
                  rows={cfg(field, 'rows', 4)}
                  placeholder={cfg(field, 'placeholder', '')}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                  onBlur={rhf.onBlur}
                />
              );
            case 'email':
              return (
                <Input
                  id={field.id}
                  type="email"
                  placeholder={cfg(field, 'placeholder', 'you@example.com')}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                />
              );
            case 'phone':
              return (
                <Input
                  id={field.id}
                  type="tel"
                  placeholder={cfg(field, 'placeholder', '+1 555 000 0000')}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                />
              );
            case 'address':
              return (
                <Textarea id={field.id} rows={3} value={(rhf.value as string) ?? ''} onChange={rhf.onChange} />
              );
            case 'number':
              return (
                <Input
                  id={field.id}
                  type="number"
                  min={cfg<number | undefined>(field, 'min', undefined)}
                  max={cfg<number | undefined>(field, 'max', undefined)}
                  value={(rhf.value as number | string) ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => rhf.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                />
              );
            case 'date':
              return <Input id={field.id} type="date" value={(rhf.value as string) ?? ''} onChange={rhf.onChange} />;
            case 'single_select':
            case 'picture_choice': {
              const options = normOptions(field.config?.options);
              const selected = rhf.value as string | undefined;
              return (
                <div className="grid sm:grid-cols-2 gap-2">
                  {options.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => rhf.onChange(opt.value)}
                      className={cn(
                        'text-left px-4 py-3 rounded-md border transition-all',
                        selected === opt.value
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-background hover:border-foreground/30',
                      )}
                    >
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              );
            }
            case 'multi_select':
            case 'checkbox': {
              const options = normOptions(field.config?.options);
              const selected = (rhf.value as string[] | undefined) ?? [];
              const toggle = (v: string) => {
                rhf.onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
              };
              return (
                <div className="grid sm:grid-cols-2 gap-2">
                  {options.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-md border cursor-pointer transition-all',
                        selected.includes(opt.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-foreground/30',
                      )}
                    >
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={selected.includes(opt.value)}
                        onChange={() => toggle(opt.value)}
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              );
            }
            case 'dropdown': {
              const options = normOptions(field.config?.options);
              return (
                <select
                  id={field.id}
                  className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={(rhf.value as string) ?? ''}
                  onChange={(e) => rhf.onChange(e.target.value)}
                >
                  <option value="">Select…</option>
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              );
            }
            case 'yes_no':
            case 'legal':
              return (
                <div className="flex gap-2">
                  {['Yes', 'No'].map((v) => {
                    const val = v === 'Yes';
                    const sel = rhf.value === val;
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={() => rhf.onChange(val)}
                        className={cn(
                          'flex-1 px-4 py-3 rounded-md border font-medium',
                          sel ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/30',
                        )}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              );
            case 'rating': {
              const max = cfg(field, 'max', 5);
              const val = (rhf.value as number) ?? 0;
              return (
                <div className="flex gap-1.5">
                  {Array.from({ length: max }).map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => rhf.onChange(i + 1)}
                      className={cn(
                        'h-10 w-10 rounded-md border text-lg transition-all',
                        val > i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground/30',
                      )}
                    >
                      ★
                    </button>
                  ))}
                </div>
              );
            }
            case 'opinion_scale': {
              const min = cfg(field, 'min', 0);
              const max = cfg(field, 'max', 10);
              return (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: max - min + 1 }).map((_, i) => {
                    const v = min + i;
                    const sel = rhf.value === v;
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={() => rhf.onChange(v)}
                        className={cn(
                          'h-10 w-10 rounded-md border text-sm font-medium',
                          sel ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground/30',
                        )}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              );
            }
            case 'signature':
              return (
                <Input
                  id={field.id}
                  placeholder="Type your full name to sign"
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                  className="italic"
                />
              );
            case 'welcome_screen':
            case 'statement':
              return null; // displayed via label/helpText only
            default:
              return (
                <Input
                  id={field.id}
                  placeholder={`(${field.kind} field)`}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                />
              );
          }
        }}
      />
      {errEl}
    </div>
  );
}
