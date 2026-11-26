import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeStore';
import { ThemeToggle } from './ThemeToggle';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  hideThemeToggle?: boolean;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  rightAction,
  hideThemeToggle = false,
  style,
}) => {
  const c = useThemeColors();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: c.surface,
          borderColor: c.borderLight,
        },
        style,
      ]}
    >
      <View style={styles.titleWrap}>
        <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightRow}>
        {rightAction}
        {!hideThemeToggle && <ThemeToggle />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.xs,
    marginTop: 2,
    fontWeight: '500',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
