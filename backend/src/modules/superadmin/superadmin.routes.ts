import { Router } from 'express';
import { superadminController } from './superadmin.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import {
  createTenantSchema,
  updateTenantStatusSchema,
  planSchema,
} from './superadmin.schema.js';

const router = Router();

// All superadmin routes require auth and 'superadmin' role
router.use(requireAuth, requireRole('superadmin'));

router.get('/kpis', superadminController.getKpis);
router.get('/tenants', superadminController.getTenants);
router.post('/tenants', validate(createTenantSchema), superadminController.createTenant);
router.patch('/tenants/:id/status', validate(updateTenantStatusSchema), superadminController.updateStatus);
router.post('/tenants/:id/impersonate', superadminController.impersonate);

router.get('/plans', superadminController.getPlans);
router.post('/plans', validate(planSchema), superadminController.createPlan);
router.patch('/plans/:id', superadminController.updatePlan);

router.get('/invoices', superadminController.getInvoices);

export default router;
