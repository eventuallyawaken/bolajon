import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Filial nomini kiriting'),
    address: z.string().min(2, 'Manzilni kiriting'),
    manager: z.string().min(2, 'Menejer ismini kiriting'),
    phone: z.string().min(9, 'Telefon raqamini kiriting'),
    capacity: z.number().int().positive('Sig‘im musbat son bo‘lishi kerak').default(100),
    groupsCount: z.number().int().min(1).default(1),
    status: z.enum(['active', 'maintenance']).default('active'),
  }),
});

export const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(2).optional(),
    manager: z.string().min(2).optional(),
    phone: z.string().min(9).optional(),
    capacity: z.number().int().positive().optional(),
    groupsCount: z.number().int().min(1).optional(),
    status: z.enum(['active', 'maintenance']).optional(),
  }),
});
