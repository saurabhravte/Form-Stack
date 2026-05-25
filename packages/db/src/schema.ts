import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/*  ENUMS */

export const planTierEnum = pgEnum("plan_tier", ["free", "pro", "team", "enterprise"]);
export const formStatusEnum = pgEnum("form_status", ["draft", "published", "archived"]);
export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted", "private"]);
export const formTypeEnum = pgEnum("form_type", [
  "form",
  "survey",
  "quiz",
  "poll",
  "lead_gen",
  "registration",
  "feedback",
  "job_app",
  "order",
  "nps",
]);

/* USERS & SESSIONS*/

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_unique").on(t.email),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("sessions_user_idx").on(t.userId),
    tokenIdx: uniqueIndex("sessions_token_unique").on(t.tokenHash),
  }),
);

/*WORKSPACES & MEMBERSHIPS */

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    plan: planTierEnum("plan").notNull().default("free"),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("workspaces_slug_unique").on(t.slug),
    ownerIdx: index("workspaces_owner_idx").on(t.ownerId),
  }),
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "admin", "editor", "viewer"] })
      .notNull()
      .default("editor"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueMember: uniqueIndex("workspace_members_unique").on(t.workspaceId, t.userId),
  }),
);

/* FORMS */

export const forms = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    slug: text("slug").notNull(),
    type: formTypeEnum("type").notNull().default("form"),
    status: formStatusEnum("status").notNull().default("draft"),
    visibility: formVisibilityEnum("visibility").notNull().default("unlisted"),
    themeId: text("theme_id").notNull().default("crimson-default"),

    fields: jsonb("fields")
      .$type<unknown[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    /** Settings — FormSettingsSchema. */
    settings: jsonb("settings")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    /** Denormalized counter — kept in sync by ResponseController.create. */
    responseCount: integer("response_count").notNull().default(0),
    /** Optional response limit and expiry — checked at submission. */
    responseLimit: integer("response_limit"),
    closesAt: timestamp("closes_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("forms_slug_unique").on(t.slug),
    workspaceIdx: index("forms_workspace_idx").on(t.workspaceId),
    visibilityIdx: index("forms_visibility_idx").on(t.visibility, t.status),
  }),
);

/* RESPONSES  */

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),

    answers: jsonb("answers").$type<Array<{ fieldId: string; value: unknown }>>().notNull(),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    formIdx: index("responses_form_idx").on(t.formId, t.createdAt),
  }),
);

/* ANALYTICS EVENTS (lightweight) */

export const formEvents = pgTable(
  "form_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),

    type: text("type").notNull(),
    fieldId: uuid("field_id"),
    sessionId: text("session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    formIdx: index("form_events_form_idx").on(t.formId, t.createdAt),
    typeIdx: index("form_events_type_idx").on(t.formId, t.type),
  }),
);

/*  THEMES & TEMPLATES */

export const themes = pgTable("themes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  tokens: jsonb("tokens").$type<Record<string, string>>().notNull(),
  isStarter: boolean("is_starter").notNull().default(true),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    themeId: text("theme_id").notNull().default("crimson-default"),
    fields: jsonb("fields")
      .$type<unknown[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    settings: jsonb("settings")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("templates_slug_unique").on(t.slug),
  }),
);

/* RELATIONS  */

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  workspaces: many(workspaces),
  memberships: many(workspaceMembers),
}));

export const workspacesRelations = relations(workspaces, ({ many, one }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  members: many(workspaceMembers),
  forms: many(forms),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [forms.workspaceId], references: [workspaces.id] }),
  creator: one(users, { fields: [forms.createdByUserId], references: [users.id] }),
  responses: many(responses),
  events: many(formEvents),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  form: one(forms, { fields: [responses.formId], references: [forms.id] }),
}));

/*  TYPED ROW EXPORTS*/

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type WorkspaceRow = typeof workspaces.$inferSelect;
export type FormRow = typeof forms.$inferSelect;
export type NewFormRow = typeof forms.$inferInsert;
export type ResponseRow = typeof responses.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type ThemeRow = typeof themes.$inferSelect;
export type TemplateRow = typeof templates.$inferSelect;
