import { http } from '@/shared/api/http';
import type { KindergartenGroup, CreateGroupInput } from './types';

export const groupsApi = {
  async getGroups(): Promise<KindergartenGroup[]> {
    try {
      const res = await http.get('/groups');
      const list = res.data.data || [];
      return list.map((g: any) => ({
        id: g.id,
        name: g.name,
        ageRange: g.ageRange,
        roomNumber: g.roomNumber,
        mainTeacher: g.mainTeacherName || g.mainTeacher,
        assistantTeacher: g.assistantTeacher || 'Yordamchi biriktirilmagan',
        currentCount: g.currentCount || 0,
        capacity: g.capacity,
        colorTag: g.colorTag || '#0d9488',
      }));
    } catch {
      return [];
    }
  },

  async createGroup(input: CreateGroupInput): Promise<KindergartenGroup> {
    const res = await http.post('/groups', {
      name: input.name,
      ageRange: input.ageRange,
      roomNumber: input.roomNumber,
      mainTeacherName: input.mainTeacher,
      capacity: Number(input.capacity) || 25,
      colorTag: '#0d9488',
    });
    const g = res.data.data;
    return {
      id: g.id,
      name: g.name,
      ageRange: g.ageRange,
      roomNumber: g.roomNumber,
      mainTeacher: g.mainTeacherName,
      assistantTeacher: g.assistantTeacher || 'Yordamchi biriktirilmagan',
      currentCount: 0,
      capacity: g.capacity,
      colorTag: g.colorTag || '#0d9488',
    };
  },

  async updateGroup(id: string, input: Partial<CreateGroupInput>): Promise<KindergartenGroup> {
    const res = await http.put(`/groups/${id}`, {
      ...(input.name && { name: input.name }),
      ...(input.ageRange && { ageRange: input.ageRange }),
      ...(input.roomNumber && { roomNumber: input.roomNumber }),
      ...(input.mainTeacher && { mainTeacherName: input.mainTeacher }),
      ...(input.capacity && { capacity: Number(input.capacity) }),
    });
    const g = res.data.data;
    return {
      id: g.id,
      name: g.name,
      ageRange: g.ageRange,
      roomNumber: g.roomNumber,
      mainTeacher: g.mainTeacherName || g.mainTeacher,
      assistantTeacher: g.assistantTeacher || 'Yordamchi biriktirilmagan',
      currentCount: g.currentCount || 0,
      capacity: g.capacity,
      colorTag: g.colorTag || '#0d9488',
    };
  },

  async deleteGroup(id: string): Promise<void> {
    await http.delete(`/groups/${id}`);
  },
};
