export * from './errors';
export * from './constants';
export * from './schemas';
export * from './themes';
export * from './fields';

// Public types of common entity shapes — these match the Drizzle row types
// but live in shared so the frontend can import them without depending on db.
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface PublicWorkspace {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  ownerId: string;
}

export interface PublicFormSummary {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'unlisted' | 'private';
  themeId: string;
  responseCount: number;
  updatedAt: string;
  createdAt: string;
}
