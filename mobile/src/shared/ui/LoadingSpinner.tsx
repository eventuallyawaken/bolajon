import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeStore';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Yuklanmoqda...',
}) => {
  const c = useThemeColors();

  return (
    <View style={[styles.center, { backgroundColor: c.canvas }]}>
      <ActivityIndicator size="large" color={c.primary} />
      {message && <Text style={[styles.text, { color: c.textMuted }]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  text: {
    fontSize: typography.sm,
    marginTop: spacing.sm,
  },
});
