import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().default('bolajon_erp_access_secret_super_secure_key_2026_xyz'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('bolajon_erp_refresh_secret_super_secure_key_2026_abc'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  IMPERSONATION_SECRET: z.string().default('bolajon_superadmin_impersonate_key_2026'),
});

export const env = envSchema.parse(process.env);
