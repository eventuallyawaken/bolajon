import { Router } from 'express';
import { medicalController } from './medical.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import {
  medicalRecordsQuerySchema,
  createMedicalRecordSchema,
  updateChildMedicalSchema,
} from './medical.schema.js';

const router = Router();

router.use(requireAuth, requireTenant, requireRole('director', 'nurse'));

router.get('/overview', medicalController.getOverview);
router.get('/records', validate(medicalRecordsQuerySchema), medicalController.getRecords);
router.post('/records', validate(createMedicalRecordSchema), medicalController.createRecord);
router.patch('/children/:childId', validate(updateChildMedicalSchema), medicalController.updateChildMedical);
router.get('/menu-allergies', medicalController.getMenuAllergies);

export default router;
