import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store: current user and logout.
 * user: { id, nickname, role } | null
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
