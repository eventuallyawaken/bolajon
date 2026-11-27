import type { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const stats = await dashboardService.getDashboardStats(tenantId, req.user?.userId, branchId);
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  async getKpis(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const kpis = await dashboardService.getKpis(tenantId, branchId);
      return res.status(200).json({ success: true, data: kpis });
    } catch (err) {
      next(err);
    }
  },

  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const data = await dashboardService.getGroupAttendance(tenantId, branchId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getRecentPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const data = await dashboardService.getRecentPayments(tenantId, branchId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
