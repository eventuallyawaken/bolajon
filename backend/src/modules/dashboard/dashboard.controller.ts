import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async getKpis(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.query.branchId as string) || req.branchId;
    const kpis = await dashboardService.getKpis(tenantId, branchId);
    return res.status(200).json({ success: true, data: kpis });
  },

  async getAttendance(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.query.branchId as string) || req.branchId;
    const data = await dashboardService.getGroupAttendance(tenantId, branchId);
    return res.status(200).json({ success: true, data });
  },

  async getRecentPayments(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.query.branchId as string) || req.branchId;
    const data = await dashboardService.getRecentPayments(tenantId, branchId);
    return res.status(200).json({ success: true, data });
  },
};
