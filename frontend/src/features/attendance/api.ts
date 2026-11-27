import { http } from '@/shared/api/http';
import type { AttendanceRecord } from './types';

function mapRecord(r: any): AttendanceRecord {
  const fullName = r.childName || 'Tarbiyalanuvchi';
  const initials =
    r.initials ||
    fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join('') ||
    'TB';

  return {
    id: r.id,
    childId: r.childId,
    childName: fullName,
    initials,
    groupName: r.groupName || '',
    isPresent: Boolean(r.isPresent),
    temperature: Number(r.temperature ?? 36.6),
    healthStatus: (r.healthStatus as AttendanceRecord['healthStatus']) || 'healthy',
    notes: r.notes || '',
  };
}

export const attendanceApi = {
  async getAttendanceRecords(groupId: string, date?: string): Promise<AttendanceRecord[]> {
    if (!groupId) return [];
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const res = await http.get('/attendance', {
      params: { groupId, date: targetDate },
    });
    const list: any[] = res.data?.data || [];
    return list.map(mapRecord);
  },

  async markAllPresent(groupId: string, date?: string): Promise<AttendanceRecord[]> {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const res = await http.post('/attendance/mark-all-present', {
      groupId,
      date: targetDate,
    });
    const list: any[] = res.data?.data || [];
    return list.map(mapRecord);
  },

  async saveAttendance(
    groupId: string,
    date: string,
    records: AttendanceRecord[]
  ): Promise<{ presentCount: number; deductedIngredients: number; message: string }> {
    const res = await http.post('/attendance/save', {
      groupId,
      date,
      autoDeductWarehouse: true,
      records: records.map((r) => ({
        childId: r.childId,
        isPresent: r.isPresent,
        status: r.isPresent ? 'present' : 'absent',
        temperature: Number(r.temperature) || 36.6,
        healthStatus: r.healthStatus || 'healthy',
        notes: r.notes || '',
      })),
    });

    const data = res.data?.data || {};
    return {
      presentCount: Number(data.presentCount ?? records.filter((r) => r.isPresent).length),
      deductedIngredients: Number(data.deductedIngredients ?? 0),
      message: res.data?.message || 'Davomat saqlandi!',
    };
  },

  async sendSmsAlerts(
    groupId: string,
    date: string
  ): Promise<{ sentCount: number; message: string }> {
    const res = await http.post('/attendance/send-sms', { groupId, date });
    return {
      sentCount: Number(res.data?.data?.sentCount ?? 0),
      message: res.data?.message || 'Ota-onalarga bildirishnomalar yuborildi',
    };
  },
};
