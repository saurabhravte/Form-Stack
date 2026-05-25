import { create } from 'zustand';

import type { FieldKind } from '@formstack/shared';

export interface BuilderField {
  id: string;
  kind: FieldKind;
  label: string;
  required: boolean;
  helpText?: string;
  config: Record<string, unknown>;
}

interface BuilderState {
  formId: string | null;
  title: string;
  description: string;
  themeId: string;
  fields: BuilderField[];
  selectedFieldId: string | null;
  load: (snapshot: {
    formId: string;
    title: string;
    description: string;
    themeId: string;
    fields: BuilderField[];
  }) => void;
  setTitle: (t: string) => void;
  setDescription: (d: string) => void;
  setTheme: (id: string) => void;
  addField: (f: BuilderField) => void;
  updateField: (id: string, patch: Partial<BuilderField>) => void;
  removeField: (id: string) => void;
  reorder: (from: number, to: number) => void;
  select: (id: string | null) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  formId: null,
  title: '',
  description: '',
  themeId: 'crimson-default',
  fields: [],
  selectedFieldId: null,
  load: (snap) =>
    set({
      formId: snap.formId,
      title: snap.title,
      description: snap.description,
      themeId: snap.themeId,
      fields: snap.fields,
      selectedFieldId: snap.fields[0]?.id ?? null,
    }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setTheme: (themeId) => set({ themeId }),
  addField: (field) =>
    set((s) => ({ fields: [...s.fields, field], selectedFieldId: field.id })),
  updateField: (id, patch) =>
    set((s) => ({
      fields: s.fields.map((f) => (f.id === id ? { ...f, ...patch, config: { ...f.config, ...(patch.config ?? {}) } } : f)),
    })),
  removeField: (id) =>
    set((s) => ({
      fields: s.fields.filter((f) => f.id !== id),
      selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
    })),
  reorder: (from, to) =>
    set((s) => {
      const next = [...s.fields];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return { fields: next };
    }),
  select: (id) => set({ selectedFieldId: id }),
  reset: () =>
    set({
      formId: null,
      title: '',
      description: '',
      themeId: 'crimson-default',
      fields: [],
      selectedFieldId: null,
    }),
}));
