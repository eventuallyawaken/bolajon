import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    childId: z.string().optional(),
    childName: z.string().optional(),
    groupName: z.string().optional(),
    amount: z.number().positive('Summa musbat bo‘lishi kerak'),
    month: z.string().min(2, 'Oyni kiriting'),
    method: z.string().default('Payme'),
    receiptNumber: z.string().optional(),
    branchId: z.string().optional(),
  }),
});
