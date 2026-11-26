import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createNotificationSchema } from './notifications.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', notificationsController.getNotifications);
router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', notificationsController.markAsRead);
router.post('/', validate(createNotificationSchema), notificationsController.createNotification);

export default router;
