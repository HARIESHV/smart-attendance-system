import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      // Always defined — never undefined even after hydration
      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user/token/isAuthenticated — never setLoading (it's a function)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Merge persisted state safely — functions always come from the store definition
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AuthStore>),
        // Always keep functions from current, never from persisted
        setAuth: current.setAuth,
        setLoading: current.setLoading,
        logout: current.logout,
        updateUser: current.updateUser,
        // isLoading always starts true so App can verify auth
        isLoading: true,
      }),
    }
  )
);
