import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Xarajat nomini kiriting'),
    category: z.string().min(2, 'Kategoriyani tanlang'),
    amount: z.number().positive('Summa musbat bo‘lishi kerak'),
    recipient: z.string().min(2, 'Qabul qiluvchini kiriting'),
    paymentMethod: z.string().min(2, 'To‘lov usulini tanlang'),
    date: z.string().optional(),
    notes: z.string().optional(),
    branchId: z.string().optional(),
  }),
});
