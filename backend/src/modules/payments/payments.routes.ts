import { Router } from 'express';
import { paymentsController } from './payments.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import {
  createPaymentSchema,
  createCardSchema,
  updateCardSchema,
  approvePaymentSchema,
  rejectPaymentSchema,
} from './payments.schema.js';

const router = Router();

router.use(requireAuth, requireTenant, requireRole('director', 'accountant'));

router.get('/cards', paymentsController.getCards);
router.post('/cards', validate(createCardSchema), paymentsController.createCard);
router.patch('/cards/:id', validate(updateCardSchema), paymentsController.updateCard);
router.delete('/cards/:id', paymentsController.deleteCard);

router.get('/', paymentsController.getPayments);
router.get('/kpis', paymentsController.getKpis);
router.post('/', validate(createPaymentSchema), paymentsController.createPayment);
router.patch('/:id/approve', validate(approvePaymentSchema), paymentsController.approvePayment);
router.patch('/:id/reject', validate(rejectPaymentSchema), paymentsController.rejectPayment);

export default router;
