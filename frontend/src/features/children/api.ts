import { http } from '@/shared/api/http';
import type { Child, CreateChildInput } from './types';

export const childrenApi = {
  async getChildren(): Promise<Child[]> {
    try {
      const res = await http.get('/children');
      const list = res.data.data || [];
      return list.map((c: any) => ({
        id: c.id,
        fullName: c.fullName,
        initials: c.fullName
          ? c.fullName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((w: string) => w[0].toUpperCase())
              .join('')
          : 'TB',
        birthDate: c.birthDate || '',
        gender: c.gender || 'male',
        groupName: c.groupName || 'Guruhsiz',
        parentName: c.parentName || 'Noma’lum',
        parentPhone: c.parentPhone || '',
        status: (c.status as 'active' | 'inactive') || 'active',
        registeredDate: c.registeredDate || new Date().toISOString().slice(0, 10),
        monthlyFee: typeof c.monthlyFee === 'number' ? `${c.monthlyFee.toLocaleString()} so‘m` : '1 800 000 so‘m',
      }));
    } catch {
      return [];
    }
  },

  async createChild(input: CreateChildInput): Promise<Child> {
    const res = await http.post('/children', {
      fullName: input.fullName,
      birthDate: input.birthDate || '2021-01-01',
      gender: input.gender || 'male',
      groupId: input.groupName, // backend can accept group name or ID
      parentName: input.parentName,
      parentPhone: input.parentPhone,
      parentRelation: 'Ota-onasi',
      monthlyFee: 1800000,
    });
    const c = res.data.data;
    return {
      id: c.id,
      fullName: c.fullName,
      initials: c.fullName
        ? c.fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w: string) => w[0].toUpperCase())
            .join('')
        : 'TB',
      birthDate: typeof c.birthDate === 'string' ? c.birthDate : new Date(c.birthDate).toISOString().slice(0, 10),
      gender: c.gender,
      groupName: c.group?.name || input.groupName,
      parentName: input.parentName,
      parentPhone: input.parentPhone,
      status: 'active',
      registeredDate: new Date().toISOString().slice(0, 10),
      monthlyFee: '1 800 000 so‘m',
    };
  },

  async deleteChild(id: string): Promise<string> {
    await http.delete(`/children/${id}`);
    return id;
  },
};
