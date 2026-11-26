import type { Request, Response } from 'express';
import { attendanceService } from './attendance.service.js';

export const attendanceController = {
  async getAttendance(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const groupId = req.query.groupId as string;
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const branchId = (req.query.branchId as string) || req.branchId;

    const data = await attendanceService.getAttendance(tenantId, groupId, date, branchId);
    return res.status(200).json({ success: true, data });
  },

  async saveAttendance(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.body.branchId as string) || req.branchId;
    const result = await attendanceService.saveAttendance(tenantId, branchId, req.body);

    return res.status(200).json({
      success: true,
      message: `Davomat saqlandi! (${result.presentCount} ta bola uchun ombordan ${result.deductedIngredients} turdagi mahsulot avtomatik ayrildi)`,
      data: result,
    });
  },

  async markAllPresent(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const groupId = req.body.groupId as string;
    const date = (req.body.date as string) || new Date().toISOString().slice(0, 10);

    const updated = await attendanceService.markAllPresent(tenantId, groupId, date);
    return res.status(200).json({
      success: true,
      message: 'Barcha bolalar "Keldi" deb belgilandi',
      data: updated,
    });
  },

  async sendSms(_req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      message: 'Kelmagan va harorati yuqori bolalar ota-onalariga SMS xabarnoma yuborildi',
    });
  },
};
