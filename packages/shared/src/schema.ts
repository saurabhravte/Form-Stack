import { z } from "zod";
import { FIELD_KINDS, FORM_STATUS, FORM_TYPES, FORM_VISIBILITY, PLAN_TIERS } from "./constants";

/*  
   AUTH
  */

export const EmailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/** Step 1 of registration. */
export const RegisterStep1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: EmailSchema,
});

/** Step 2 of registration. */
export const RegisterStep2Schema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

/** Step 3 of registration — workspace setup. */
export const RegisterStep3Schema = z.object({
  workspaceName: z.string().min(2).max(80),
  workspaceSlug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
});

/** What the API actually receives — the merged thing. */
export const RegisterInputSchema = z.object({
  name: z.string().min(2).max(80),
  email: EmailSchema,
  password: PasswordSchema,
  workspaceName: z.string().min(2).max(80),
  workspaceSlug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
});

export const LoginStep1Schema = z.object({ email: EmailSchema });
export const LoginStep2Schema = z.object({ password: z.string().min(1, "Password is required") });
export const LoginInputSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;

/*
 *  FIELD CONFIG — discriminated union over `kind`
 */

const baseField = {
  id: z.string().uuid(),
  label: z.string().min(1, "Label is required").max(200),
  description: z.string().max(500).optional(),
  required: z.boolean().default(false),
  hidden: z.boolean().default(false),

  conditional: z
    .object({
      fieldId: z.string().uuid(),
      operator: z.enum(["equals", "not_equals", "contains", "gt", "lt"]),
      value: z.unknown(),
    })
    .nullable()
    .default(null),
};

const optionListField = z.object({
  ...baseField,
  config: z.object({
    options: z.array(z.string().min(1)).min(1, "Add at least one option"),
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(1).optional(),
  }),
});

export const FieldConfigSchema = z.discriminatedUnion("kind", [
  z.object({
    ...baseField,
    kind: z.literal("short_text"),
    config: z.object({
      placeholder: z.string().optional(),
      maxLength: z.number().int().positive().default(200),
    }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("long_text"),
    config: z.object({
      placeholder: z.string().optional(),
      maxLength: z.number().int().positive().default(5000),
      rows: z.number().int().positive().default(4),
    }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("email"),
    config: z.object({ placeholder: z.string().optional() }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("phone"),
    config: z.object({ placeholder: z.string().optional() }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("address"),
    config: z.object({ includeCountry: z.boolean().default(true) }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("website"),
    config: z.object({ placeholder: z.string().optional() }),
  }),
  optionListField.extend({ kind: z.literal("single_select") }),
  optionListField.extend({ kind: z.literal("multi_select") }),
  optionListField.extend({ kind: z.literal("dropdown") }),
  z.object({
    ...baseField,
    kind: z.literal("yes_no"),
    config: z.object({}).default({}),
  }),
  z.object({
    ...baseField,
    kind: z.literal("legal"),
    config: z.object({ url: z.string().url().optional() }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("checkbox"),
    config: z.object({}).default({}),
  }),
  z.object({
    ...baseField,
    kind: z.literal("opinion_scale"),
    config: z.object({
      min: z.number().int().min(0).default(0),
      max: z.number().int().max(10).default(10),
      leftLabel: z.string().optional(),
      rightLabel: z.string().optional(),
    }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("rating"),
    config: z.object({ max: z.number().int().min(3).max(10).default(5) }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("number"),
    config: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("date"),
    config: z.object({ format: z.string().default("YYYY-MM-DD") }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("file_upload"),
    config: z.object({
      maxSizeMb: z.number().positive().max(100).default(10),
      accept: z.string().default("*"),
    }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("welcome_screen"),
    config: z.object({ ctaLabel: z.string().default("Start") }),
  }),
  z.object({
    ...baseField,
    kind: z.literal("statement"),
    config: z.object({}).default({}),
  }),
  z.object({
    ...baseField,
    kind: z.literal("redirect"),
    config: z.object({ url: z.string().url() }),
  }),

  z.object({
    ...baseField,
    kind: z.enum([
      "picture_choice",
      "signature",
      "payment",
      "scheduler",
      "question_group",
      "ranking",
      "matrix",
      "video",
      "audio",
      "faq",
    ] as const),
    config: z.record(z.unknown()).default({}),
  }),
]);

export type FieldConfig = z.infer<typeof FieldConfigSchema>;

/*
 *  FORM
 */

export const FormSettingsSchema = z.object({
  multiPage: z.boolean().default(false),
  showProgress: z.boolean().default(true),
  closeMessage: z.string().max(500).optional(),
  thankYouMessage: z.string().max(500).default("Thanks for your response!"),
  responseLimit: z.number().int().positive().nullable().default(null),
  closesAt: z.string().datetime().nullable().default(null),
  password: z.string().nullable().default(null),
  notifyOnResponse: z.boolean().default(true),
});

export const CreateFormSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(FORM_TYPES).default("form"),
  themeId: z.string().default("crimson-default"),
  templateId: z.string().nullable().optional(),
});

export const UpdateFormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only")
    .optional(),
  visibility: z.enum(FORM_VISIBILITY).optional(),
  status: z.enum(FORM_STATUS).optional(),
  themeId: z.string().optional(),
  fields: z.array(FieldConfigSchema).optional(),
  settings: FormSettingsSchema.partial().optional(),
});

export const PublishFormSchema = z.object({
  id: z.string().uuid(),
  visibility: z.enum(FORM_VISIBILITY).default("unlisted"),
});

/*
 *  RESPONSE
 */

export const ResponseAnswerSchema = z.object({
  fieldId: z.string().uuid(),
  value: z.unknown(),
});

export const SubmitResponseSchema = z.object({
  formId: z.string().uuid(),
  answers: z.array(ResponseAnswerSchema).min(1, "At least one answer is required"),
  metadata: z
    .object({
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
      durationMs: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export type SubmitResponseInput = z.infer<typeof SubmitResponseSchema>;

/*
 *  WORKSPACE / BILLING
 */

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
});

export const UpgradePlanSchema = z.object({
  workspaceId: z.string().uuid(),
  plan: z.enum(PLAN_TIERS),
});

/* 
  PAGINATION
  */

export const PaginationSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;
