import { Router } from 'express';
import { childrenController } from './children.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createChildSchema, updateChildSchema } from './children.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', requireRole('director', 'teacher', 'nurse', 'accountant'), childrenController.getChildren);
router.get('/:id', requireRole('director', 'teacher', 'nurse', 'accountant'), childrenController.getChildById);
router.post('/', requireRole('director', 'teacher'), validate(createChildSchema), childrenController.createChild);
router.patch('/:id', requireRole('director', 'teacher'), validate(updateChildSchema), childrenController.updateChild);
router.delete('/:id', requireRole('director'), childrenController.deleteChild);

export default router;
