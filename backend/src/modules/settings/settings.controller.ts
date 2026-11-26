import type { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service.js';

export const settingsController = {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const data = await settingsService.getSettings(tenantId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const settings = await settingsService.updateSettings(tenantId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Sozlamalar muvaffaqiyatli saqlandi',
        data: settings,
      });
    } catch (err) {
      next(err);
    }
  },
};
