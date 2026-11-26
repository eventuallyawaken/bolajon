import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeStore';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
}) => {
  const c = useThemeColors();

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: c.textMuted }]}>{message}</Text>}
      {action && <View style={styles.actionWrap}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconWrap: {
    marginBottom: spacing.md,
    opacity: 0.85,
  },
  title: {
    fontSize: typography.base,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 260,
  },
  actionWrap: {
    marginTop: spacing.lg,
  },
});
