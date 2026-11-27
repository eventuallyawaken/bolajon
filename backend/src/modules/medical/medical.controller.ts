import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { medicalService } from './medical.service.js';

export const medicalController = {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = (req.query.branchId as string) || req.branchId;
      const data = await medicalService.getOverview(req.tenantId!, branchId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = (req.query.branchId as string) || req.branchId;
      const childId = req.query.childId as string | undefined;
      const recordType = req.query.recordType as string | undefined;
      const data = await medicalService.getRecords(req.tenantId!, branchId, childId, recordType);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = req.user?.userId
        ? await prisma.user.findUnique({ where: { id: req.user.userId }, select: { fullName: true } })
        : null;
      const roleLabel =
        req.user?.role === 'director'
          ? `Direktor (${actor?.fullName || ''})`.trim()
          : `Hamshira (${actor?.fullName || ''})`.trim();

      const data = await medicalService.createRecord(req.tenantId!, roleLabel, req.body);
      return res.status(201).json({
        success: true,
        message: 'Tibbiy qaydnoma saqlandi va ota-onaga xabar yuborildi',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateChildMedical(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = req.user?.userId
        ? await prisma.user.findUnique({ where: { id: req.user.userId }, select: { fullName: true } })
        : null;
      const roleLabel = actor?.fullName || (req.user?.role === 'director' ? 'Direktor' : 'Hamshira');

      const data = await medicalService.updateChildMedical(
        req.tenantId!,
        req.params.childId as string,
        roleLabel,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: 'Tibbiy karta ma’lumotlari yangilandi',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMenuAllergies(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = (req.query.branchId as string) || req.branchId;
      const data = await medicalService.getMenuAllergyAlerts(req.tenantId!, branchId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
