import { Router } from 'express';
import { childrenController } from './children.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createChildSchema, updateChildSchema } from './children.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', childrenController.getChildren);
router.get('/:id', childrenController.getChildById);
router.post('/', validate(createChildSchema), childrenController.createChild);
router.patch('/:id', validate(updateChildSchema), childrenController.updateChild);
router.delete('/:id', childrenController.deleteChild);

export default router;
