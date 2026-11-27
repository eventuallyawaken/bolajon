import type { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service.js';

export const notificationsController = {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const role = (req.query.role as string) || req.user?.role;
      const userId = req.user?.userId;

      const data = await notificationsService.getNotifications(tenantId, role, userId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const id = req.params.id as string;

      const data = await notificationsService.markAsRead(
        tenantId,
        id,
        req.user?.role,
        req.user?.userId
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const result = await notificationsService.markAllAsRead(
        tenantId,
        req.user?.role,
        req.user?.userId
      );
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const notification = await notificationsService.createNotification(tenantId, req.body);
      return res.status(201).json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  },
};
