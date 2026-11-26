import { http } from '@/shared/api/http';
import type { BranchItem, CreateBranchInput } from './types';

const listeners = new Set<() => void>();

export const branchesApi = {
  async getBranches(): Promise<BranchItem[]> {
    try {
      const res = await http.get('/branches');
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async createBranch(input: CreateBranchInput): Promise<BranchItem> {
    const res = await http.post('/branches', input);
    listeners.forEach((cb) => cb());
    return res.data.data;
  },

  async deleteBranch(id: string): Promise<void> {
    await http.delete(`/branches/${id}`);
    listeners.forEach((cb) => cb());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
