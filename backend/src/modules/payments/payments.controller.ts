import type { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service.js';

export const paymentsController = {
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const method = req.query.method as string | undefined;
      const search = req.query.search as string | undefined;

      const data = await paymentsService.getPayments(tenantId, branchId, method, search);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getKpis(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const kpis = await paymentsService.getKpis(tenantId, branchId);
      return res.status(200).json({ success: true, data: kpis });
    } catch (err) {
      next(err);
    }
  },

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.body.branchId as string) || req.branchId;
      const payment = await paymentsService.createPayment(tenantId, branchId, req.body);
      return res.status(201).json({
        success: true,
        message: 'To‘lov muvaffaqiyatli qabul qilindi',
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  },
};
