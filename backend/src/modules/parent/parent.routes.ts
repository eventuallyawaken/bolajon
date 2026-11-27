import { Router } from 'express';
import { parentController } from './parent.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import {
  childIdParamSchema,
  childOverviewSchema,
  childAttendanceHistorySchema,
  absenceNoticeSchema,
  submitReceiptSchema,
} from './parent.schema.js';

const router = Router();

router.use(requireAuth, requireTenant, requireRole('parent'));

router.get('/children', parentController.getMyChildren);
router.get('/children/:childId/overview', validate(childOverviewSchema), parentController.getChildOverview);
router.get(
  '/children/:childId/attendance',
  validate(childAttendanceHistorySchema),
  parentController.getChildAttendanceHistory
);
router.get('/children/:childId/payments', validate(childIdParamSchema), parentController.getChildPayments);
router.get('/payment-cards', parentController.getPaymentCards);
router.post(
  '/children/:childId/submit-receipt',
  validate(submitReceiptSchema),
  parentController.submitPaymentReceipt
);
router.post(
  '/children/:childId/absence-notice',
  validate(absenceNoticeSchema),
  parentController.submitAbsenceNotice
);
router.get('/menu', parentController.getMenu);

export default router;
