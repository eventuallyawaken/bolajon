import { http } from '@/shared/api/http';
import type {
  ParentChild,
  ParentChildOverview,
  ParentAttendanceHistory,
  ParentMenuMeal,
  ParentPaymentsData,
  ParentPaymentCard,
  ParentPaymentItem,
  SubmitReceiptInput,
} from './types';

export const parentApi = {
  async getChildren(): Promise<ParentChild[]> {
    const res = await http.get('/parent/children');
    return res.data?.data || [];
  },

  async getChildOverview(childId: string, date?: string): Promise<ParentChildOverview> {
    const res = await http.get(`/parent/children/${childId}/overview`, {
      params: date ? { date } : undefined,
    });
    return res.data.data;
  },

  async getChildAttendanceHistory(childId: string, month?: string): Promise<ParentAttendanceHistory> {
    const res = await http.get(`/parent/children/${childId}/attendance`, {
      params: month ? { month } : undefined,
    });
    return res.data.data;
  },

  async getChildPayments(childId: string): Promise<ParentPaymentsData> {
    const res = await http.get(`/parent/children/${childId}/payments`);
    return res.data.data;
  },

  async getPaymentCards(childId?: string): Promise<ParentPaymentCard[]> {
    const res = await http.get('/parent/payment-cards', {
      params: childId ? { childId } : undefined,
    });
    return res.data?.data || [];
  },

  async submitReceipt(childId: string, input: SubmitReceiptInput): Promise<ParentPaymentItem> {
    const res = await http.post(`/parent/children/${childId}/submit-receipt`, input);
    return res.data.data;
  },

  async getMenu(childId?: string): Promise<ParentMenuMeal[]> {
    const res = await http.get('/parent/menu', {
      params: childId ? { childId } : undefined,
    });
    return res.data?.data || [];
  },

  async submitAbsenceNotice(
    childId: string,
    input: { date: string; reason: string }
  ): Promise<void> {
    await http.post(`/parent/children/${childId}/absence-notice`, input);
  },
};
