import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utensils, AlertTriangle } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { extractApiError } from '../../../shared/api/http';
import { useTeacherGroups, useTeacherMenuPortions } from '../hooks/useTeacherQueries';
import { useSelectedGroupStore } from '../store/useSelectedGroupStore';
import { GroupSelectorBar } from '../components/GroupSelectorBar';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorState } from '../../../shared/ui/ErrorState';

export const TeacherMenuScreen: React.FC = () => {
  const c = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { selectedGroupId, setSelectedGroupId } = useSelectedGroupStore();

  const currentDate = new Date().toISOString().slice(0, 10);
  const groupsQuery = useTeacherGroups();
  const groups = groupsQuery.data || [];
  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) ||
    groups.find((g) => g.id === user?.groupId || g.mainTeacher === user?.fullName) ||
    groups[0];

  const portionsQuery = useTeacherMenuPortions(activeGroup?.id, currentDate);
  const portions = portionsQuery.data;

  if (groupsQuery.isLoading || portionsQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <LoadingSpinner message="Taomnoma va porsiyalar hisoblanmoqda..." />
      </SafeAreaView>
    );
  }

  if (groupsQuery.isError || portionsQuery.isError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <ErrorState
          message={extractApiError(groupsQuery.error || portionsQuery.error)}
          onRetry={() => portionsQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={portionsQuery.isRefetching}
            onRefresh={() => {
              portionsQuery.refetch();
            }}
            colors={[c.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Menyu va porsiyalar"
          subtitle={`${activeGroup?.name || 'Guruh'} — ${currentDate}`}
        />

        <GroupSelectorBar
          groups={groups}
          selectedGroupId={activeGroup?.id || ''}
          onSelectGroup={setSelectedGroupId}
        />

        {portions && (
          <View style={[styles.summaryCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
            <View style={styles.summaryTitleRow}>
              <Utensils size={18} color={c.primary} />
              <Text style={[styles.summaryTitle, { color: c.textPrimary }]}>
                Porsiyalar taqsimoti
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: c.primarySoft }]}>
                <Text style={[styles.statNum, { color: c.primaryDark }]}>
                  {portions.totalPresent}
                </Text>
                <Text style={[styles.statLabel, { color: c.textSecondary }]}>Kelgan bolalar</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: c.successBg }]}>
                <Text style={[styles.statNum, { color: c.successText }]}>
                  {portions.standardPortions}
                </Text>
                <Text style={[styles.statLabel, { color: c.textSecondary }]}>Standart taom</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: c.warningBg }]}>
                <Text style={[styles.statNum, { color: c.warningText }]}>
                  {portions.dietPortions}
                </Text>
                <Text style={[styles.statLabel, { color: c.textSecondary }]}>Parhez / Maxsus</Text>
              </View>
            </View>
          </View>
        )}

        {portions && portions.allergicStudents.length > 0 && (
          <View style={[styles.allergySection, { backgroundColor: c.warningBg, borderColor: c.warning }]}>
            <View style={styles.allergyHeader}>
              <AlertTriangle size={18} color={c.warningText} />
              <Text style={[styles.allergySectionTitle, { color: c.warningText }]}>
                Maxsus nazoratdagi bolalar ({portions.allergicStudents.length} ta)
              </Text>
            </View>
            <Text style={[styles.allergyDesc, { color: c.textSecondary }]}>
              Oshxona tomonidan bu bolalarga alohida parhez taom tayyorlanadi:
            </Text>

            {portions.allergicStudents.map((child, i) => (
              <View key={i} style={styles.allergicChildRow}>
                <View style={[styles.redDot, { backgroundColor: c.danger }]} />
                <Text style={[styles.childName, { color: c.textPrimary }]}>{child.studentName}:</Text>
                <Text style={[styles.allergenBadge, { color: c.dangerText }]}>{child.allergen}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.mealsSchedule, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <Text style={[styles.scheduleTitle, { color: c.textPrimary }]}>Bugungi kun taomnomasi</Text>

          {(!portions || portions.meals.length === 0) ? (
            <Text style={[styles.emptyMeals, { color: c.textMuted }]}>
              Hali kunlik taomnoma kiritilmagan.
            </Text>
          ) : (
            portions.meals.map((meal) => (
              <View
                key={meal.id}
                style={[styles.mealPlanItem, { borderBottomColor: c.borderSubtle }]}
              >
                <View style={styles.mealTop}>
                  <Text style={[styles.mealTime, { color: c.primary }]}>
                    {meal.time ? `${meal.time} — ` : ''}{meal.mealType}
                  </Text>
                  {meal.calories ? (
                    <Text style={[styles.mealCal, { color: c.textMuted }]}>{meal.calories}</Text>
                  ) : null}
                </View>
                <Text style={[styles.mealDish, { color: c.textPrimary }]}>{meal.dishName}</Text>
                {meal.description ? (
                  <Text style={[styles.mealMenu, { color: c.textSecondary }]}>{meal.description}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  summaryCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  statNum: {
    fontSize: typography.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  allergySection: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  allergySectionTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  allergyDesc: {
    fontSize: typography.xs,
    marginBottom: spacing.sm,
  },
  allergicChildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  childName: {
    fontSize: typography.xs,
    fontWeight: '700',
    marginRight: 6,
  },
  allergenBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  mealsSchedule: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
  },
  scheduleTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyMeals: {
    fontSize: typography.xs,
    paddingVertical: spacing.md,
  },
  mealPlanItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  mealTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTime: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  mealCal: {
    fontSize: 11,
  },
  mealDish: {
    fontSize: typography.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  mealMenu: {
    fontSize: typography.xs,
    marginTop: 2,
  },
});
