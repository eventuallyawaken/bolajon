import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const c = useThemeColors();

  const getBtnBg = () => {
    if (disabled) return c.subtle;
    switch (variant) {
      case 'primary':
        return c.primary;
      case 'secondary':
        return c.subtle;
      case 'outline':
        return c.surface;
      case 'danger':
        return c.danger;
      default:
        return c.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return c.textMuted;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return c.textPrimary;
      case 'outline':
        return c.primary;
      case 'danger':
        return '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return c.primary;
    if (variant === 'secondary') return c.borderLight;
    return 'transparent';
  };

  const getPaddingVertical = () => {
    switch (size) {
      case 'sm':
        return 8;
      case 'lg':
        return 15;
      default:
        return 12;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: getBtnBg(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          paddingVertical: getPaddingVertical(),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? typography.sm : typography.base,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
