import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';
import { prisma } from '../../config/db.js';

export const requireTenant = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  // Superadmins can bypass tenant requirement or use tenant header for impersonation
  if (req.user.role === 'superadmin') {
    const headerTenant = req.headers['x-tenant-id'] as string;
    if (headerTenant) {
      req.tenantId = headerTenant;
    }
    return next();
  }

  const tenantId = req.user.tenantId;
  if (!tenantId) {
    throw new ForbiddenError('Bog‘cha (Tenant) ma’lumotlari topilmadi');
  }

  // Check if tenant is active
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, status: true, expiresAt: true },
  });

  if (!tenant) {
    throw new ForbiddenError('Bog‘cha tizimda mavjud emas');
  }

  if (tenant.status === 'suspended') {
    throw new ForbiddenError('Ushbu bog‘chaning obunasi to‘xtatilgan (Suspended). Iltimos, to‘lovni amalga oshiring.');
  }

  req.tenantId = tenant.id;
  next();
};
