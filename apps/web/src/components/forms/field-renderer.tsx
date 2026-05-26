'use client';

import type { CSSProperties, ChangeEvent } from 'react';
import { Controller, type Control, type FieldError } from 'react-hook-form';

import type { FieldKind } from '@formstack/shared';

import { Label } from '@/components/ui/label';
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
  /**
   * When true, render inputs using CSS variables from the public form theme
   * (`--theme-bg`, `--theme-fg`, `--theme-surface`, `--theme-primary`).
   * This is what guarantees text stays readable on every theme — including
   * the dark ones where the previous implementation rendered invisible text.
   */
  themed?: boolean;
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

export function FieldRenderer({ field, control, error, themed = false }: Props) {
  // Themed inputs use CSS vars set on the page (/f/[slug]). Non-themed
  // (used in the builder preview) keep the default app palette.
  const inputStyle: CSSProperties | undefined = themed
    ? {
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-fg)',
        borderColor: 'var(--theme-border)',
      }
    : undefined;

  const inputClass = themed
    ? 'flex h-11 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 placeholder:opacity-60 transition-colors'
    : 'flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground transition-colors';

  const labelEl = (
    <Label
      htmlFor={field.id}
      className="text-base font-display font-semibold flex items-center gap-1.5"
      style={themed ? { color: 'var(--theme-fg)' } : undefined}
    >
      {field.label}
      {field.required && (
        <span style={themed ? { color: 'var(--theme-primary)' } : undefined} className={themed ? '' : 'text-primary'}>
          *
        </span>
      )}
    </Label>
  );

  const helpEl = field.helpText ? (
    <p
      className="text-xs"
      style={themed ? { color: 'var(--theme-fg)', opacity: 0.7 } : undefined}
    >
      <span className={themed ? '' : 'text-muted-foreground'}>{field.helpText}</span>
    </p>
  ) : null;

  const errEl = error?.message ? (
    <p
      className="text-xs"
      style={themed ? { color: 'var(--theme-primary)' } : undefined}
    >
      <span className={themed ? '' : 'text-primary'}>{error.message}</span>
    </p>
  ) : null;

  /** Themed option button classes — keeps selected state legible on every bg. */
  const optionBtn = (selected: boolean): { className: string; style?: CSSProperties } => {
    if (!themed) {
      return {
        className: cn(
          'text-left px-4 py-3 rounded-md border transition-all',
          selected
            ? 'border-primary bg-primary/5 text-foreground'
            : 'border-border bg-background hover:border-foreground/30',
        ),
      };
    }
    return {
      className: 'text-left px-4 py-3 rounded-md border transition-all',
      style: {
        background: selected ? 'var(--theme-primary)' : 'var(--theme-surface)',
        color: selected ? '#fff' : 'var(--theme-fg)',
        borderColor: selected ? 'var(--theme-primary)' : 'var(--theme-border)',
      },
    };
  };

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
                <input
                  id={field.id}
                  className={inputClass}
                  style={inputStyle}
                  placeholder={cfg(field, 'placeholder', '')}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                  onBlur={rhf.onBlur}
                />
              );
            case 'long_text':
              return (
                <textarea
                  id={field.id}
                  className={cn(inputClass, 'h-auto py-2.5')}
                  style={inputStyle}
                  rows={cfg(field, 'rows', 4)}
                  placeholder={cfg(field, 'placeholder', '')}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                  onBlur={rhf.onBlur}
                />
              );
            case 'email':
              return (
                <input
                  id={field.id}
                  type="email"
                  className={inputClass}
                  style={inputStyle}
                  placeholder={cfg(field, 'placeholder', 'you@example.com')}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                />
              );
            case 'phone':
              return (
                <input
                  id={field.id}
                  type="tel"
                  className={inputClass}
                  style={inputStyle}
                  placeholder={cfg(field, 'placeholder', '+1 555 000 0000')}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                />
              );
            case 'address':
              return (
                <textarea
                  id={field.id}
                  className={cn(inputClass, 'h-auto py-2.5')}
                  style={inputStyle}
                  rows={3}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                />
              );
            case 'number':
              return (
                <input
                  id={field.id}
                  type="number"
                  className={inputClass}
                  style={inputStyle}
                  min={cfg<number | undefined>(field, 'min', undefined)}
                  max={cfg<number | undefined>(field, 'max', undefined)}
                  value={(rhf.value as number | string) ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    rhf.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              );
            case 'date':
              return (
                <input
                  id={field.id}
                  type="date"
                  className={inputClass}
                  style={inputStyle}
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                />
              );
            case 'single_select':
            case 'picture_choice': {
              const options = normOptions(field.config?.options);
              const selected = rhf.value as string | undefined;
              return (
                <div className="grid sm:grid-cols-2 gap-2">
                  {options.map((opt) => {
                    const btn = optionBtn(selected === opt.value);
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => rhf.onChange(opt.value)}
                        className={btn.className}
                        style={btn.style}
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            }
            case 'multi_select':
            case 'checkbox': {
              const options = normOptions(field.config?.options);
              const selected = (rhf.value as string[] | undefined) ?? [];
              const toggle = (v: string) => {
                rhf.onChange(
                  selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v],
                );
              };
              return (
                <div className="grid sm:grid-cols-2 gap-2">
                  {options.map((opt) => {
                    const btn = optionBtn(selected.includes(opt.value));
                    return (
                      <label
                        key={opt.value}
                        className={cn(btn.className, 'flex items-center gap-2 cursor-pointer')}
                        style={btn.style}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={selected.includes(opt.value)}
                          onChange={() => toggle(opt.value)}
                        />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              );
            }
            case 'dropdown': {
              const options = normOptions(field.config?.options);
              return (
                <select
                  id={field.id}
                  className={inputClass}
                  style={inputStyle}
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
                    const btn = optionBtn(sel);
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={() => rhf.onChange(val)}
                        className={cn(btn.className, 'flex-1 font-medium text-center')}
                        style={btn.style}
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
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: max }).map((_, i) => {
                    const active = val > i;
                    const btn = optionBtn(active);
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => rhf.onChange(i + 1)}
                        className={cn(btn.className, 'h-10 w-10 grid place-items-center text-lg p-0')}
                        style={btn.style}
                      >
                        ★
                      </button>
                    );
                  })}
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
                    const btn = optionBtn(sel);
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={() => rhf.onChange(v)}
                        className={cn(btn.className, 'h-10 w-10 grid place-items-center text-sm font-medium p-0')}
                        style={btn.style}
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
                <input
                  id={field.id}
                  className={cn(inputClass, 'italic')}
                  style={inputStyle}
                  placeholder="Type your full name to sign"
                  value={(rhf.value as string) ?? ''}
                  onChange={rhf.onChange}
                />
              );
            case 'welcome_screen':
            case 'statement':
              return <></>;
            default:
              return (
                <input
                  id={field.id}
                  className={inputClass}
                  style={inputStyle}
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