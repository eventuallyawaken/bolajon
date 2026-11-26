import { z } from 'zod';

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Guruh nomini kiriting'),
    ageRange: z.string().min(1, 'Yosh toifasini kiriting'),
    roomNumber: z.string().min(1, 'Xona raqamini kiriting'),
    mainTeacherName: z.string().min(2, 'Asosiy tarbiyachi ismini kiriting'),
    assistantTeacher: z.string().optional(),
    capacity: z.number().int().min(5).max(60).default(25),
    colorTag: z.string().default('#0d9488'),
    branchId: z.string().optional(),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    ageRange: z.string().optional(),
    roomNumber: z.string().optional(),
    mainTeacherName: z.string().optional(),
    assistantTeacher: z.string().optional(),
    capacity: z.number().int().optional(),
    colorTag: z.string().optional(),
  }),
});
