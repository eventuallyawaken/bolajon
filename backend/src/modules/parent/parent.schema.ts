import { z } from 'zod';

export const childIdParamSchema = z.object({
  params: z.object({
    childId: z.string().min(1, 'Farzand ID si ko‘rsatilishi kerak'),
  }),
});

export const childOverviewSchema = z.object({
  params: z.object({
    childId: z.string().min(1, 'Farzand ID si ko‘rsatilishi kerak'),
  }),
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Sana YYYY-MM-DD formatida bo‘lishi kerak')
      .optional(),
  }),
});

export const childAttendanceHistorySchema = z.object({
  params: z.object({
    childId: z.string().min(1, 'Farzand ID si ko‘rsatilishi kerak'),
  }),
  query: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Oy YYYY-MM formatida bo‘lishi kerak')
      .optional(),
  }),
});

export const absenceNoticeSchema = z.object({
  params: z.object({
    childId: z.string().min(1, 'Farzand ID si ko‘rsatilishi kerak'),
  }),
  body: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Sana YYYY-MM-DD formatida bo‘lishi kerak'),
    reason: z
      .string()
      .trim()
      .min(3, 'Sabab kamida 3 ta belgidan iborat bo‘lishi kerak')
      .max(500, 'Sabab matni juda uzun'),
  }),
});

export const submitReceiptSchema = z.object({
  params: z.object({
    childId: z.string().min(1, 'Farzand ID si ko‘rsatilishi kerak'),
  }),
  body: z.object({
    paymentCardId: z.string().min(1, 'Kartani tanlang'),
    amount: z.number().positive('To‘lov summasi musbat bo‘lishi kerak'),
    periodStart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Boshlanish sanasi YYYY-MM-DD formatida bo‘lishi kerak'),
    periodEnd: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tugash sanasi YYYY-MM-DD formatida bo‘lishi kerak'),
    month: z.string().trim().min(2).max(80).optional(),
    receiptImage: z
      .string()
      .max(1_350_000, 'Chek rasmi juda katta (maksimal 1 MB)')
      .refine(
        (val) => /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(val),
        'Faqat JPG, PNG yoki WebP chek rasmi yuklang'
      ),
  }),
});
