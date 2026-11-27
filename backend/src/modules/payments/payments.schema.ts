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

export const createCardSchema = z.object({
  body: z.object({
    cardType: z.enum(['uzcard', 'humo', 'visa', 'mastercard', 'other']).default('uzcard'),
    bankName: z.string().trim().min(2, 'Bank nomini kiriting').max(80),
    cardNumber: z.string().trim().min(12, 'Karta raqamini to‘liq kiriting').max(24),
    cardHolder: z.string().trim().min(2, 'Karta egasini kiriting').max(100),
    note: z.string().max(300).optional(),
    isActive: z.boolean().default(true),
    branchId: z.string().optional().nullable(),
  }),
});

export const updateCardSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    cardType: z.enum(['uzcard', 'humo', 'visa', 'mastercard', 'other']).optional(),
    bankName: z.string().trim().min(2).max(80).optional(),
    cardNumber: z.string().trim().min(12).max(24).optional(),
    cardHolder: z.string().trim().min(2).max(100).optional(),
    note: z.string().max(300).nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const approvePaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const rejectPaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().trim().min(3, 'Qaytarish sababini kiriting (kamida 3 ta belgi)').max(500),
  }),
});
