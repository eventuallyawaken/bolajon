import { Router } from 'express';
import { groupsController } from './groups.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createGroupSchema, updateGroupSchema } from './groups.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', groupsController.getGroups);
router.post('/', validate(createGroupSchema), groupsController.createGroup);
router.put('/:id', validate(updateGroupSchema), groupsController.updateGroup);
router.patch('/:id', validate(updateGroupSchema), groupsController.updateGroup);
router.delete('/:id', groupsController.deleteGroup);

export default router;
