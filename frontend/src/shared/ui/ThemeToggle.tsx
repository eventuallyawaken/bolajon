import React, { useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    // Ensure document attribute is synced on mount
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Kunduzgi rejimga o‘tish (Day)' : 'Tungi rejimga o‘tish (Night)'}
      aria-label="Toggle theme"
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-color)',
        color: isDark ? '#fbbf24' : '#0f172a',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-xs)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--brand-primary)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isDark ? (
        // Sun icon for Day mode switch
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon for Night mode switch
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};
