import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, AlertCircle, Phone, Users } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { extractApiError } from '../../../shared/api/http';
import { useTeacherGroups, useTeacherAttendance } from '../hooks/useTeacherQueries';
import { useSelectedGroupStore } from '../store/useSelectedGroupStore';
import type { StudentAttendanceItem } from '../types';
import { GroupSelectorBar } from '../components/GroupSelectorBar';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { Avatar } from '../../../shared/ui/Avatar';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorState } from '../../../shared/ui/ErrorState';
import { EmptyState } from '../../../shared/ui/EmptyState';

export const TeacherGroupScreen: React.FC = () => {
  const c = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { selectedGroupId, setSelectedGroupId } = useSelectedGroupStore();

  const [search, setSearch] = useState('');
  const [filterAllergyOnly, setFilterAllergyOnly] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendanceItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const currentDate = new Date().toISOString().slice(0, 10);
  const groupsQuery = useTeacherGroups();
  const groups = groupsQuery.data || [];
  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) ||
    groups.find((g) => g.id === user?.groupId || g.mainTeacher === user?.fullName) ||
    groups[0];

  const studentsQuery = useTeacherAttendance(activeGroup?.id, currentDate);
  const students = studentsQuery.data || [];

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesAllergy = filterAllergyOnly ? s.allergies.length > 0 : true;
    return matchesSearch && matchesAllergy;
  });

  if (groupsQuery.isLoading || studentsQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <LoadingSpinner message="Guruh bolalari yuklanmoqda..." />
      </SafeAreaView>
    );
  }

  if (groupsQuery.isError || studentsQuery.isError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <ErrorState
          message={extractApiError(groupsQuery.error || studentsQuery.error)}
          onRetry={() => {
            groupsQuery.refetch();
            studentsQuery.refetch();
          }}
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
            refreshing={studentsQuery.isRefetching}
            onRefresh={() => {
              studentsQuery.refetch();
            }}
            colors={[c.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Mening guruhim"
          subtitle={`${activeGroup?.name || 'Guruh'} — ${students.length} ta bola`}
        />

        <GroupSelectorBar
          groups={groups}
          selectedGroupId={activeGroup?.id || ''}
          onSelectGroup={setSelectedGroupId}
        />

        <View
          style={[
            styles.searchBar,
            { backgroundColor: c.surface, borderColor: c.borderLight },
          ]}
        >
          <Search size={18} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: c.textPrimary }]}
            placeholder="Bola ismi bo‘yicha qidirish..."
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: !filterAllergyOnly ? c.primary : c.surface,
                borderColor: !filterAllergyOnly ? c.primary : c.borderLight,
              },
            ]}
            onPress={() => setFilterAllergyOnly(false)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: !filterAllergyOnly ? '#FFFFFF' : c.textSecondary },
              ]}
            >
              Barchasi ({students.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: filterAllergyOnly ? c.danger : c.surface,
                borderColor: filterAllergyOnly ? c.danger : c.borderLight,
              },
            ]}
            onPress={() => setFilterAllergyOnly(true)}
          >
            <AlertCircle size={12} color={filterAllergyOnly ? '#FFFFFF' : c.danger} />
            <Text
              style={[
                styles.filterChipText,
                { color: filterAllergyOnly ? '#FFFFFF' : c.textSecondary },
              ]}
            >
              Allergiyasi borlar ({students.filter((s) => s.allergies.length > 0).length})
            </Text>
          </TouchableOpacity>
        </View>

        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={<Users size={38} color={c.primary} />}
            title="Bolalar topilmadi"
            message="Qidiruv so‘zingizni yoki filtrni o‘zgartirib ko‘ring."
          />
        ) : (
          filteredStudents.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.studentCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}
              onPress={() => {
                setSelectedStudent(s);
                setModalVisible(true);
              }}
              activeOpacity={0.75}
            >
              <Avatar name={s.fullName} size={44} />

              <View style={styles.studentDetails}>
                <Text style={[styles.studentName, { color: c.textPrimary }]}>{s.fullName}</Text>
                <Text style={[styles.parentName, { color: c.textSecondary }]}>
                  Ota-onasi: {s.parentName}
                </Text>

                {s.allergies.length > 0 ? (
                  <View style={[styles.allergyBadge, { backgroundColor: c.dangerBg }]}>
                    <AlertCircle size={10} color={c.dangerText} />
                    <Text style={[styles.allergyText, { color: c.dangerText }]}>
                      Allergiya: {s.allergies.join(', ')}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.safeTag, { color: c.successText }]}>Sog‘lom (Allergiyasiz)</Text>
                )}
              </View>

              <View style={[styles.callIconBox, { backgroundColor: c.primarySoft }]}>
                <Phone size={16} color={c.primary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <StudentDetailModal
        visible={modalVisible}
        student={selectedStudent}
        onClose={() => setModalVisible(false)}
      />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: {
    fontSize: typography.xs,
    fontWeight: '600',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  parentName: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  allergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  allergyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  safeTag: {
    fontSize: 11,
    marginTop: 4,
  },
  callIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
