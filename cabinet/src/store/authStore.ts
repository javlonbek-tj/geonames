import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as AuthUser } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);

// Why do we need persist?
// Persist is a middleware that allows us to persist the state of the store to localStorage.
// This means that even if we close the browser and open it again, the state will be preserved.

// Why do we need partialize?
// Partialize is a function that allows us to specify which properties of the state should be persisted.
// In this case, we only want to persist the accessToken and user, not the entire state.
// If we don't use partialize, the entire state will be persisted, which is not what we want.
