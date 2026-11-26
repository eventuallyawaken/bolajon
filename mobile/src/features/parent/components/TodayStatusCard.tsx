import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, XCircle, Thermometer, ShieldCheck, Heart, AlertTriangle } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import type { TodayAttendance } from '../types';

interface TodayStatusCardProps {
  attendance: TodayAttendance | null;
}

export const TodayStatusCard: React.FC<TodayStatusCardProps> = ({ attendance }) => {
  const c = useThemeColors();

  if (!attendance) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: c.surface, borderColor: c.borderLight, shadowColor: c.shadow },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <Heart size={18} color={c.primary} />
            <Text style={[styles.cardTitle, { color: c.textPrimary }]}>Bugungi holat</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: c.subtle, borderColor: c.borderLight }]}>
            <Clock size={14} color={c.textMuted} />
            <Text style={[styles.badgeText, { color: c.textSecondary }]}>Kutilmoqda</Text>
          </View>
        </View>
        <Text style={[styles.pendingText, { color: c.textMuted }]}>
          Bugungi davomat va ertalabki tibbiy filtr hali belgilanmagan.
        </Text>
      </View>
    );
  }

  const isPresent = attendance.status === 'PRESENT';
  const isLate = attendance.status === 'LATE';

  const statusColor = isPresent ? c.successText : isLate ? c.warningText : c.dangerText;
  const statusBg = isPresent ? c.successBg : isLate ? c.warningBg : c.dangerBg;
  const statusBorder = isPresent ? c.success : isLate ? c.warning : c.danger;
  const statusText = isPresent
    ? `Keldi${attendance.checkInTime ? ` ${attendance.checkInTime}` : ''}`
    : isLate
    ? `Kechikdi${attendance.checkInTime ? ` ${attendance.checkInTime}` : ''}`
    : 'Kelmadi';

  const IconComponent = isPresent ? CheckCircle2 : isLate ? Clock : XCircle;
  const isHealthy = attendance.morningFilter.status === 'HEALTHY';
  const isHighTemp = attendance.morningFilter.temperature >= 37.2;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.borderLight, shadowColor: c.shadow },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Heart size={18} color={c.primary} />
          <Text style={[styles.cardTitle, { color: c.textPrimary }]}>Bugungi holat</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusBg, borderColor: statusBorder }]}>
          <IconComponent size={14} color={statusColor} />
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Morning Medical Filter */}
      <View style={[styles.filterBox, { backgroundColor: c.subtle, borderColor: c.borderSubtle }]}>
        <View style={styles.filterTopRow}>
          <View
            style={[
              styles.tempBadge,
              {
                backgroundColor: isHighTemp ? c.dangerBg : c.surface,
                borderColor: isHighTemp ? c.danger : c.borderLight,
              },
            ]}
          >
            <Thermometer size={15} color={isHighTemp ? c.danger : c.primary} />
            <Text style={[styles.tempText, { color: isHighTemp ? c.dangerText : c.textPrimary }]}>
              {attendance.morningFilter.temperature}°C
            </Text>
          </View>

          <View style={styles.healthStatus}>
            {isHealthy ? (
              <ShieldCheck size={16} color={c.success} />
            ) : (
              <AlertTriangle size={16} color={c.warning} />
            )}
            <Text style={[styles.healthText, { color: isHealthy ? c.successText : c.warningText }]}>
              {isHealthy ? 'Sog‘lom' : 'Kuzatuvda'}
            </Text>
          </View>
        </View>

        <Text style={[styles.inspectorText, { color: c.textSecondary }]}>
          Tekshirdi:{' '}
          <Text style={{ fontWeight: '700', color: c.textPrimary }}>
            {attendance.morningFilter.checkedBy}
          </Text>
        </Text>
        {attendance.morningFilter.note ? (
          <Text style={[styles.filterNote, { color: c.textMuted }]}>
            «{attendance.morningFilter.note}»
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 5,
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  pendingText: {
    fontSize: typography.sm,
    lineHeight: 20,
  },
  filterBox: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  filterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tempText: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  healthText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  inspectorText: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  filterNote: {
    fontSize: typography.xs,
    fontStyle: 'italic',
    marginTop: 6,
  },
});
