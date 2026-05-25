import { create } from 'zustand';

import type { PublicUser } from '@formstack/shared';

interface AuthState {
  user: PublicUser | null;
  workspaceId: string | null;
  hydrated: boolean;
  setSession: (user: PublicUser | null, workspaceId: string | null) => void;
  clear: () => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  workspaceId: null,
  hydrated: false,
  setSession: (user, workspaceId) => set({ user, workspaceId }),
  clear: () => set({ user: null, workspaceId: null }),
  markHydrated: () => set({ hydrated: true }),
}));
