import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { prisma } from './config/db.js';
import { errorHandler } from './common/middlewares/error.middleware.js';
import { NotFoundError } from './common/errors/AppError.js';

// Import all module routes
import authRoutes from './modules/auth/auth.routes.js';
import superadminRoutes from './modules/superadmin/superadmin.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import childrenRoutes from './modules/children/children.routes.js';
import groupsRoutes from './modules/groups/groups.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import expensesRoutes from './modules/expenses/expenses.routes.js';
import warehouseRoutes from './modules/warehouse/warehouse.routes.js';
import staffRoutes from './modules/staff/staff.routes.js';
import branchesRoutes from './modules/branches/branches.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import parentRoutes from './modules/parent/parent.routes.js';
import medicalRoutes from './modules/medical/medical.routes.js';

export const createApp = (): Application => {
  const app = express();
  app.set('trust proxy', 1);

  // Security and utilities
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Mount API modules for both /api and /api/v1
  const mountRoutes = (prefix: string) => {
    app.get(`${prefix}/health`, async (_req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
      } catch {
        res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() });
      }
    });
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/superadmin`, superadminRoutes);
    app.use(`${prefix}/dashboard`, dashboardRoutes);
    app.use(`${prefix}/children`, childrenRoutes);
    app.use(`${prefix}/groups`, groupsRoutes);
    app.use(`${prefix}/attendance`, attendanceRoutes);
    app.use(`${prefix}/payments`, paymentsRoutes);
    app.use(`${prefix}/expenses`, expensesRoutes);
    app.use(`${prefix}/warehouse`, warehouseRoutes);
    app.use(`${prefix}/staff`, staffRoutes);
    app.use(`${prefix}/branches`, branchesRoutes);
    app.use(`${prefix}/settings`, settingsRoutes);
    app.use(`${prefix}/notifications`, notificationsRoutes);
    app.use(`${prefix}/parent`, parentRoutes);
    app.use(`${prefix}/medical`, medicalRoutes);
  };

  mountRoutes('/api');
  mountRoutes('/api/v1');

  // 404 handler
  app.use((_req, _res, next) => {
    next(new NotFoundError('So‘ralgan marshrut topilmadi'));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
