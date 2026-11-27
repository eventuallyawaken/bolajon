import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { attendanceService } from './attendance.service.js';

export const attendanceController = {
  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const groupId = req.query.groupId as string;
      const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
      const branchId = (req.query.branchId as string) || req.branchId;

      const data = await attendanceService.getAttendance(tenantId, groupId, date, branchId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async saveAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.body.branchId as string) || req.branchId;
      const actor = req.user?.userId
        ? await prisma.user.findUnique({ where: { id: req.user.userId }, select: { fullName: true } })
        : null;

      const result = await attendanceService.saveAttendance(
        tenantId,
        branchId,
        req.body,
        actor?.fullName
      );

      return res.status(200).json({
        success: true,
        message: `Davomat saqlandi! (${result.presentCount} ta bola uchun ombordan ${result.deductedIngredients} turdagi mahsulot avtomatik ayrildi)`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async markAllPresent(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const groupId = req.body.groupId as string;
      const date = (req.body.date as string) || new Date().toISOString().slice(0, 10);

      const updated = await attendanceService.markAllPresent(tenantId, groupId, date);
      return res.status(200).json({
        success: true,
        message: 'Barcha bolalar "Keldi" deb belgilandi',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async sendSms(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const groupId = req.body?.groupId as string | undefined;
      const date = (req.body?.date as string) || new Date().toISOString().slice(0, 10);

      const sentCount = await attendanceService.sendParentAlerts(tenantId, groupId, date);
      return res.status(200).json({
        success: true,
        message:
          sentCount > 0
            ? `${sentCount} ta ota-onaga davomat va tibbiy filtr xabarnomasi yuborildi`
            : 'Ogohlantirish yuborish uchun kelmagan yoki harorati yuqori bola topilmadi',
        data: { sentCount },
      });
    } catch (err) {
      next(err);
    }
  },
};
