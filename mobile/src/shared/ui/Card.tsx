import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { radius, spacing } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeStore';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const c = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: c.borderLight,
          shadowColor: c.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
});
