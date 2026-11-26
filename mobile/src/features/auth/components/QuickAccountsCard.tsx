import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Baby, UserCheck } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';

interface QuickAccountsCardProps {
  useMock: boolean;
  onSelect: (role: 'parent' | 'teacher', presetPhone: string) => void;
}

export const QuickAccountsCard: React.FC<QuickAccountsCardProps> = ({ useMock, onSelect }) => {
  const c = useThemeColors();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: c.textMuted }]}>
        {useMock
          ? 'Tezkor sinov hisoblari (Offline demo):'
          : 'Tezkor to‘ldirish (Haqiqiy DB hisoblari):'}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.surface, borderColor: c.borderLight }]}
        onPress={() => onSelect('parent', '+998 90 777 88 99')}
        activeOpacity={0.75}
      >
        <View style={[styles.iconBox, { backgroundColor: c.infoBg }]}>
          <Baby size={20} color={c.info} />
        </View>
        <View style={styles.textBox}>
          <Text style={[styles.btnText, { color: c.textPrimary }]}>Ota-ona (Shavkat Rahimov)</Text>
          <Text style={[styles.btnSub, { color: c.textSecondary }]}>+998 90 777 88 99</Text>
        </View>
        <Text style={[styles.actionText, { color: c.primary }]}>
          {useMock ? 'Kirish →' : 'To‘ldirish'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.surface, borderColor: c.borderLight }]}
        onPress={() => onSelect('teacher', '+998 90 234 11 22')}
        activeOpacity={0.75}
      >
        <View style={[styles.iconBox, { backgroundColor: c.primarySoft }]}>
          <UserCheck size={20} color={c.primary} />
        </View>
        <View style={styles.textBox}>
          <Text style={[styles.btnText, { color: c.textPrimary }]}>Tarbiyachi (Zilola Rahimova)</Text>
          <Text style={[styles.btnSub, { color: c.textSecondary }]}>+998 90 234 11 22</Text>
        </View>
        <Text style={[styles.actionText, { color: c.primary }]}>
          {useMock ? 'Kirish →' : 'To‘ldirish'}
        </Text>
      </TouchableOpacity>

      {!useMock && (
        <Text style={[styles.hintText, { color: c.textMuted }]}>
          Standart parol: Password123!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xs,
  },
  title: {
    fontSize: typography.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textBox: {
    flex: 1,
  },
  btnText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  btnSub: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  actionText: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
