import { Router } from 'express';
import { warehouseController } from './warehouse.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { requireRole } from '../../common/middlewares/rbac.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import {
  addStockItemSchema,
  updateStockItemSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from './warehouse.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

// Warehouse inventory
router.get('/items', requireRole('director', 'accountant'), warehouseController.getWarehouseItems);
router.post('/items', requireRole('director', 'accountant'), validate(addStockItemSchema), warehouseController.addStockItem);
router.put('/items/:id', requireRole('director', 'accountant'), validate(updateStockItemSchema), warehouseController.updateStockItem);
router.delete('/items/:id', requireRole('director', 'accountant'), warehouseController.deleteStockItem);

// Daily Menu (readable by teachers/nurses/parents for mobile & dashboard, editable by director/accountant)
router.get('/menu', requireRole('director', 'accountant', 'teacher', 'nurse', 'parent'), warehouseController.getDailyMenus);
router.post('/menu', requireRole('director', 'accountant'), validate(createMenuItemSchema), warehouseController.createMenuItem);
router.put('/menu/:id', requireRole('director', 'accountant'), validate(updateMenuItemSchema), warehouseController.updateMenuItem);
router.delete('/menu/:id', requireRole('director', 'accountant'), warehouseController.deleteMenuItem);

export default router;
