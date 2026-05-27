import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { PublicUser } from '@formstack/shared';

interface AuthState {
  user: PublicUser | null;
  workspaceId: string | null;
  hydrated: boolean;
  setSession: (user: PublicUser | null, workspaceId: string | null) => void;
  clear: () => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      workspaceId: null,
      hydrated: false,
    
      setSession: (user, workspaceId) =>
        set({ user, workspaceId, hydrated: true }),
      clear: () => set({ user: null, workspaceId: null, hydrated: true }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'formstack-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        workspaceId: state.workspaceId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);