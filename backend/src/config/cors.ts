import type { CorsOptions } from 'cors';
import { env } from './env.js';

const allowedOrigins = env.CORS_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server, curl) or configured origins
    const isDevLocalhost =
      env.NODE_ENV !== 'production' && origin?.startsWith('http://localhost:');

    if (!origin || allowedOrigins.includes(origin) || isDevLocalhost) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed by server'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Branch-Id', 'X-Impersonate-User'],
};
