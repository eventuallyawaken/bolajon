import type { Request, Response } from 'express';
import { groupsService } from './groups.service.js';

export const groupsController = {
  async getGroups(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.query.branchId as string) || req.branchId;
    const groups = await groupsService.getGroups(tenantId, branchId);
    return res.status(200).json({ success: true, data: groups });
  },

  async createGroup(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.body.branchId as string) || req.branchId;
    const created = await groupsService.createGroup(tenantId, branchId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Yangi guruh ochildi',
      data: created,
    });
  },

  async updateGroup(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const updated = await groupsService.updateGroup(tenantId, req.params.id as string, req.body);
    return res.status(200).json({
      success: true,
      message: 'Guruh ma’lumotlari yangilandi',
      data: updated,
    });
  },

  async deleteGroup(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    await groupsService.deleteGroup(tenantId, req.params.id as string);
    return res.status(200).json({
      success: true,
      message: 'Guruh o‘chirildi',
    });
  },
};
