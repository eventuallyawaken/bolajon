import React from 'react';
import { useLangStore, type Lang } from '@/shared/i18n';

export const LanguageSelector: React.FC = () => {
  const { lang: currentLang, setLang } = useLangStore();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 9999,
        padding: '3px 4px',
        gap: 3,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {(['UZ', 'RU', 'EN'] as const).map((lang: Lang) => {
        const isActive = currentLang === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => setLang(lang)}
            style={{
              padding: '4px 10px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.03em',
              background: isActive ? 'var(--text-primary)' : 'transparent',
              color: isActive ? 'var(--bg-surface)' : 'var(--text-muted)',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
};
