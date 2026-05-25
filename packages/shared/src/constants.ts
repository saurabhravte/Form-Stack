/**
 * FormStack constants — single source of truth for enums and tables that
 * both the frontend and backend depend on. Anywhere in the code that needs
 * a list of field types, themes, plan tiers, or visibility modes, imports
 * from here.
 */

export const FIELD_CATEGORIES = ['contact', 'choice', 'rating', 'text', 'other'] as const;
export type FieldCategory = (typeof FIELD_CATEGORIES)[number];

/**
 * Every supported field kind. Adding a new kind is a 3-step process:
 *  1) Add it here
 *  2) Add a Zod variant in `schemas.ts` -> `FieldConfigSchema`
 *  3) Add a renderer in the web app's `<FieldRenderer />`
 */
export const FIELD_KINDS = [
  // Contact info
  'short_text',
  'long_text',
  'email',
  'phone',
  'address',
  'website',
  // Choice
  'single_select',
  'multi_select',
  'dropdown',
  'picture_choice',
  'yes_no',
  'legal',
  'checkbox',
  // Rating
  'opinion_scale',
  'rating',
  'ranking',
  'matrix',
  // Text & media
  'video',
  'audio',
  'faq',
  // Other
  'number',
  'date',
  'signature',
  'payment',
  'file_upload',
  'scheduler',
  'welcome_screen',
  'statement',
  'question_group',
  'redirect',
] as const;
export type FieldKind = (typeof FIELD_KINDS)[number];

export const FIELD_CATEGORY_BY_KIND: Record<FieldKind, FieldCategory> = {
  short_text: 'text',
  long_text: 'text',
  email: 'contact',
  phone: 'contact',
  address: 'contact',
  website: 'contact',
  single_select: 'choice',
  multi_select: 'choice',
  dropdown: 'choice',
  picture_choice: 'choice',
  yes_no: 'choice',
  legal: 'choice',
  checkbox: 'choice',
  opinion_scale: 'rating',
  rating: 'rating',
  ranking: 'rating',
  matrix: 'rating',
  video: 'text',
  audio: 'text',
  faq: 'text',
  number: 'other',
  date: 'other',
  signature: 'other',
  payment: 'other',
  file_upload: 'other',
  scheduler: 'other',
  welcome_screen: 'other',
  statement: 'other',
  question_group: 'other',
  redirect: 'other',
};

export const FORM_VISIBILITY = ['public', 'unlisted', 'private'] as const;
export type FormVisibility = (typeof FORM_VISIBILITY)[number];

export const FORM_STATUS = ['draft', 'published', 'archived'] as const;
export type FormStatus = (typeof FORM_STATUS)[number];

export const FORM_TYPES = [
  'form',
  'survey',
  'quiz',
  'poll',
  'lead_gen',
  'registration',
  'feedback',
  'job_app',
  'order',
  'nps',
] as const;
export type FormType = (typeof FORM_TYPES)[number];

export const PLAN_TIERS = ['free', 'pro', 'team', 'enterprise'] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const PLAN_LIMITS: Record<PlanTier, { forms: number; responses: number; workspaces: number }> = {
  free: { forms: 3, responses: 100, workspaces: 1 },
  pro: { forms: 50, responses: 5000, workspaces: 3 },
  team: { forms: 500, responses: 50_000, workspaces: 10 },
  enterprise: { forms: Number.POSITIVE_INFINITY, responses: Number.POSITIVE_INFINITY, workspaces: Number.POSITIVE_INFINITY },
};

export const PLAN_PRICING: Record<PlanTier, { monthly: number; yearly: number; label: string }> = {
  free: { monthly: 0, yearly: 0, label: 'Free' },
  pro: { monthly: 19, yearly: 190, label: 'Pro' },
  team: { monthly: 49, yearly: 490, label: 'Team' },
  enterprise: { monthly: 0, yearly: 0, label: 'Enterprise' },
};

export const COOKIE_NAME = 'formstack_session';
export const SESSION_HEADER = 'x-formstack-session';

export const RATE_LIMITS = {
  publicSubmit: { windowMs: 60_000, max: 10 },
  authLogin: { windowMs: 60_000, max: 5 },
  authRegister: { windowMs: 60_000, max: 3 },
} as const;
