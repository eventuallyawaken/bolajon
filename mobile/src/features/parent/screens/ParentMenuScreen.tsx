import React from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utensils } from 'lucide-react-native';
import { spacing } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { extractApiError } from '../../../shared/api/http';
import { useParentChildren, useParentMenu } from '../hooks/useParentQueries';
import { MealCard } from '../components/MealCard';
import { AllergyBanner } from '../components/AllergyBanner';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorState } from '../../../shared/ui/ErrorState';
import { EmptyState } from '../../../shared/ui/EmptyState';

export const ParentMenuScreen: React.FC = () => {
  const c = useThemeColors();
  const { activeChildId } = useAuthStore();

  const childrenQuery = useParentChildren();
  const childrenList = childrenQuery.data || [];
  const selectedChild = childrenList.find((k) => k.id === activeChildId) || childrenList[0];

  const menuQuery = useParentMenu(selectedChild?.id);

  const onRefresh = () => {
    childrenQuery.refetch();
    menuQuery.refetch();
  };

  if (childrenQuery.isLoading || menuQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <LoadingSpinner message="Taomnoma yuklanmoqda..." />
      </SafeAreaView>
    );
  }

  if (menuQuery.isError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <ErrorState message={extractApiError(menuQuery.error)} onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  const meals = menuQuery.data || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={menuQuery.isRefetching}
            onRefresh={onRefresh}
            colors={[c.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Kunlik taomnoma"
          subtitle={selectedChild?.branchName || 'Sanitariya me’yorlariga mos taomlar'}
        />

        {selectedChild?.allergies && selectedChild.allergies.length > 0 && (
          <AllergyBanner allergies={selectedChild.allergies} />
        )}

        {meals.length === 0 ? (
          <EmptyState
            icon={<Utensils size={38} color={c.primary} />}
            title="Taomnoma kiritilmagan"
            message="Oshxona bo‘limidan kunlik taomnoma qo‘shilgach bu yerda ko‘rinadi."
          />
        ) : (
          meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              childAllergies={selectedChild?.allergies || []}
            />
          ))
        )}
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
});
