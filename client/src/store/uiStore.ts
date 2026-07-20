import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  isDarkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
}

// Detect if initial device is mobile
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isDarkMode: true,
      // Start closed on mobile, open on desktop
      sidebarOpen: !isMobile(),

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.isDarkMode;
          document.documentElement.classList.toggle('dark', next);
          return { isDarkMode: next };
        }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'ui-storage',
      // Don't persist sidebarOpen on mobile — always start closed
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        // Only persist sidebarOpen on desktop
        sidebarOpen: isMobile() ? true : state.sidebarOpen,
      }),
    }
  )
);
