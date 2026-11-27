import { http } from '@/shared/api/http';
import type {
  PaymentRecord,
  PaymentKpis,
  CreatePaymentInput,
  PaymentCard,
  CreatePaymentCardInput,
} from './types';

export const paymentsApi = {
  async getCards(): Promise<PaymentCard[]> {
    const res = await http.get('/payments/cards');
    return res.data?.data || [];
  },

  async createCard(input: CreatePaymentCardInput): Promise<PaymentCard> {
    const res = await http.post('/payments/cards', input);
    return res.data.data;
  },

  async updateCard(id: string, input: Partial<CreatePaymentCardInput>): Promise<PaymentCard> {
    const res = await http.patch(`/payments/cards/${id}`, input);
    return res.data.data;
  },

  async deleteCard(id: string): Promise<void> {
    await http.delete(`/payments/cards/${id}`);
  },

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
        pendingCount: 0,
        pendingAmount: 0,
        rejectedCount: 0,
      };
    }
  },

  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    const res = await http.post('/payments', {
      ...(input.childId ? { childId: input.childId } : {}),
      childName: input.childName,
      groupName: input.groupName,
      amount: Number(input.amount),
      month: input.month,
      method: input.method,
      receiptNumber: input.receiptNumber,
    });
    return res.data.data;
  },

  async approvePayment(id: string): Promise<PaymentRecord> {
    const res = await http.patch(`/payments/${id}/approve`);
    return res.data.data;
  },

  async rejectPayment(id: string, reason: string): Promise<PaymentRecord> {
    const res = await http.patch(`/payments/${id}/reject`, { reason });
    return res.data.data;
  },
};
