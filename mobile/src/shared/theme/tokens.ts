/**
 * Design tokens matched 1:1 with frontend/src/styles/tokens.css
 * Includes Light & Dark (Tungi rejim) palettes with Crisp Silver borders.
 */

export const lightColors = {
  // Brand colors
  primary: '#0D9488',
  primaryHover: '#0F766E',
  primaryDark: '#0F766E',
  primarySoft: '#F0FDFA',
  primaryLight: '#F0FDFA',
  primaryBorder: '#CCFBF1',
  accent: '#F59E0B',

  // Surfaces & Canvas
  background: '#F8FAFC',
  canvas: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  subtle: '#F1F5F9',
  hover: '#F8FAFC',
  shadow: '#0F172A',

  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Crisp Silver borders
  border: '#CBD5E1',
  borderLight: '#CBD5E1',
  borderSubtle: '#E2E8F0',
  borderDark: '#94A3B8',
  borderStrong: '#94A3B8',

  // Status colors
  success: '#10B981',
  successLight: '#ECFDF5',
  successBg: '#ECFDF5',
  successText: '#047857',

  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  warningBg: '#FFFBEB',
  warningText: '#B45309',

  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  dangerBg: '#FEF2F2',
  dangerText: '#B91C1C',

  info: '#3B82F6',
  infoLight: '#EFF6FF',
  infoBg: '#EFF6FF',
  infoText: '#1D4ED8',

  // Toggle switch colors (matching web AttendanceToggle)
  toggleTrackActive: '#10B981',
  toggleTrackInactive: '#334155',
  toggleThumbActive: '#FFFFFF',
  toggleThumbInactive: '#E2E8F0',
  toggleIconInactive: '#64748B',
};

export const darkColors: typeof lightColors = {
  // Brand colors (dark mode)
  primary: '#14B8A6',
  primaryHover: '#2DD4BF',
  primaryDark: '#2DD4BF',
  primarySoft: 'rgba(20, 184, 166, 0.15)',
  primaryLight: 'rgba(20, 184, 166, 0.15)',
  primaryBorder: '#134E4A',
  accent: '#FBBF24',

  // Deep dark surfaces
  background: '#090D16',
  canvas: '#090D16',
  surface: '#111827',
  surfaceSecondary: '#1E293B',
  subtle: '#1E293B',
  hover: '#1F293D',
  shadow: '#000000',

  // Text colors (dark mode)
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Crisp Silver Dark borders
  border: '#334155',
  borderLight: '#334155',
  borderSubtle: '#1E293B',
  borderDark: '#475569',
  borderStrong: '#475569',

  // Status colors (dark mode)
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.16)',
  successBg: 'rgba(16, 185, 129, 0.16)',
  successText: '#34D399',

  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.16)',
  warningBg: 'rgba(245, 158, 11, 0.16)',
  warningText: '#FBBF24',

  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.16)',
  dangerBg: 'rgba(239, 68, 68, 0.16)',
  dangerText: '#F87171',

  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.16)',
  infoBg: 'rgba(59, 130, 246, 0.16)',
  infoText: '#60A5FA',

  // Toggle switch colors
  toggleTrackActive: '#10B981',
  toggleTrackInactive: '#334155',
  toggleThumbActive: '#FFFFFF',
  toggleThumbInactive: '#E2E8F0',
  toggleIconInactive: '#64748B',
};

export type ThemeColors = typeof lightColors;
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const typography = {
  xs: 12,
  sm: 13.5,
  base: 14.5,
  lg: 16,
  xl: 20,
  xxl: 24,
  title: 26,

  fontSize: {
    xs: 12,
    sm: 13.5,
    base: 14.5,
    md: 16,
    lg: 16,
    xl: 20,
    '2xl': 24,
    title: 26,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
