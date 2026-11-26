import { http, isMockMode } from '../../shared/api/http';
import type {
  TeacherGroup,
  StudentAttendanceItem,
  AttendanceStatus,
  PortionSummary,
  TeacherDailyMeal,
} from './types';
import { mockTeacherStudents, mockPortionSummary } from './mock';

function mapStatusFromBackend(raw?: string, isPresent?: boolean): AttendanceStatus {
  const s = (raw || '').toLowerCase();
  if (s === 'late') return 'LATE';
  if (s === 'absent' || s === 'excused' || isPresent === false) return 'ABSENT';
  return 'PRESENT';
}

function mapStatusToBackend(status: AttendanceStatus): { isPresent: boolean; status: 'present' | 'late' | 'absent' } {
  if (status === 'LATE') return { isPresent: true, status: 'late' };
  if (status === 'ABSENT') return { isPresent: false, status: 'absent' };
  return { isPresent: true, status: 'present' };
}

export const teacherApi = {
  getGroups: async (): Promise<TeacherGroup[]> => {
    if (isMockMode()) {
      return [
        {
          id: 'grp-kichkintoylar',
          name: 'Kichkintoylar guruhi',
          ageRange: '2-3 yosh',
          roomNumber: '101',
          mainTeacher: 'Zilola Rahimova',
          currentCount: mockTeacherStudents.length,
          capacity: 25,
        },
      ];
    }

    const response = await http.get('/groups');
    return response.data?.data || [];
  },

  getStudentsAttendance: async (groupId: string, date: string): Promise<StudentAttendanceItem[]> => {
    if (isMockMode()) {
      return mockTeacherStudents;
    }

    const response = await http.get('/attendance', {
      params: { groupId, date },
    });
    const list: any[] = response.data?.data || [];

    return list.map((row) => ({
      id: row.childId,
      fullName: row.childName,
      birthDate: row.birthDate || '',
      status: mapStatusFromBackend(row.status, row.isPresent),
      allergies: Array.isArray(row.allergies) ? row.allergies : [],
      morningFilter: {
        temperature: Number(row.temperature ?? 36.6),
        status: (row.healthStatus || 'healthy').toLowerCase() === 'healthy' ? 'HEALTHY' : 'OBSERVATION',
        note: row.notes || undefined,
      },
      parentName: row.parentName || 'Ota-ona',
      parentPhone: row.parentPhone || '',
      medicalNote: row.medicalNotes || '',
    }));
  },

  saveAttendance: async (
    groupId: string,
    date: string,
    records: StudentAttendanceItem[]
  ): Promise<{ success: boolean; message: string }> => {
    if (isMockMode()) {
      return { success: true, message: 'Davomat muvaffaqiyatli saqlandi!' };
    }

    const response = await http.post('/attendance/save', {
      groupId,
      date,
      autoDeductWarehouse: true,
      records: records.map((r) => {
        const mapped = mapStatusToBackend(r.status);
        return {
          childId: r.id,
          isPresent: mapped.isPresent,
          status: mapped.status,
          temperature: r.morningFilter.temperature,
          healthStatus: r.morningFilter.status === 'HEALTHY' ? 'healthy' : 'flu',
          notes: r.morningFilter.note || '',
        };
      }),
    });

    return {
      success: Boolean(response.data?.success ?? true),
      message: response.data?.message || 'Davomat muvaffaqiyatli saqlandi!',
    };
  },

  getPortionSummary: async (groupId: string, date: string): Promise<PortionSummary> => {
    if (isMockMode()) {
      return {
        ...mockPortionSummary,
        meals: [
          { id: 'm1', mealType: 'Nonushta', dishName: 'Suli bo‘tqasi sariyog‘ bilan', description: 'Pishloqli non, shirin choy', calories: '320 kkal', time: '08:30' },
          { id: 'm2', mealType: '2-Nonushta', dishName: 'Olma sharbati va pechenye', description: '', calories: '120 kkal', time: '10:30' },
          { id: 'm3', mealType: 'Tushlik', dishName: 'Frikadelkali sho‘rva va grechka', description: 'Mol go‘shtli podliv, karam salati', calories: '540 kkal', time: '12:30' },
          { id: 'm4', mealType: 'Tolma choy', dishName: 'Tvorogli quymoq (sirnik)', description: 'Yalpizli choy', calories: '210 kkal', time: '15:45' },
          { id: 'm5', mealType: 'Kechki ovqat', dishName: 'Sabzavotli ragu tovuq go‘shti bilan', description: 'Kompot', calories: '380 kkal', time: '17:30' },
        ],
      };
    }

    const [attendanceList, menuRes] = await Promise.all([
      teacherApi.getStudentsAttendance(groupId, date),
      http.get('/warehouse/menu'),
    ]);

    const presentStudents = attendanceList.filter((s) => s.status !== 'ABSENT');
    const allergicStudents = attendanceList
      .filter((s) => s.allergies.length > 0)
      .map((s) => ({
        studentName: s.fullName,
        allergen: s.allergies.join(', '),
      }));

    const presentAllergic = presentStudents.filter((s) => s.allergies.length > 0).length;
    const rawMenus: any[] = menuRes.data?.data || [];

    const meals: TeacherDailyMeal[] = rawMenus.map((m) => ({
      id: m.id,
      mealType: m.mealType,
      dishName: m.dishName,
      description: m.description || '',
      calories: m.calories || '',
      time: m.time || '',
    }));

    return {
      date,
      totalPresent: presentStudents.length,
      standardPortions: Math.max(0, presentStudents.length - presentAllergic),
      dietPortions: presentAllergic,
      allergicStudents,
      meals,
    };
  },
};
