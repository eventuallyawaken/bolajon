import type { Request, Response } from 'express';
import { warehouseService } from './warehouse.service.js';

export const warehouseController = {
  async getWarehouseItems(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.query.branchId as string) || req.branchId;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const data = await warehouseService.getWarehouseItems(tenantId, branchId, category, search);
    return res.status(200).json({ success: true, data });
  },

  async addStockItem(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.body.branchId as string) || req.branchId;
    const userId = req.user?.userId;

    const item = await warehouseService.addStockItem(tenantId, branchId, req.body, userId);
    return res.status(201).json({
      success: true,
      message: 'Mahsulot zaxiraga muvaffaqiyatli qo‘shildi',
      data: item,
    });
  },

  async updateStockItem(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;
    const userId = req.user?.userId;

    const item = await warehouseService.updateStockItem(tenantId, id, req.body, userId);
    return res.status(200).json({
      success: true,
      message: 'Mahsulot muvaffaqiyatli tahrirlandi',
      data: item,
    });
  },

  async deleteStockItem(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const result = await warehouseService.deleteStockItem(tenantId, id);
    return res.status(200).json({
      success: true,
      message: 'Mahsulot o‘chirildi',
      data: result,
    });
  },

  async getDailyMenus(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.query.branchId as string) || req.branchId;

    const data = await warehouseService.getDailyMenus(tenantId, branchId);
    return res.status(200).json({ success: true, data });
  },

  async createMenuItem(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const branchId = (req.body.branchId as string) || req.branchId;

    const menu = await warehouseService.createMenuItem(tenantId, branchId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Taom muvaffaqiyatli qo‘shildi',
      data: menu,
    });
  },

  async updateMenuItem(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const menu = await warehouseService.updateMenuItem(tenantId, id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Taomnoma muvaffaqiyatli yangilandi',
      data: menu,
    });
  },

  async deleteMenuItem(req: Request, res: Response) {
    const tenantId = req.tenantId!;
    const id = req.params.id as string;

    const result = await warehouseService.deleteMenuItem(tenantId, id);
    return res.status(200).json({
      success: true,
      message: 'Taom muvaffaqiyatli o‘chirildi',
      data: result,
    });
  },
};
