import type { Request, Response, NextFunction } from 'express';
import { superadminService } from './superadmin.service.js';

export const superadminController = {
  async getKpis(_req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = await superadminService.getKpis();
      return res.status(200).json({ success: true, data: kpis });
    } catch (err) {
      next(err);
    }
  },

  async getTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const tenants = await superadminService.getTenants(search, status);
      return res.status(200).json({ success: true, data: tenants });
    } catch (err) {
      next(err);
    }
  },

  async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await superadminService.createTenant(req.body, req.user?.userId);
      return res.status(201).json({
        success: true,
        message: 'Yangi bog‘cha muvaffaqiyatli ulandi',
        data: created,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await superadminService.updateTenantStatus(
        req.params.id as string,
        req.body.status,
        req.user?.userId
      );
      return res.status(200).json({
        success: true,
        message: 'Bog‘cha holati yangilandi',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superadminService.deleteTenant(
        req.params.id as string,
        req.user?.userId
      );
      return res.status(200).json({
        success: true,
        message: 'Bog‘cha tizimdan butunlay o‘chirildi',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async impersonate(req: Request, res: Response, next: NextFunction) {
    try {
      const superadminId = req.user!.userId;
      const result = await superadminService.impersonateTenant(req.params.id as string, superadminId);
      return res.status(200).json({
        success: true,
        message: 'Bog‘cha paneliga kirildi',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await superadminService.getPlans();
      return res.status(200).json({ success: true, data: plans });
    } catch (err) {
      next(err);
    }
  },

  async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await superadminService.createPlan(req.body, req.user?.userId);
      return res.status(201).json({
        success: true,
        message: 'Yangi tarif yaratildi',
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  },

  async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await superadminService.updatePlan(req.params.id as string, req.body, req.user?.userId);
      return res.status(200).json({
        success: true,
        message: 'Tarif yangilandi',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superadminService.deletePlan(req.params.id as string, req.user?.userId);
      return res.status(200).json({
        success: true,
        message: 'Tarif o‘chirildi',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getInvoices(_req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await superadminService.getInvoices();
      return res.status(200).json({ success: true, data: invoices });
    } catch (err) {
      next(err);
    }
  },

  async getLogs(_req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await superadminService.getLogs();
      return res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  },
};
