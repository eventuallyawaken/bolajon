import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, LogOut, HeartPulse, User } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { useParentChildren } from '../hooks/useParentQueries';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';

export const ParentProfileScreen: React.FC = () => {
  const router = useRouter();
  const c = useThemeColors();
  const { user, activeChildId, logout } = useAuthStore();

  const childrenQuery = useParentChildren();
  const childrenList = childrenQuery.data || [];
  const child = childrenList.find((k) => k.id === activeChildId) || childrenList[0];

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber.replace(/\s+/g, '')}`);
  };

  const handleLogout = () => {
    Alert.alert('Profildan chiqish', 'Haqiqatan ham tizimdan chiqmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Chiqish',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (childrenQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <LoadingSpinner message="Profil yuklanmoqda..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Mening profilim" subtitle="Ota-ona ma’lumotlari va tibbiy karta" />

        {/* Parent Info Card */}
        <View style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <View
            style={[
              styles.userAvatar,
              { backgroundColor: c.primarySoft, borderColor: c.primaryBorder },
            ]}
          >
            <User size={26} color={c.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: c.textPrimary }]}>
              {user?.fullName || 'Ota-ona'}
            </Text>
            <Text style={[styles.userPhone, { color: c.textSecondary }]}>
              {user?.phone || ''}
            </Text>
            <View style={[styles.roleBadgeWrap, { backgroundColor: c.primarySoft }]}>
              <Text style={[styles.userRoleBadge, { color: c.primaryDark }]}>
                Ota-ona kabineti
              </Text>
            </View>
          </View>
        </View>

        {/* Child Medical Card */}
        {child && (
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
            <View style={[styles.cardHeader, { borderBottomColor: c.borderSubtle }]}>
              <HeartPulse size={20} color={c.primary} />
              <Text style={[styles.cardTitle, { color: c.textPrimary }]}>
                {child.fullName} — Tibbiy karta
              </Text>
            </View>

            <View style={styles.medRow}>
              <Text style={[styles.medLabel, { color: c.textSecondary }]}>Tug‘ilgan sana:</Text>
              <Text style={[styles.medVal, { color: c.textPrimary }]}>{child.birthDate}</Text>
            </View>

            <View style={styles.medRow}>
              <Text style={[styles.medLabel, { color: c.textSecondary }]}>Allergiyalar:</Text>
              <Text
                style={[
                  styles.medVal,
                  { color: child.allergies.length > 0 ? c.dangerText : c.textPrimary },
                ]}
              >
                {child.allergies.length > 0 ? child.allergies.join(', ') : 'Mavjud emas'}
              </Text>
            </View>

            {child.medicalNotes ? (
              <Text style={[styles.medNote, { color: c.textMuted }]}>{child.medicalNotes}</Text>
            ) : null}

            {child.vaccinations.length > 0 && (
              <View style={[styles.vaccineSection, { borderTopColor: c.borderSubtle }]}>
                <Text style={[styles.vaccineTitle, { color: c.textSecondary }]}>
                  Emlashlar tarixi:
                </Text>
                {child.vaccinations.map((vac, idx) => (
                  <View key={idx} style={styles.vaccineItem}>
                    <Text style={[styles.vaccineName, { color: c.textPrimary }]}>• {vac.name}</Text>
                    <Text style={[styles.vaccineDate, { color: c.textMuted }]}>{vac.date}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Quick Call Actions */}
        {child && (
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
            <View style={[styles.cardHeader, { borderBottomColor: c.borderSubtle }]}>
              <Phone size={18} color={c.primary} />
              <Text style={[styles.cardTitle, { color: c.textPrimary }]}>Tezkor qo‘ng‘iroqlar</Text>
            </View>

            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: c.subtle, borderColor: c.borderSubtle }]}
              onPress={() => handleCall(child.teacherPhone)}
              activeOpacity={0.75}
            >
              <View style={[styles.callIconBox, { backgroundColor: c.successBg }]}>
                <Phone size={18} color={c.success} />
              </View>
              <View style={styles.callInfo}>
                <Text style={[styles.callLabel, { color: c.textPrimary }]}>Tarbiyachiga qo‘ng‘iroq</Text>
                <Text style={[styles.callSub, { color: c.textSecondary }]}>
                  {child.teacherName} ({child.teacherPhone})
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: c.subtle, borderColor: c.borderSubtle }]}
              onPress={() => handleCall(child.emergencyPhone)}
              activeOpacity={0.75}
            >
              <View style={[styles.callIconBox, { backgroundColor: c.infoBg }]}>
                <Phone size={18} color={c.info} />
              </View>
              <View style={styles.callInfo}>
                <Text style={[styles.callLabel, { color: c.textPrimary }]}>Bog‘cha ma’muriyati</Text>
                <Text style={[styles.callSub, { color: c.textSecondary }]}>{child.emergencyPhone}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: c.surface, borderColor: c.danger }]}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <LogOut size={18} color={c.danger} />
          <Text style={[styles.logoutText, { color: c.dangerText }]}>Chiqish</Text>
        </TouchableOpacity>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  userPhone: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  roleBadgeWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  userRoleBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  cardTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  medRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  medLabel: {
    fontSize: typography.xs,
  },
  medVal: {
    fontSize: typography.xs,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  medNote: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  vaccineSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  vaccineTitle: {
    fontSize: typography.xs,
    fontWeight: '600',
    marginBottom: 6,
  },
  vaccineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  vaccineName: {
    fontSize: 12,
  },
  vaccineDate: {
    fontSize: 11,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  callIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callInfo: {
    flex: 1,
  },
  callLabel: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  callSub: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
    gap: 8,
  },
  logoutText: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
});
