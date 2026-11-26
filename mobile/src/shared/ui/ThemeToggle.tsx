import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useThemeStore, useThemeColors } from '../theme/useThemeStore';

/**
 * Matches frontend/src/shared/ui/ThemeToggle.tsx (Day / Night circular switch)
 */
export const ThemeToggle: React.FC = () => {
  const { toggleTheme } = useThemeStore();
  const c = useThemeColors();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={toggleTheme}
      accessibilityLabel="Kunduzgi yoki tungi rejim"
      style={[
        styles.button,
        {
          backgroundColor: c.surface,
          borderColor: c.borderLight,
          shadowColor: c.shadow,
        },
      ]}
    >
      {c.isDark ? (
        <Sun size={18} color="#FBBF24" />
      ) : (
        <Moon size={18} color="#0F172A" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
});
