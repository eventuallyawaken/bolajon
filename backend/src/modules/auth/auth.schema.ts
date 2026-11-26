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

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Ism-familiya kamida 2 ta belgidan iborat bo‘lishi kerak').optional(),
    phone: z.string().min(9, 'Telefon raqamini to‘liq kiriting').optional(),
    email: z.string().email('Email formati noto‘g‘ri').optional().nullable(),
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
