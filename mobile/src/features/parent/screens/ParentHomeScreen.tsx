import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, TrendingUp, Baby } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { extractApiError } from '../../../shared/api/http';
import { useParentChildren, useChildOverview } from '../hooks/useParentQueries';
import { ChildSelectorPill } from '../components/ChildSelectorPill';
import { TodayStatusCard } from '../components/TodayStatusCard';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorState } from '../../../shared/ui/ErrorState';
import { EmptyState } from '../../../shared/ui/EmptyState';

export const ParentHomeScreen: React.FC = () => {
  const c = useThemeColors();
  const { user, activeChildId, setActiveChildId } = useAuthStore();

  const childrenQuery = useParentChildren();
  const childrenList = childrenQuery.data || [];
  const resolvedChildId =
    childrenList.find((k) => k.id === activeChildId)?.id || childrenList[0]?.id;

  useEffect(() => {
    if (resolvedChildId && resolvedChildId !== activeChildId) {
      setActiveChildId(resolvedChildId);
    }
  }, [resolvedChildId, activeChildId]);

  const overviewQuery = useChildOverview(resolvedChildId);
  const selectedChild = childrenList.find((k) => k.id === resolvedChildId);

  const onRefresh = () => {
    childrenQuery.refetch();
    overviewQuery.refetch();
  };

  if (childrenQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <LoadingSpinner message="Ma’lumotlar yuklanmoqda..." />
      </SafeAreaView>
    );
  }

  if (childrenQuery.isError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <ErrorState message={extractApiError(childrenQuery.error)} onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  if (childrenList.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <View style={styles.emptyWrap}>
          <ScreenHeader title={`Salom, ${user?.fullName?.split(' ')[0] || 'Ota-ona'}!`} />
          <EmptyState
            icon={<Baby size={40} color={c.primary} />}
            title="Farzandlar topilmadi"
            message="Telefon raqamingizga biriktirilgan tarbiyalanuvchilar hali kiritilmagan."
          />
        </View>
      </SafeAreaView>
    );
  }

  const overview = overviewQuery.data;
  const stats = overview?.monthStats;
  const notice = overview?.latestNotification;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={overviewQuery.isRefetching || childrenQuery.isRefetching}
            onRefresh={onRefresh}
            colors={[c.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={`Salom, ${user?.fullName?.split(' ')[0] || 'Ota-ona'}!`}
          subtitle={
            selectedChild
              ? `${selectedChild.fullName} • ${selectedChild.groupName}`
              : 'Farzandingiz haqida kunlik ma’lumotlar'
          }
        />

        <ChildSelectorPill
          childrenList={childrenList}
          selectedChildId={resolvedChildId || ''}
          onSelectChild={setActiveChildId}
        />

        {overviewQuery.isError ? (
          <ErrorState message={extractApiError(overviewQuery.error)} onRetry={onRefresh} />
        ) : (
          <>
            <TodayStatusCard attendance={overview?.todayAttendance ?? null} />

            {stats && (
              <View
                style={[
                  styles.statsCard,
                  { backgroundColor: c.surface, borderColor: c.borderLight, shadowColor: c.shadow },
                ]}
              >
                <View style={styles.statsHeader}>
                  <View style={styles.statsTitleRow}>
                    <TrendingUp size={18} color={c.primary} />
                    <Text style={[styles.statsTitle, { color: c.textPrimary }]}>
                      {stats.month} davomati
                    </Text>
                  </View>
                  <Text style={[styles.statsTotal, { color: c.textSecondary }]}>
                    Jami: {stats.totalDays} kun
                  </Text>
                </View>

                <View style={styles.statsGrid}>
                  <View style={[styles.statBox, { borderColor: c.success, backgroundColor: c.successBg }]}>
                    <Text style={[styles.statNum, { color: c.successText }]}>{stats.presentDays}</Text>
                    <Text style={[styles.statLabel, { color: c.textSecondary }]}>Kelgan</Text>
                  </View>

                  <View style={[styles.statBox, { borderColor: c.warning, backgroundColor: c.warningBg }]}>
                    <Text style={[styles.statNum, { color: c.warningText }]}>{stats.lateDays}</Text>
                    <Text style={[styles.statLabel, { color: c.textSecondary }]}>Kechikkan</Text>
                  </View>

                  <View style={[styles.statBox, { borderColor: c.danger, backgroundColor: c.dangerBg }]}>
                    <Text style={[styles.statNum, { color: c.dangerText }]}>{stats.absentDays}</Text>
                    <Text style={[styles.statLabel, { color: c.textSecondary }]}>Kelmagan</Text>
                  </View>
                </View>
              </View>
            )}

            {notice && (
              <View
                style={[
                  styles.noticeCard,
                  { backgroundColor: c.surface, borderColor: c.borderLight },
                ]}
              >
                <View style={[styles.noticeIconBox, { backgroundColor: c.warningBg }]}>
                  <Sparkles size={20} color={c.accent} />
                </View>
                <View style={styles.noticeContent}>
                  <Text style={[styles.noticeTitle, { color: c.textPrimary }]}>{notice.title}</Text>
                  <Text style={[styles.noticeText, { color: c.textSecondary }]}>
                    {notice.message}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    padding: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  statsTotal: {
    fontSize: typography.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNum: {
    fontSize: typography.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.xs,
    fontWeight: '500',
  },
  noticeCard: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  noticeIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: typography.xs,
    lineHeight: 18,
  },
});
