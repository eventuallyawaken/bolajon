import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Phone, AlertCircle, X } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { Avatar } from '../../../shared/ui/Avatar';
import type { StudentAttendanceItem } from '../types';

interface StudentDetailModalProps {
  visible: boolean;
  student: StudentAttendanceItem | null;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  visible,
  student,
  onClose,
}) => {
  const c = useThemeColors();
  if (!student) return null;

  const handleCallParent = () => {
    if (!student.parentPhone) return;
    Linking.openURL(`tel:${student.parentPhone.replace(/\s+/g, '')}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: c.surface }]}>
          <View style={styles.header}>
            <View style={styles.profileRow}>
              <Avatar name={student.fullName} size={48} />
              <View style={styles.profileInfo}>
                <Text style={[styles.name, { color: c.textPrimary }]}>{student.fullName}</Text>
                <Text style={[styles.subText, { color: c.textSecondary }]}>
                  Tug‘ilgan sana: {student.birthDate || '-'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: c.subtle, borderColor: c.borderSubtle }]}>
            <View style={styles.cardHeader}>
              <AlertCircle
                size={18}
                color={student.allergies.length > 0 ? c.danger : c.success}
              />
              <Text style={[styles.cardTitle, { color: c.textPrimary }]}>
                Allergiyalar haqida ma’lumot
              </Text>
            </View>
            {student.allergies.length > 0 ? (
              <View style={styles.allergyPillRow}>
                {student.allergies.map((alg, i) => (
                  <View
                    key={i}
                    style={[
                      styles.allergyPill,
                      { backgroundColor: c.dangerBg, borderColor: c.danger },
                    ]}
                  >
                    <Text style={[styles.allergyPillText, { color: c.dangerText }]}>{alg}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.normalText, { color: c.textSecondary }]}>
                Allergiya qayd etilmagan
              </Text>
            )}
            {student.medicalNote ? (
              <Text style={[styles.medicalNote, { color: c.textMuted }]}>
                Eslatma: {student.medicalNote}
              </Text>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: c.subtle, borderColor: c.borderSubtle }]}>
            <View style={styles.cardHeader}>
              <Phone size={18} color={c.primary} />
              <Text style={[styles.cardTitle, { color: c.textPrimary }]}>Ota-ona bilan aloqa</Text>
            </View>
            <View style={styles.parentRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.parentName, { color: c.textPrimary }]}>
                  {student.parentName}
                </Text>
                <Text style={[styles.parentPhone, { color: c.textSecondary }]}>
                  {student.parentPhone || 'Telefon kiritilmagan'}
                </Text>
              </View>
              {student.parentPhone ? (
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: c.success }]}
                  onPress={handleCallParent}
                  activeOpacity={0.8}
                >
                  <Phone size={16} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>Qo‘ng‘iroq</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.closeActionBtn,
              { backgroundColor: c.subtle, borderColor: c.borderLight },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.closeActionText, { color: c.textSecondary }]}>Yopish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  subText: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  allergyPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  allergyPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  allergyPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  normalText: {
    fontSize: 12,
  },
  medicalNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  parentName: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  parentPhone: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
  },
  callBtnText: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeActionBtn: {
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  closeActionText: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
});
