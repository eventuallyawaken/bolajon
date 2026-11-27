import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'UZ' | 'RU' | 'EN';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'UZ',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'bolajon_lang',
    }
  )
);
