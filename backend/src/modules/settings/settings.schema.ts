import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    orgName: z.string().min(2).optional(),
    stir: z.string().optional(),
    directorName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    monthlyFee: z.number().min(0).optional(),
    bankAccount: z.string().optional(),
    mfo: z.string().optional(),
    bankName: z.string().optional(),
    smsNotificationsEnabled: z.boolean().optional(),
    morningCheckStrict: z.boolean().optional(),
    autoRemindDebtors: z.boolean().optional(),
  }),
});
