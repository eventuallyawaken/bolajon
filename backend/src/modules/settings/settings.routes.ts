import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { updateSettingsSchema } from './settings.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', settingsController.getSettings);
router.put('/', validate(updateSettingsSchema), settingsController.updateSettings);
router.patch('/', validate(updateSettingsSchema), settingsController.updateSettings);

export default router;
