import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';

const router = Router();

router.use(requireAuth, requireTenant, requireRole('director', 'accountant'));

router.get('/stats', dashboardController.getStats);
router.get('/kpis', dashboardController.getKpis);
router.get('/attendance-overview', dashboardController.getAttendance);
router.get('/recent-payments', dashboardController.getRecentPayments);

export default router;
