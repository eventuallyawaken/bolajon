import type { Request, Response, NextFunction } from 'express';
import { childrenService } from './children.service.js';

export const childrenController = {
  async getChildren(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const groupId = req.query.groupId as string | undefined;
      const search = req.query.search as string | undefined;

      const list = await childrenService.getChildren(tenantId, branchId, groupId, search);
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async getChildById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const child = await childrenService.getChildById(tenantId, req.params.id as string);
      return res.status(200).json({ success: true, data: child });
    } catch (err) {
      next(err);
    }
  },

  async createChild(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.body.branchId as string) || req.branchId;
      const child = await childrenService.createChild(tenantId, branchId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Bola muvaffaqiyatli qabul qilindi',
        data: child,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateChild(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const updated = await childrenService.updateChild(tenantId, req.params.id as string, req.body);
      return res.status(200).json({
        success: true,
        message: 'Bola ma’lumotlari yangilandi',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteChild(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      await childrenService.deleteChild(tenantId, req.params.id as string);
      return res.status(200).json({
        success: true,
        message: 'Bola ro‘yxatdan chiqarildi',
      });
    } catch (err) {
      next(err);
    }
  },
};
