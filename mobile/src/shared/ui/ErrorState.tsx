import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeStore';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ma’lumot yuklanmadi',
  message,
  onRetry,
}) => {
  const c = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: c.dangerBg }]}>
        <WifiOff size={26} color={c.danger} />
      </View>
      <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text>
      {onRetry ? (
        <Button
          title="Qayta urinish"
          onPress={onRetry}
          size="sm"
          style={styles.retryBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 280,
    lineHeight: 19,
  },
  retryBtn: {
    marginTop: spacing.lg,
  },
});
