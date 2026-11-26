import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyThemeToDOM(next);
        set({ theme: next });
      },

      setTheme: (theme: Theme) => {
        applyThemeToDOM(theme);
        set({ theme });
      },
    }),
    {
      name: 'bolajon_theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme);
        }
      },
    }
  )
);

// Initialize on page load
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('bolajon_theme');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.state?.theme) {
        applyThemeToDOM(parsed.state.theme);
      }
    } catch {
      // ignore
    }
  }
}
