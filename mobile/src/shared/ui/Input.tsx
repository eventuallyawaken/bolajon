import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme/tokens';
import { useThemeColors } from '../theme/useThemeStore';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  style,
  ...rest
}) => {
  const c = useThemeColors();
  const [showPass, setShowPass] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: c.surface,
            borderColor: error
              ? c.danger
              : isFocused
              ? c.primary
              : c.borderLight,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={c.textMuted}
          secureTextEntry={isPassword && !showPass}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, { color: c.textPrimary }, style]}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPass(!showPass)}
          >
            {showPass ? (
              <EyeOff size={18} color={c.textMuted} />
            ) : (
              <Eye size={18} color={c.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.base,
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: typography.xs,
    marginTop: spacing.xs,
  },
});
