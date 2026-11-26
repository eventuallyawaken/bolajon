import { http } from '@/shared/api/http';
import type { AttendanceRecord } from './types';

let localCache: AttendanceRecord[] = [];

export const attendanceApi = {
  async getAttendanceRecords(date?: string): Promise<AttendanceRecord[]> {
    try {
      const today = date || new Date().toISOString().slice(0, 10);
      const res = await http.get(`/attendance?date=${today}`);
      const list = res.data.data || [];

      if (list.length === 0) {
        const childrenRes = await http.get('/children');
        const children = childrenRes.data.data || [];
        localCache = children.map((c: any) => {
          const initials = c.fullName
            ? c.fullName.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join('')
            : 'TB';
          return {
            id: `att-${c.id}`,
            childId: c.id,
            childName: c.fullName,
            initials,
            groupName: c.groupName || 'Kichkintoylar',
            isPresent: true,
            temperature: 36.6,
            healthStatus: 'healthy' as const,
            notes: '',
          };
        });
        return localCache;
      }

      localCache = list.map((r: any) => ({
        id: r.id,
        childId: r.childId,
        childName: r.childName,
        initials: r.initials || 'TB',
        groupName: r.groupName,
        isPresent: r.isPresent,
        temperature: r.temperature || 36.6,
        healthStatus: (r.healthStatus as any) || 'healthy',
        notes: r.notes || '',
      }));
      return localCache;
    } catch {
      return [];
    }
  },

  async updateAttendanceRecord(id: string, patch: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const idx = localCache.findIndex((r) => r.id === id);
    if (idx !== -1) {
      localCache[idx] = { ...localCache[idx], ...patch };
      return { ...localCache[idx] };
    }
    throw new Error('Record not found');
  },

  async markAllPresent(): Promise<AttendanceRecord[]> {
    localCache = localCache.map((r) => ({ ...r, isPresent: true }));
    return [...localCache];
  },

  async saveAttendance(date?: string, records?: AttendanceRecord[]): Promise<boolean> {
    try {
      const listToSave = records || localCache;
      const today = date || new Date().toISOString().slice(0, 10);
      await http.post('/attendance', {
        date: today,
        records: listToSave.map((r) => ({
          childId: r.childId,
          isPresent: r.isPresent,
          temperature: Number(r.temperature) || 36.6,
          healthStatus: r.healthStatus,
          notes: r.notes,
        })),
      });
      return true;
    } catch {
      return false;
    }
  },
};
