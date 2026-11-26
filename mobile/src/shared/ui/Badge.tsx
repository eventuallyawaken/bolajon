import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeStore';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  showDot?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  showDot = false,
  style,
}) => {
  const c = useThemeColors();

  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: c.successBg, text: c.successText, dot: c.success };
      case 'warning':
        return { bg: c.warningBg, text: c.warningText, dot: c.warning };
      case 'danger':
        return { bg: c.dangerBg, text: c.dangerText, dot: c.danger };
      case 'info':
        return { bg: c.infoBg, text: c.infoText, dot: c.info };
      default:
        return { bg: c.subtle, text: c.textSecondary, dot: c.textMuted };
    }
  };

  const s = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, style]}>
      {showDot && <View style={[styles.dot, { backgroundColor: s.dot }]} />}
      <Text style={[styles.text, { color: s.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
});
