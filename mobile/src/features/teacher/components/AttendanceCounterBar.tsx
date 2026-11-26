import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCheck } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';

interface AttendanceCounterBarProps {
  total: number;
  present: number;
  late: number;
  absent: number;
  onMarkAllPresent: () => void;
}

export const AttendanceCounterBar: React.FC<AttendanceCounterBarProps> = ({
  total,
  present,
  late,
  absent,
  onMarkAllPresent,
}) => {
  const c = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.surface, borderColor: c.borderLight, shadowColor: c.shadow },
      ]}
    >
      <View style={styles.counterRow}>
        <View style={[styles.counterBox, { backgroundColor: c.successBg, borderColor: c.success }]}>
          <Text style={[styles.countNum, { color: c.successText }]}>{present}</Text>
          <Text style={[styles.countLabel, { color: c.textSecondary }]}>Keldi</Text>
        </View>

        <View style={[styles.counterBox, { backgroundColor: c.warningBg, borderColor: c.warning }]}>
          <Text style={[styles.countNum, { color: c.warningText }]}>{late}</Text>
          <Text style={[styles.countLabel, { color: c.textSecondary }]}>Kechikdi</Text>
        </View>

        <View style={[styles.counterBox, { backgroundColor: c.dangerBg, borderColor: c.danger }]}>
          <Text style={[styles.countNum, { color: c.dangerText }]}>{absent}</Text>
          <Text style={[styles.countLabel, { color: c.textSecondary }]}>Kelmadi</Text>
        </View>

        <View style={[styles.counterBox, { backgroundColor: c.subtle, borderColor: c.borderLight }]}>
          <Text style={[styles.countNum, { color: c.textPrimary }]}>{total}</Text>
          <Text style={[styles.countLabel, { color: c.textSecondary }]}>Jami</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.markAllBtn, { backgroundColor: c.primarySoft, borderColor: c.primary }]}
        onPress={onMarkAllPresent}
        activeOpacity={0.8}
      >
        <CheckCheck size={16} color={c.primary} />
        <Text style={[styles.markAllText, { color: c.primaryDark }]}>
          Barchasini keldi belgilash
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  counterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  counterBox: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  countNum: {
    fontSize: typography.xl,
    fontWeight: '700',
  },
  countLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  markAllText: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
});
