import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '../api';
import type { StudentAttendanceItem } from '../types';

export const teacherQueryKeys = {
  groups: ['teacher', 'groups'] as const,
  attendance: (groupId: string, date: string) => ['teacher', 'attendance', groupId, date] as const,
  portions: (groupId: string, date: string) => ['teacher', 'portions', groupId, date] as const,
};

export function useTeacherGroups() {
  return useQuery({
    queryKey: teacherQueryKeys.groups,
    queryFn: teacherApi.getGroups,
  });
}

export function useTeacherAttendance(groupId?: string, date?: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: teacherQueryKeys.attendance(groupId || '', targetDate),
    queryFn: () => teacherApi.getStudentsAttendance(groupId!, targetDate),
    enabled: Boolean(groupId),
  });
}

export function useSaveAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      date,
      records,
    }: {
      groupId: string;
      date: string;
      records: StudentAttendanceItem[];
    }) => teacherApi.saveAttendance(groupId, date, records),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.attendance(vars.groupId, vars.date) });
      queryClient.invalidateQueries({ queryKey: teacherQueryKeys.portions(vars.groupId, vars.date) });
    },
  });
}

export function useTeacherMenuPortions(groupId?: string, date?: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: teacherQueryKeys.portions(groupId || '', targetDate),
    queryFn: () => teacherApi.getPortionSummary(groupId!, targetDate),
    enabled: Boolean(groupId),
  });
}
