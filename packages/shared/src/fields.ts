import type { FieldKind } from './constants';

export interface FieldKindMeta {
  kind: FieldKind;
  label: string;
  description: string;
  /** lucide-react icon name; the builder UI resolves these dynamically. */
  icon: string;
  /** A blank starting config for this kind. Builder spreads this when a user drags a new field in. */
  defaultConfig: () => Record<string, unknown>;
}

export const FIELD_KIND_META: Record<FieldKind, FieldKindMeta> = {
  short_text: {
    kind: 'short_text',
    label: 'Short text',
    description: 'A single-line text input.',
    icon: 'Type',
    defaultConfig: () => ({ placeholder: '', maxLength: 200 }),
  },
  long_text: {
    kind: 'long_text',
    label: 'Long text',
    description: 'A multi-line textarea.',
    icon: 'AlignLeft',
    defaultConfig: () => ({ placeholder: '', maxLength: 5000, rows: 4 }),
  },
  email: {
    kind: 'email',
    label: 'Email',
    description: 'Validated email address.',
    icon: 'Mail',
    defaultConfig: () => ({ placeholder: 'you@example.com' }),
  },
  phone: {
    kind: 'phone',
    label: 'Phone',
    description: 'Phone number with country code.',
    icon: 'Phone',
    defaultConfig: () => ({ placeholder: '+1 555 000 0000' }),
  },
  address: {
    kind: 'address',
    label: 'Address',
    description: 'Multi-line postal address.',
    icon: 'MapPin',
    defaultConfig: () => ({ includeCountry: true }),
  },
  website: {
    kind: 'website',
    label: 'Website',
    description: 'A URL.',
    icon: 'Globe',
    defaultConfig: () => ({ placeholder: 'https://' }),
  },
  single_select: {
    kind: 'single_select',
    label: 'Single select',
    description: 'Pick exactly one option.',
    icon: 'Circle',
    defaultConfig: () => ({ options: ['Option 1', 'Option 2'] }),
  },
  multi_select: {
    kind: 'multi_select',
    label: 'Multi select',
    description: 'Pick one or more options.',
    icon: 'CheckSquare',
    defaultConfig: () => ({ options: ['Option 1', 'Option 2'], min: 1, max: 5 }),
  },
  dropdown: {
    kind: 'dropdown',
    label: 'Dropdown',
    description: 'Compact dropdown with searchable options.',
    icon: 'ChevronDown',
    defaultConfig: () => ({ options: ['Option 1', 'Option 2'] }),
  },
  picture_choice: {
    kind: 'picture_choice',
    label: 'Picture choice',
    description: 'Image-tiled options.',
    icon: 'Image',
    defaultConfig: () => ({ options: [{ label: 'A', image: '' }] }),
  },
  yes_no: {
    kind: 'yes_no',
    label: 'Yes / No',
    description: 'Binary choice.',
    icon: 'ToggleLeft',
    defaultConfig: () => ({}),
  },
  legal: {
    kind: 'legal',
    label: 'Legal consent',
    description: 'Terms acceptance checkbox with link.',
    icon: 'FileSignature',
    defaultConfig: () => ({ url: '' }),
  },
  checkbox: {
    kind: 'checkbox',
    label: 'Checkbox',
    description: 'A single checkbox.',
    icon: 'Check',
    defaultConfig: () => ({}),
  },
  opinion_scale: {
    kind: 'opinion_scale',
    label: 'Opinion scale',
    description: '0–10 NPS-style scale.',
    icon: 'BarChart3',
    defaultConfig: () => ({ min: 0, max: 10, leftLabel: 'Not at all', rightLabel: 'Extremely' }),
  },
  rating: {
    kind: 'rating',
    label: 'Star rating',
    description: 'Star rating, 1–5.',
    icon: 'Star',
    defaultConfig: () => ({ max: 5 }),
  },
  ranking: {
    kind: 'ranking',
    label: 'Ranking',
    description: 'Drag to order options.',
    icon: 'ListOrdered',
    defaultConfig: () => ({ options: ['First', 'Second', 'Third'] }),
  },
  matrix: {
    kind: 'matrix',
    label: 'Matrix',
    description: 'Grid of rows × columns.',
    icon: 'Grid3x3',
    defaultConfig: () => ({ rows: ['Row 1'], columns: ['Col 1'] }),
  },
  video: {
    kind: 'video',
    label: 'Video',
    description: 'Embed a video.',
    icon: 'Video',
    defaultConfig: () => ({ url: '' }),
  },
  audio: {
    kind: 'audio',
    label: 'Audio',
    description: 'Embed an audio clip.',
    icon: 'Music',
    defaultConfig: () => ({ url: '' }),
  },
  faq: {
    kind: 'faq',
    label: 'FAQ',
    description: 'Collapsible Q&A block.',
    icon: 'HelpCircle',
    defaultConfig: () => ({ items: [{ q: '', a: '' }] }),
  },
  number: {
    kind: 'number',
    label: 'Number',
    description: 'A numeric input.',
    icon: 'Hash',
    defaultConfig: () => ({ min: undefined, max: undefined }),
  },
  date: {
    kind: 'date',
    label: 'Date',
    description: 'Date picker.',
    icon: 'Calendar',
    defaultConfig: () => ({ format: 'YYYY-MM-DD' }),
  },
  signature: {
    kind: 'signature',
    label: 'Signature',
    description: 'Draw-to-sign canvas.',
    icon: 'PenTool',
    defaultConfig: () => ({}),
  },
  payment: {
    kind: 'payment',
    label: 'Payment',
    description: 'Collect a payment (stub).',
    icon: 'CreditCard',
    defaultConfig: () => ({ amount: 0, currency: 'USD' }),
  },
  file_upload: {
    kind: 'file_upload',
    label: 'File upload',
    description: 'Upload one or more files.',
    icon: 'Upload',
    defaultConfig: () => ({ maxSizeMb: 10, accept: '*' }),
  },
  scheduler: {
    kind: 'scheduler',
    label: 'Scheduler',
    description: 'Pick a meeting slot.',
    icon: 'CalendarClock',
    defaultConfig: () => ({ provider: 'calendly', url: '' }),
  },
  welcome_screen: {
    kind: 'welcome_screen',
    label: 'Welcome screen',
    description: 'The first screen respondents see.',
    icon: 'PartyPopper',
    defaultConfig: () => ({ ctaLabel: 'Start' }),
  },
  statement: {
    kind: 'statement',
    label: 'Statement',
    description: 'Display-only text block.',
    icon: 'MessageSquare',
    defaultConfig: () => ({}),
  },
  question_group: {
    kind: 'question_group',
    label: 'Question group',
    description: 'Group related questions on one screen.',
    icon: 'Layers',
    defaultConfig: () => ({ childIds: [] }),
  },
  redirect: {
    kind: 'redirect',
    label: 'Redirect',
    description: 'Send respondent to a URL after submitting.',
    icon: 'ExternalLink',
    defaultConfig: () => ({ url: '' }),
  },
};
