import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Sarlavhani kiriting'),
    message: z.string().min(2, 'Xabarni kiriting'),
    type: z.enum(['info', 'warning', 'success', 'danger']).default('info'),
    targetRole: z.enum(['all', 'direktor', 'tarbiyachi', 'hisobchi', 'hamshira']).default('all'),
    link: z.string().optional(),
    userId: z.string().optional(),
  }),
});
