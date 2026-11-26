import { Router } from 'express';
import { branchesController } from './branches.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createBranchSchema, updateBranchSchema } from './branches.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', branchesController.getBranches);
router.post('/', validate(createBranchSchema), branchesController.createBranch);
router.put('/:id', validate(updateBranchSchema), branchesController.updateBranch);
router.delete('/:id', branchesController.deleteBranch);

export default router;
