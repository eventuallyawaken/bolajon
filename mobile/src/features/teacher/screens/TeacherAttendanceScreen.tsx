import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users } from 'lucide-react-native';
import { spacing } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { extractApiError } from '../../../shared/api/http';
import {
  useTeacherGroups,
  useTeacherAttendance,
  useSaveAttendanceMutation,
} from '../hooks/useTeacherQueries';
import { useSelectedGroupStore } from '../store/useSelectedGroupStore';
import type { StudentAttendanceItem, AttendanceStatus } from '../types';
import { GroupSelectorBar } from '../components/GroupSelectorBar';
import { AttendanceCounterBar } from '../components/AttendanceCounterBar';
import { AttendanceRow } from '../components/AttendanceRow';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Button } from '../../../shared/ui/Button';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorState } from '../../../shared/ui/ErrorState';
import { EmptyState } from '../../../shared/ui/EmptyState';

export const TeacherAttendanceScreen: React.FC = () => {
  const c = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { selectedGroupId, setSelectedGroupId } = useSelectedGroupStore();

  const currentDate = new Date().toISOString().slice(0, 10);
  const groupsQuery = useTeacherGroups();
  const groups = groupsQuery.data || [];

  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) ||
    groups.find((g) => g.id === user?.groupId || g.mainTeacher === user?.fullName) ||
    groups[0];

  const attendanceQuery = useTeacherAttendance(activeGroup?.id, currentDate);
  const saveMutation = useSaveAttendanceMutation();

  const [students, setStudents] = useState<StudentAttendanceItem[]>([]);
  const [isModified, setIsModified] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendanceItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (activeGroup?.id && !selectedGroupId) {
      setSelectedGroupId(activeGroup.id);
    }
  }, [activeGroup?.id, selectedGroupId]);

  useEffect(() => {
    if (attendanceQuery.data) {
      setStudents(attendanceQuery.data);
      setIsModified(false);
    }
  }, [attendanceQuery.data]);

  const onRefresh = () => {
    groupsQuery.refetch();
    attendanceQuery.refetch();
  };

  const handleStatusChange = (index: number, newStatus: AttendanceStatus) => {
    setStudents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
    setIsModified(true);
  };

  const handleTempChange = (index: number, newTemp: number) => {
    setStudents((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        morningFilter: { ...updated[index].morningFilter, temperature: newTemp },
      };
      return updated;
    });
    setIsModified(true);
  };

  const handleHealthToggle = (index: number) => {
    setStudents((prev) => {
      const updated = [...prev];
      const cur = updated[index].morningFilter.status;
      updated[index] = {
        ...updated[index],
        morningFilter: {
          ...updated[index].morningFilter,
          status: cur === 'HEALTHY' ? 'OBSERVATION' : 'HEALTHY',
        },
      };
      return updated;
    });
    setIsModified(true);
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'PRESENT',
        morningFilter: { ...s.morningFilter, status: 'HEALTHY' },
      }))
    );
    setIsModified(true);
  };

  const handleSave = async () => {
    if (!activeGroup) return;
    try {
      const res = await saveMutation.mutateAsync({
        groupId: activeGroup.id,
        date: currentDate,
        records: students,
      });
      Alert.alert('Muvaffaqiyatli', res.message);
      setIsModified(false);
    } catch (err) {
      Alert.alert('Xatolik', extractApiError(err, 'Davomatni saqlashda xatolik yuz berdi'));
    }
  };

  if (groupsQuery.isLoading || attendanceQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <LoadingSpinner message="Davomat ro‘yxati yuklanmoqda..." />
      </SafeAreaView>
    );
  }

  if (groupsQuery.isError || attendanceQuery.isError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <ErrorState
          message={extractApiError(groupsQuery.error || attendanceQuery.error)}
          onRetry={onRefresh}
        />
      </SafeAreaView>
    );
  }

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const lateCount = students.filter((s) => s.status === 'LATE').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={attendanceQuery.isRefetching}
            onRefresh={onRefresh}
            colors={[c.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={activeGroup?.name || 'Davomat'}
          subtitle={`Bugungi davomat va tibbiy filtr (${currentDate})`}
        />

        <GroupSelectorBar
          groups={groups}
          selectedGroupId={activeGroup?.id || ''}
          onSelectGroup={setSelectedGroupId}
        />

        {students.length === 0 ? (
          <EmptyState
            icon={<Users size={38} color={c.primary} />}
            title="Guruhda bolalar yo‘q"
            message="Bu guruhga hali tarbiyalanuvchilar biriktirilmagan."
          />
        ) : (
          <>
            <AttendanceCounterBar
              total={students.length}
              present={presentCount}
              late={lateCount}
              absent={absentCount}
              onMarkAllPresent={handleMarkAllPresent}
            />

            {students.map((student, idx) => (
              <AttendanceRow
                key={student.id}
                student={student}
                onStatusChange={(status) => handleStatusChange(idx, status)}
                onTempChange={(temp) => handleTempChange(idx, temp)}
                onHealthStatusToggle={() => handleHealthToggle(idx)}
                onPressDetails={() => {
                  setSelectedStudent(student);
                  setModalVisible(true);
                }}
              />
            ))}
          </>
        )}
      </ScrollView>

      {students.length > 0 && (
        <View
          style={[
            styles.stickyFooter,
            { backgroundColor: c.surface, borderTopColor: c.borderLight, shadowColor: c.shadow },
          ]}
        >
          <Button
            title={isModified ? 'Davomatni saqlash (O‘zgarishlar bor)' : 'Davomatni saqlash'}
            onPress={handleSave}
            loading={saveMutation.isPending}
            variant={isModified ? 'primary' : 'outline'}
          />
        </View>
      )}

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
    paddingBottom: 92,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
});
