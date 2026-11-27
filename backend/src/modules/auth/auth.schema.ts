import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(9, 'Telefon raqamini to‘liq kiriting'),
    password: z.string().min(6, 'Parol kamida 6 belgidan iborat bo‘lishi kerak'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

const avatarUrlSchema = z
  .string()
  .max(480000, 'Rasm hajmi juda katta (maksimal 450 KB)')
  .refine(
    (val) =>
      val.startsWith('https://') ||
      val.startsWith('http://') ||
      /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(val),
    'Faqat JPG, PNG yoki WebP rasm formatiga ruxsat etiladi'
  );

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Ism-familiya kamida 2 ta belgidan iborat bo‘lishi kerak').optional(),
    phone: z.string().min(9, 'Telefon raqamini to‘liq kiriting').optional(),
    email: z.string().email('Email formati noto‘g‘ri').optional().nullable(),
    avatarUrl: avatarUrlSchema.nullable().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Joriy parolni kiriting'),
    newPassword: z.string().min(6, 'Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
