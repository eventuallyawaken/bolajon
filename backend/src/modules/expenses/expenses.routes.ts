import { Router } from 'express';
import { expensesController } from './expenses.controller.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { requireTenant } from '../../common/middlewares/tenant.middleware.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { createExpenseSchema } from './expenses.schema.js';

const router = Router();

router.use(requireAuth, requireTenant);

router.get('/', expensesController.getExpenses);
router.get('/summary', expensesController.getCashSummary);
router.post('/', validate(createExpenseSchema), expensesController.createExpense);

export default router;
