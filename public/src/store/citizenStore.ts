import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Citizen {
  id: number;
  telegramId: string;
  fullName: string | null;
  phone: string | null;
}

interface CitizenState {
  accessToken: string | null;
  citizen: Citizen | null;
  setAuth: (accessToken: string, citizen: Citizen) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useCitizenStore = create<CitizenState>()(
  persist(
    (set) => ({
      accessToken: null,
      citizen: null,
      setAuth: (accessToken, citizen) => set({ accessToken, citizen }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, citizen: null }),
    }),
    {
      name: 'citizen-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        citizen: state.citizen,
      }),
    },
  ),
);
