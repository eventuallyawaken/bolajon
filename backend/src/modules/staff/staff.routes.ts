import { Router } from 'express';
import { staffController } from './staff.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createStaffSchema, updateStaffSchema } from './staff.schema.js';

const router = Router();

router.use(requireAuth, requireTenant, requireRole('director'));

router.get('/', staffController.getStaffList);
router.post('/', validate(createStaffSchema), staffController.createStaff);
router.put('/:id', validate(updateStaffSchema), staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

export default router;
