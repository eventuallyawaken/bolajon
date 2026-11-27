import { Router } from 'express';
import { superadminController } from './superadmin.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import {
  createTenantSchema,
  tenantIdParamSchema,
  updateTenantStatusSchema,
  planSchema,
  updatePlanSchema,
} from './superadmin.schema.js';

const router = Router();

// All superadmin routes require auth and 'superadmin' role
router.use(requireAuth, requireRole('superadmin'));

router.get('/kpis', superadminController.getKpis);
router.get('/stats', superadminController.getKpis);
router.get('/tenants', superadminController.getTenants);
router.post('/tenants', validate(createTenantSchema), superadminController.createTenant);
router.patch('/tenants/:id/status', validate(updateTenantStatusSchema), superadminController.updateStatus);
router.delete('/tenants/:id', validate(tenantIdParamSchema), superadminController.deleteTenant);
router.post('/tenants/:id/impersonate', validate(tenantIdParamSchema), superadminController.impersonate);
router.post('/impersonate/:id', validate(tenantIdParamSchema), superadminController.impersonate);

router.get('/plans', superadminController.getPlans);
router.post('/plans', validate(planSchema), superadminController.createPlan);
router.put('/plans/:id', validate(updatePlanSchema), superadminController.updatePlan);
router.patch('/plans/:id', validate(updatePlanSchema), superadminController.updatePlan);
router.delete('/plans/:id', superadminController.deletePlan);

router.get('/invoices', superadminController.getInvoices);
router.get('/logs', superadminController.getLogs);

export default router;
