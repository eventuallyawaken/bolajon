import { http } from '@/shared/api/http';
import type { ExpenseRecord, CashSummary, CreateExpenseInput } from './types';

export const expensesApi = {
  async getExpenses(search?: string, category?: string): Promise<ExpenseRecord[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      const res = await http.get(`/expenses?${params.toString()}`);
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async getCashSummary(): Promise<CashSummary> {
    try {
      const res = await http.get('/expenses/summary');
      return res.data.data;
    } catch {
      return {
        cashBalance: 0,
        bankBalance: 0,
        totalSpentThisMonth: 0,
      };
    }
  },

  async createExpense(input: CreateExpenseInput): Promise<ExpenseRecord> {
    const res = await http.post('/expenses', input);
    return res.data.data;
  },
};
