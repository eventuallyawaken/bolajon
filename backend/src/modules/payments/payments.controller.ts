import type { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service.js';

export const paymentsController = {
  async getCards(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const cards = await paymentsService.getCards(tenantId, branchId);
      return res.status(200).json({ success: true, data: cards });
    } catch (err) {
      next(err);
    }
  },

  async createCard(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.body.branchId as string | undefined) ?? req.branchId;
      const created = await paymentsService.createCard(tenantId, branchId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Bank kartasi qo‘shildi',
        data: created,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await paymentsService.updateCard(
        req.tenantId!,
        req.params.id as string,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: 'Karta ma’lumotlari yangilandi',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteCard(req: Request, res: Response, next: NextFunction) {
    try {
      await paymentsService.deleteCard(req.tenantId!, req.params.id as string);
      return res.status(200).json({
        success: true,
        message: 'Bank kartasi o‘chirildi',
      });
    } catch (err) {
      next(err);
    }
  },

  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const method = req.query.method as string | undefined;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const data = await paymentsService.getPayments(tenantId, branchId, method, search, status);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getKpis(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.query.branchId as string) || req.branchId;
      const kpis = await paymentsService.getKpis(tenantId, branchId);
      return res.status(200).json({ success: true, data: kpis });
    } catch (err) {
      next(err);
    }
  },

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const branchId = (req.body.branchId as string) || req.branchId;
      const payment = await paymentsService.createPayment(tenantId, branchId, req.body);
      return res.status(201).json({
        success: true,
        message: 'To‘lov muvaffaqiyatli qabul qilindi',
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  },

  async approvePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await paymentsService.approvePayment(
        req.tenantId!,
        req.params.id as string,
        req.user!.userId
      );
      return res.status(200).json({
        success: true,
        message: 'To‘lov cheki tasdiqlandi',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async rejectPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await paymentsService.rejectPayment(
        req.tenantId!,
        req.params.id as string,
        req.user!.userId,
        req.body.reason
      );
      return res.status(200).json({
        success: true,
        message: 'To‘lov cheki qaytarildi va ota-onaga xabar yuborildi',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
