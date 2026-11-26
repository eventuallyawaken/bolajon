import { Router } from 'express';
import { warehouseController } from './warehouse.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
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
router.get('/items', warehouseController.getWarehouseItems);
router.post('/items', validate(addStockItemSchema), warehouseController.addStockItem);
router.put('/items/:id', validate(updateStockItemSchema), warehouseController.updateStockItem);
router.delete('/items/:id', warehouseController.deleteStockItem);

// Daily Menu
router.get('/menu', warehouseController.getDailyMenus);
router.post('/menu', validate(createMenuItemSchema), warehouseController.createMenuItem);
router.put('/menu/:id', validate(updateMenuItemSchema), warehouseController.updateMenuItem);
router.delete('/menu/:id', warehouseController.deleteMenuItem);

export default router;
