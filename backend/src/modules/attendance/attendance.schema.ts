import { z } from 'zod';

export const getAttendanceQuerySchema = z.object({
  query: z.object({
    groupId: z.string().min(1, 'Guruhni tanlang'),
    date: z.string().optional(),
    branchId: z.string().optional(),
  }),
});

export const attendanceRecordItemSchema = z.object({
  id: z.string().optional(),
  childId: z.string().min(1),
  isPresent: z.boolean(),
  status: z.enum(['present', 'absent', 'late', 'excused']).default('present'),
  temperature: z.number().min(34).max(43).default(36.6),
  healthStatus: z.enum(['healthy', 'flu', 'quarantine']).default('healthy'),
  notes: z.string().optional(),
});

export const saveAttendanceSchema = z.object({
  body: z.object({
    groupId: z.string().min(1),
    date: z.string().min(10), // YYYY-MM-DD
    records: z.array(attendanceRecordItemSchema),
    autoDeductWarehouse: z.boolean().default(true),
  }),
});
