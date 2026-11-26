import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Bog‘cha nomini kiriting'),
    subdomain: z.string().min(2, 'Subdomainni kiriting'),
    directorName: z.string().min(2, 'Direktor ismini kiriting'),
    phone: z.string().min(9, 'Telefon raqamini kiriting'),
    email: z.string().email('Elektron pochta noto‘g‘ri').optional(),
    planId: z.string().min(1, 'Tarifni tanlang'),
    branchesCount: z.number().int().min(1).default(1),
    isTrial: z.boolean().default(true),
  }),
});

export const updateTenantStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['active', 'trial', 'suspended']),
  }),
});

export const planSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    price: z.number().positive(),
    period: z.string().default('oyiga'),
    maxBranches: z.number().int().positive(),
    maxChildren: z.number().int().positive(),
    features: z.array(z.string()).default([]),
    isPopular: z.boolean().default(false),
  }),
});
