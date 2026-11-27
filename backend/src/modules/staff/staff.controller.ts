import type { Request, Response, NextFunction } from 'express';
import { staffService } from './staff.service.js';

export const staffController = {
  async getStaffList(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const search = req.query.search as string | undefined;

      const data = await staffService.getStaffList(tenantId, branchId, search);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.body.branchId as string) || req.branchId;

      const staff = await staffService.createStaff(tenantId, branchId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Xodim muvaffaqiyatli qo‘shildi',
        data: staff,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const id = req.params.id as string;

      const staff = await staffService.updateStaff(tenantId, id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Xodim ma’lumotlari yangilandi',
        data: staff,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const id = req.params.id as string;

      const result = await staffService.deleteStaff(tenantId, id, req.user?.userId);
      return res.status(200).json({
        success: true,
        message: 'Xodim muvaffaqiyatli o‘chirildi',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
