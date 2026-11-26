import type { Request, Response, NextFunction } from 'express';
import { expensesService } from './expenses.service.js';

export const expensesController = {
  async getExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const data = await expensesService.getExpenses(tenantId, branchId, category, search);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getCashSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const data = await expensesService.getCashSummary(tenantId, branchId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.body.branchId as string) || req.branchId;
      const expense = await expensesService.createExpense(tenantId, branchId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Xarajat muvaffaqiyatli saqlandi',
        data: expense,
      });
    } catch (err) {
      next(err);
    }
  },
};
