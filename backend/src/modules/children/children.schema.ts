import { z } from 'zod';

export const createChildSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Bola ismini kiriting'),
    birthDate: z.string().min(1, 'Tug‘ilgan sanani kiriting'),
    gender: z.enum(['male', 'female']).default('male'),
    groupId: z.string().min(1, 'Guruhni tanlang'),
    parentName: z.string().min(2, 'Ota-ona ismini kiriting'),
    parentPhone: z.string().min(9, 'Telefon raqamini kiriting'),
    parentRelation: z.string().default('Ota-onasi'),
    monthlyFee: z.number().positive().default(1800000),
    allergies: z.string().optional(),
    medicalNotes: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const updateChildSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    fullName: z.string().min(2).optional(),
    birthDate: z.string().optional(),
    gender: z.enum(['male', 'female']).optional(),
    groupId: z.string().optional(),
    monthlyFee: z.number().positive().optional(),
    allergies: z.string().optional(),
    medicalNotes: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
