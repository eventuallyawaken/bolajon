import { Router } from 'express';
import { groupsController } from './groups.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createGroupSchema, updateGroupSchema } from './groups.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', requireRole('director', 'teacher', 'nurse'), groupsController.getGroups);
router.post('/', requireRole('director'), validate(createGroupSchema), groupsController.createGroup);
router.put('/:id', requireRole('director'), validate(updateGroupSchema), groupsController.updateGroup);
router.patch('/:id', requireRole('director'), validate(updateGroupSchema), groupsController.updateGroup);
router.delete('/:id', requireRole('director'), groupsController.deleteGroup);

export default router;
