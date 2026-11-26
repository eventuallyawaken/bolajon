import { http } from '@/shared/api/http';
import type { PaymentRecord, PaymentKpis, CreatePaymentInput } from './types';

export const paymentsApi = {
  async getPayments(search?: string, method?: string): Promise<PaymentRecord[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (method && method !== 'all') params.append('method', method);
      const res = await http.get(`/payments?${params.toString()}`);
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  async getKpis(): Promise<PaymentKpis> {
    try {
      const res = await http.get('/payments/kpis');
      return res.data.data;
    } catch {
      return {
        totalRevenue: 0,
        monthlyTarget: 0,
        collectedCount: 0,
        debtorCount: 0,
        totalDebt: 0,
      };
    }
  },

  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    const res = await http.post('/payments', {
      childName: input.childName,
      groupName: input.groupName,
      amount: Number(input.amount),
      month: input.month,
      method: input.method,
      receiptNumber: input.receiptNumber,
    });
    return res.data.data;
  },
};
