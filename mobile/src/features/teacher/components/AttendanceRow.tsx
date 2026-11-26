import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, Thermometer, Clock } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { Avatar } from '../../../shared/ui/Avatar';
import { StatusToggle } from '../../../shared/ui/StatusToggle';
import type { StudentAttendanceItem, AttendanceStatus } from '../types';

interface AttendanceRowProps {
  student: StudentAttendanceItem;
  onStatusChange: (status: AttendanceStatus) => void;
  onTempChange: (temp: number) => void;
  onHealthStatusToggle: () => void;
  onPressDetails?: () => void;
}

export const AttendanceRow: React.FC<AttendanceRowProps> = ({
  student,
  onStatusChange,
  onTempChange,
  onHealthStatusToggle,
  onPressDetails,
}) => {
  const c = useThemeColors();
  const isHealthy = student.morningFilter.status === 'HEALTHY';
  const isPresentOrLate = student.status !== 'ABSENT';
  const isLate = student.status === 'LATE';
  const isFever = student.morningFilter.temperature >= 37.2;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.borderLight, shadowColor: c.shadow },
      ]}
    >
      {/* Top Row: Student info + Web-matched StatusToggle switch */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.studentInfoRow}
          onPress={onPressDetails}
          activeOpacity={0.7}
        >
          <Avatar name={student.fullName} size={40} />
          <View style={styles.nameContainer}>
            <Text style={[styles.studentName, { color: c.textPrimary }]} numberOfLines={1}>
              {student.fullName}
            </Text>
            {student.allergies.length > 0 ? (
              <View style={[styles.allergyBadge, { backgroundColor: c.dangerBg, borderColor: c.danger }]}>
                <AlertCircle size={10} color={c.dangerText} />
                <Text style={[styles.allergyText, { color: c.dangerText }]} numberOfLines={1}>
                  {student.allergies.join(', ')}
                </Text>
              </View>
            ) : (
              <Text style={[styles.statusSub, { color: isPresentOrLate ? c.successText : c.textMuted }]}>
                {isLate ? 'Kechikib keldi' : isPresentOrLate ? 'Keldi' : 'Kelmadi'}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.switchWrap}>
          {isPresentOrLate && (
            <TouchableOpacity
              onPress={() => onStatusChange(isLate ? 'PRESENT' : 'LATE')}
              style={[
                styles.lateBtn,
                {
                  backgroundColor: isLate ? c.warningBg : c.subtle,
                  borderColor: isLate ? c.warning : c.borderSubtle,
                },
              ]}
              activeOpacity={0.75}
            >
              <Clock size={12} color={isLate ? c.warningText : c.textMuted} />
              <Text style={[styles.lateText, { color: isLate ? c.warningText : c.textMuted }]}>
                Kechikdi
              </Text>
            </TouchableOpacity>
          )}
          <StatusToggle
            checked={isPresentOrLate}
            onToggle={(checked) => onStatusChange(checked ? 'PRESENT' : 'ABSENT')}
          />
        </View>
      </View>

      {/* Morning Medical Filter Bar (matching attendance.css) */}
      <View style={[styles.medicalRow, { borderTopColor: c.borderSubtle }]}>
        <View
          style={[
            styles.tempSelector,
            {
              backgroundColor: isFever ? c.dangerBg : c.subtle,
              borderColor: isFever ? c.danger : c.borderSubtle,
            },
          ]}
        >
          <Thermometer size={14} color={isFever ? c.danger : c.primary} />
          <TouchableOpacity
            onPress={() => onTempChange(Math.max(35.0, Number((student.morningFilter.temperature - 0.1).toFixed(1))))}
            style={[styles.stepperBtn, { backgroundColor: c.surface }]}
          >
            <Text style={[styles.stepperText, { color: c.textPrimary }]}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.tempVal, { color: isFever ? c.dangerText : c.textPrimary }]}>
            {student.morningFilter.temperature.toFixed(1)}°C
          </Text>
          <TouchableOpacity
            onPress={() => onTempChange(Math.min(41.0, Number((student.morningFilter.temperature + 0.1).toFixed(1))))}
            style={[styles.stepperBtn, { backgroundColor: c.surface }]}
          >
            <Text style={[styles.stepperText, { color: c.textPrimary }]}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.healthPill,
            {
              backgroundColor: isHealthy ? c.successBg : c.warningBg,
              borderColor: isHealthy ? c.success : c.warning,
            },
          ]}
          onPress={onHealthStatusToggle}
          activeOpacity={0.75}
        >
          <Text style={[styles.healthPillText, { color: isHealthy ? c.successText : c.warningText }]}>
            {isHealthy ? '✓ Sog‘lom' : '⚠ Kuzatuvda'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  studentInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  studentName: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  allergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginTop: 2,
    borderWidth: 0.5,
  },
  allergyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  switchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  lateText: {
    fontSize: 10,
    fontWeight: '700',
  },
  medicalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  tempSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 6,
  },
  stepperBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  stepperText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tempVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  healthPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  healthPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
