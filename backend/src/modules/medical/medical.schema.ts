import { z } from 'zod';

export const medicalRecordsQuerySchema = z.object({
  query: z.object({
    childId: z.string().optional(),
    recordType: z.enum(['all', 'checkup', 'vaccination', 'illness']).optional(),
  }),
});

export const createMedicalRecordSchema = z.object({
  body: z.object({
    childId: z.string().min(1, 'Bolani tanlang'),
    recordType: z.enum(['checkup', 'vaccination', 'illness']),
    description: z.string().trim().min(3, 'Tavsif kamida 3 ta belgidan iborat bo‘lishi kerak').max(1000),
    checkedAt: z.string().optional(),
  }),
});

export const updateChildMedicalSchema = z.object({
  params: z.object({
    childId: z.string().min(1),
  }),
  body: z.object({
    allergies: z.string().max(500).nullable().optional(),
    medicalNotes: z.string().max(1000).nullable().optional(),
  }),
});
