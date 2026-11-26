import { z } from 'zod';

export const dashboardFilterSchema = z.object({
  query: z.object({
    branchId: z.string().optional(),
  }),
});
