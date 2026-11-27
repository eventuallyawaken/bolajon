import { useCallback } from 'react';
import { useLangStore, type Lang } from './useLangStore';
import { translate, type TranslationKey } from './translations';

export { useLangStore, type Lang, type TranslationKey };

export function useT() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(lang, key, params),
    [lang]
  );

  return { lang, setLang, t };
}
