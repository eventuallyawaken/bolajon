import type { Request, Response } from 'express';
import { notificationsService } from './notifications.service.js';

export const notificationsController = {
  async getNotifications(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const role = (req.query.role as string) || req.user?.role;
    const userId = req.user?.userId;

    const data = await notificationsService.getNotifications(tenantId, role, userId);
    return res.status(200).json({ success: true, data });
  },

  async markAsRead(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const data = await notificationsService.markAsRead(tenantId, id);
    return res.status(200).json({ success: true, data });
  },

  async markAllAsRead(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const result = await notificationsService.markAllAsRead(tenantId);
    return res.status(200).json({ success: true, data: result });
  },

  async createNotification(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const notification = await notificationsService.createNotification(tenantId, req.body);
    return res.status(201).json({ success: true, data: notification });
  },
};
