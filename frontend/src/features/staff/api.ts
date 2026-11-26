import { http } from '@/shared/api/http';
import type { StaffMember, CreateStaffInput } from './types';

export const staffApi = {
  async getStaffList(search?: string): Promise<StaffMember[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await http.get(`/staff?${params.toString()}`);
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async createStaff(input: CreateStaffInput): Promise<StaffMember> {
    const res = await http.post('/staff', input);
    return res.data.data;
  },

  async deleteStaff(id: string): Promise<void> {
    await http.delete(`/staff/${id}`);
  },
};
