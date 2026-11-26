import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Utensils, Flame, AlertCircle } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import type { MenuMeal } from '../types';

interface MealCardProps {
  meal: MenuMeal;
  childAllergies?: string[];
}

export const MealCard: React.FC<MealCardProps> = ({ meal, childAllergies = [] }) => {
  const c = useThemeColors();
  const searchableText = `${meal.dishName} ${meal.description} ${meal.ingredients.map((i) => i.name).join(' ')}`.toLowerCase();

  const conflictAllergens = childAllergies.filter((alg) =>
    searchableText.includes(alg.toLowerCase())
  );
  const hasConflict = conflictAllergens.length > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: hasConflict ? c.dangerBg : c.surface,
          borderColor: hasConflict ? c.danger : c.borderLight,
          shadowColor: c.shadow,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleBox}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: hasConflict ? c.dangerBg : c.primarySoft },
            ]}
          >
            <Utensils size={16} color={hasConflict ? c.danger : c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.mealType, { color: c.primary }]}>{meal.mealType}</Text>
            <Text style={[styles.title, { color: c.textPrimary }]}>{meal.dishName}</Text>
            {meal.time ? <Text style={[styles.time, { color: c.textMuted }]}>{meal.time}</Text> : null}
          </View>
        </View>

        {meal.calories ? (
          <View style={[styles.calorieBadge, { backgroundColor: c.subtle, borderColor: c.borderSubtle }]}>
            <Flame size={12} color={c.warning} />
            <Text style={[styles.calorieText, { color: c.textSecondary }]}>{meal.calories}</Text>
          </View>
        ) : null}
      </View>

      {meal.description ? (
        <Text style={[styles.description, { color: c.textSecondary }]}>{meal.description}</Text>
      ) : null}

      {meal.ingredients.length > 0 ? (
        <View style={[styles.allergenRow, { borderTopColor: c.borderSubtle }]}>
          <Text style={[styles.allergenLabel, { color: c.textMuted }]}>Mahsulotlar:</Text>
          {meal.ingredients.map((ing, i) => (
            <View
              key={i}
              style={[
                styles.allergenPill,
                { backgroundColor: c.subtle, borderColor: c.borderSubtle },
              ]}
            >
              <Text style={[styles.allergenText, { color: c.textSecondary }]}>
                {ing.name} ({ing.amountPerChild} {ing.unit})
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {hasConflict ? (
        <View style={[styles.conflictBox, { borderTopColor: c.danger }]}>
          <AlertCircle size={13} color={c.dangerText} />
          <Text style={[styles.conflictText, { color: c.dangerText }]}>
            Allergiya xavfi: {conflictAllergens.join(', ')}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealType: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.base,
    fontWeight: '700',
    marginTop: 1,
  },
  time: {
    fontSize: typography.xs,
    marginTop: 1,
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  calorieText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: typography.sm,
    marginTop: spacing.sm,
    lineHeight: 19,
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  allergenLabel: {
    fontSize: 11,
  },
  allergenPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  allergenText: {
    fontSize: 11,
  },
  conflictBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
  },
  conflictText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
