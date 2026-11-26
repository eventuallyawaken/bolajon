import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, LogOut, School } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { useServerConfig } from '../../../shared/config/serverConfig';
import { useTeacherGroups } from '../hooks/useTeacherQueries';
import { useSelectedGroupStore } from '../store/useSelectedGroupStore';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';

export const TeacherProfileScreen: React.FC = () => {
  const router = useRouter();
  const c = useThemeColors();
  const { user, logout } = useAuthStore();
  const { apiUrl, useMock } = useServerConfig();
  const selectedGroupId = useSelectedGroupStore((s) => s.selectedGroupId);

  const groupsQuery = useTeacherGroups();
  const groups = groupsQuery.data || [];
  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) ||
    groups.find((g) => g.id === user?.groupId || g.mainTeacher === user?.fullName) ||
    groups[0];

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Xodim kabineti"
          subtitle="Shaxsiy ma’lumotlar va biriktirilgan guruh"
        />

        {/* Teacher Card */}
        <View style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <View
            style={[
              styles.avatarBox,
              { backgroundColor: c.primarySoft, borderColor: c.primaryBorder },
            ]}
          >
            <User size={28} color={c.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: c.textPrimary }]}>
              {user?.fullName || 'Tarbiyachi'}
            </Text>
            <Text style={[styles.userPhone, { color: c.textSecondary }]}>
              {user?.phone || ''}
            </Text>
            <View style={[styles.badge, { backgroundColor: c.primarySoft }]}>
              <Text style={[styles.badgeText, { color: c.primaryDark }]}>
                {user?.rawRole?.toUpperCase() || 'TARBIYACHI'}
              </Text>
            </View>
          </View>
        </View>

        {/* Group & Branch Info Card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
          <View style={[styles.cardHeader, { borderBottomColor: c.borderSubtle }]}>
            <School size={18} color={c.primary} />
            <Text style={[styles.cardTitle, { color: c.textPrimary }]}>
              Biriktirilgan guruh va filial
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Bog‘cha:</Text>
            <Text style={[styles.infoVal, { color: c.textPrimary }]}>
              {user?.tenantName || 'Bolajon ERP'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Filial:</Text>
            <Text style={[styles.infoVal, { color: c.textPrimary }]}>
              {user?.branchName || 'Asosiy filial'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Guruh nomi:</Text>
            <Text style={[styles.infoVal, { color: c.textPrimary }]}>
              {activeGroup?.name || user?.groupName || 'Kichkintoylar guruhi'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Bolalar yoshi / soni:</Text>
            <Text style={[styles.infoVal, { color: c.textPrimary }]}>
              {activeGroup ? `${activeGroup.ageRange} • ${activeGroup.currentCount} nafar` : '-'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Server holati:</Text>
            <Text style={[styles.infoVal, { color: useMock ? c.warningText : c.successText }]}>
              {useMock ? 'Offline Demo' : apiUrl.replace(/^https?:\/\//, '')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: c.surface, borderColor: c.danger }]}
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
  avatarBox: {
    width: 56,
    height: 56,
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
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  badgeText: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 8,
  },
  infoLabel: {
    fontSize: typography.xs,
  },
  infoVal: {
    fontSize: typography.xs,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  logoutBtn: {
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
