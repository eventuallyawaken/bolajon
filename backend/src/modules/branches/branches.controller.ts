import type { Request, Response } from 'express';
import { branchesService } from './branches.service.js';

export const branchesController = {
  async getBranches(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const data = await branchesService.getBranches(tenantId);
    return res.status(200).json({ success: true, data });
  },

  async createBranch(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branch = await branchesService.createBranch(tenantId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Filial muvaffaqiyatli qo‘shildi',
      data: branch,
    });
  },

  async updateBranch(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const branch = await branchesService.updateBranch(tenantId, id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Filial ma’lumotlari yangilandi',
      data: branch,
    });
  },

  async deleteBranch(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const result = await branchesService.deleteBranch(tenantId, id);
    return res.status(200).json({
      success: true,
      message: 'Filial o‘chirildi',
      data: result,
    });
  },
};
