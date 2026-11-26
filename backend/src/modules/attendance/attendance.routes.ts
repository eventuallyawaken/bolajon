import { Router } from 'express';
import { attendanceController } from './attendance.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { getAttendanceQuerySchema, saveAttendanceSchema } from './attendance.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', validate(getAttendanceQuerySchema), attendanceController.getAttendance);
router.post('/save', validate(saveAttendanceSchema), attendanceController.saveAttendance);
router.post('/mark-all-present', attendanceController.markAllPresent);
router.post('/send-sms', attendanceController.sendSms);

export default router;
