import { Router } from 'express';
import { parentController } from './parent.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/children', parentController.getMyChildren);
router.get('/children/:childId/overview', parentController.getChildOverview);
router.get('/children/:childId/payments', parentController.getChildPayments);
router.get('/menu', parentController.getMenu);

export default router;
