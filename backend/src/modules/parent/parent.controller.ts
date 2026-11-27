import type { Request, Response, NextFunction } from 'express';
import { parentService } from './parent.service.js';

export const parentController = {
  async getMyChildren(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await parentService.getMyChildren(req.tenantId!, req.user!.userId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getChildOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const childId = req.params.childId as string;
      const data = await parentService.getChildOverview(
        req.tenantId!,
        req.user!.userId,
        childId,
        date
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getChildAttendanceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month as string | undefined;
      const childId = req.params.childId as string;
      const data = await parentService.getChildAttendanceHistory(
        req.tenantId!,
        req.user!.userId,
        childId,
        month
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async submitAbsenceNotice(req: Request, res: Response, next: NextFunction) {
    try {
      const childId = req.params.childId as string;
      const data = await parentService.submitAbsenceNotice(
        req.tenantId!,
        req.user!.userId,
        childId,
        req.body
      );
      return res.status(201).json({
        success: true,
        message: 'Xabarnoma tarbiyachi va ma’muriyatga yuborildi',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getChildPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const childId = req.params.childId as string;
      const data = await parentService.getChildPayments(
        req.tenantId!,
        req.user!.userId,
        childId
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getPaymentCards(req: Request, res: Response, next: NextFunction) {
    try {
      const childId = req.query.childId as string | undefined;
      const data = await parentService.getPaymentCards(req.tenantId!, req.user!.userId, childId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async submitPaymentReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const childId = req.params.childId as string;
      const data = await parentService.submitPaymentReceipt(
        req.tenantId!,
        req.user!.userId,
        childId,
        req.body
      );
      return res.status(201).json({
        success: true,
        message: 'Chek muvaffaqiyatli yuborildi! Hisobchi tasdiqlaganidan so‘ng hisobga olinadi.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const childId = req.query.childId as string | undefined;
      const data = await parentService.getMenu(req.tenantId!, req.user!.userId, childId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
