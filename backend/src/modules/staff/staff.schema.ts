import { z } from 'zod';

export const createStaffSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Ism-familiyani kiriting'),
    role: z.string().min(2, 'Lavozimni tanlang'),
    phone: z.string().min(9, 'Telefon raqamni to‘g‘ri kiriting'),
    groupAssigned: z.string().optional(),
    salary: z.number().min(0, 'Oylik maosh 0 dan kam bo‘lmasligi kerak'),
    branchId: z.string().optional(),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    role: z.string().min(2).optional(),
    phone: z.string().min(9).optional(),
    groupAssigned: z.string().optional(),
    salary: z.number().min(0).optional(),
    status: z.enum(['active', 'leave', 'inactive']).optional(),
  }),
});
