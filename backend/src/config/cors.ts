import type { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl) or matching configured frontend origin
    if (!origin || origin === env.CORS_ORIGIN || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed by server'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Branch-Id', 'X-Impersonate-User'],
};
