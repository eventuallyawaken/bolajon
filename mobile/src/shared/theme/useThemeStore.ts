import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { darkColors, lightColors, type ThemeColors } from './tokens';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bolajon_mobile_theme';

interface ThemeState {
  theme: ThemeMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  hydrated: false,

  hydrate: async () => {
    try {
      const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        set({ theme: saved, hydrated: true });
        return;
      }
    } catch {
      // ignore if SecureStore unavailable on web
    }
    set({ hydrated: true });
  },

  setTheme: async (mode: ThemeMode) => {
    set({ theme: mode });
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  },

  toggleTheme: async () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    await get().setTheme(next);
  },
}));

export function useThemeColors(): ThemeColors & { isDark: boolean } {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';
  const palette = isDark ? darkColors : lightColors;
  return { ...palette, isDark };
}
