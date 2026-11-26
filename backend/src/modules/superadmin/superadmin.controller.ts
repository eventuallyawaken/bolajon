import type { Request, Response } from 'express';
import { superadminService } from './superadmin.service.js';

export const superadminController = {
  async getKpis(_req: Request, res: Response) {
    const kpis = await superadminService.getKpis();
    return res.status(200).json({ success: true, data: kpis });
  },

  async getTenants(req: Request, res: Response) {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const tenants = await superadminService.getTenants(search, status);
    return res.status(200).json({ success: true, data: tenants });
  },

  async createTenant(req: Request, res: Response) {
    const created = await superadminService.createTenant(req.body);
    return res.status(201).json({
      success: true,
      message: 'Yangi bog‘cha muvaffaqiyatli ulandi',
      data: created,
    });
  },

  async updateStatus(req: Request, res: Response) {
    const updated = await superadminService.updateTenantStatus(req.params.id as string, req.body.status);
    return res.status(200).json({
      success: true,
      message: 'Bog‘cha holati yangilandi',
      data: updated,
    });
  },

  async impersonate(req: Request, res: Response) {
    const superadminId = req.user!.userId;
    const result = await superadminService.impersonateTenant(req.params.id as string, superadminId);
    return res.status(200).json({
      success: true,
      message: 'Bog‘cha paneliga kirildi',
      data: result,
    });
  },

  async getPlans(_req: Request, res: Response) {
    const plans = await superadminService.getPlans();
    return res.status(200).json({ success: true, data: plans });
  },

  async createPlan(req: Request, res: Response) {
    const plan = await superadminService.createPlan(req.body);
    return res.status(201).json({
      success: true,
      message: 'Yangi tarif yaratildi',
      data: plan,
    });
  },

  async updatePlan(req: Request, res: Response) {
    const updated = await superadminService.updatePlan(req.params.id as string, req.body);
    return res.status(200).json({
      success: true,
      message: 'Tarif yangilandi',
      data: updated,
    });
  },

  async getInvoices(_req: Request, res: Response) {
    const invoices = await superadminService.getInvoices();
    return res.status(200).json({ success: true, data: invoices });
  },
};
