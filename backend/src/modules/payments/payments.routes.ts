import { Router } from 'express';
import { paymentsController } from './payments.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createPaymentSchema } from './payments.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', paymentsController.getPayments);
router.get('/kpis', paymentsController.getKpis);
router.post('/', validate(createPaymentSchema), paymentsController.createPayment);

export default router;
