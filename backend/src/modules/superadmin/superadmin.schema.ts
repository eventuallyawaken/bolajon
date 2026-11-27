import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Bog‘cha nomini kiriting'),
    subdomain: z.string().min(2, 'Subdomainni kiriting'),
    directorName: z.string().min(2, 'Direktor ismini kiriting'),
    phone: z.string().min(9, 'Telefon raqamini kiriting'),
    email: z.string().email('Elektron pochta noto‘g‘ri').or(z.literal('')).optional(),
    planId: z.string().min(1, 'Tarifni tanlang'),
    branchesCount: z.coerce.number().int().min(1).max(50).default(1),
    isTrial: z.boolean().default(true),
  }),
});

export const tenantIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Bog‘cha ID si kerak'),
  }),
});

export const updateTenantStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Bog‘cha ID si kerak'),
  }),
  body: z.object({
    status: z.enum(['active', 'trial', 'suspended', 'blocked']),
  }),
});

export const planSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Tarif nomini kiriting'),
    price: z.union([z.number(), z.string()]),
    period: z.string().default('oyiga'),
    description: z.string().optional(),
    badge: z.string().optional(),
    maxBranches: z.union([z.number(), z.string()]).default(1),
    maxChildren: z.union([z.number(), z.string()]).default(100),
    features: z.array(z.string()).default([]),
    isPopular: z.boolean().default(false),
  }),
});

export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.union([z.number(), z.string()]).optional(),
    period: z.string().optional(),
    description: z.string().optional(),
    badge: z.string().optional(),
    maxBranches: z.union([z.number(), z.string()]).optional(),
    maxChildren: z.union([z.number(), z.string()]).optional(),
    features: z.array(z.string()).optional(),
    isPopular: z.boolean().optional(),
  }),
});
