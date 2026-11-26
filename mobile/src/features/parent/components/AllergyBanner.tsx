import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';

interface AllergyBannerProps {
  allergies: string[];
}

export const AllergyBanner: React.FC<AllergyBannerProps> = ({ allergies }) => {
  const c = useThemeColors();
  if (!allergies || allergies.length === 0) return null;

  return (
    <View style={[styles.banner, { backgroundColor: c.dangerBg, borderColor: c.danger }]}>
      <View style={[styles.iconCircle, { backgroundColor: c.surface }]}>
        <AlertTriangle size={18} color={c.danger} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: c.dangerText }]}>Allergiya ogohlantirishi!</Text>
        <Text style={[styles.subtitle, { color: c.textPrimary }]}>
          Farzandingizda quyidagi mahsulotlarga allergiya qayd etilgan:{' '}
          <Text style={{ fontWeight: '700', color: c.dangerText }}>{allergies.join(', ')}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.xs,
    marginTop: 2,
    lineHeight: 16,
  },
});
