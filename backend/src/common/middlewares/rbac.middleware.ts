import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';
import { prisma } from '../../config/db.js';

const ROLE_ALIASES: Record<string, string> = {
  superadmin: 'superadmin',
  director: 'director',
  direktor: 'director',
  teacher: 'teacher',
  tarbiyachi: 'teacher',
  accountant: 'accountant',
  hisobchi: 'accountant',
  nurse: 'nurse',
  hamshira: 'nurse',
  parent: 'parent',
  ota_ona: 'parent',
};

export const normalizeRoleSlug = (role?: string | null): string => {
  if (!role) return '';
  const key = role.toLowerCase().trim();
  return ROLE_ALIASES[key] || key;
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const userRole = normalizeRoleSlug(req.user.role);
    const allowedNormalized = allowedRoles.map((r) => normalizeRoleSlug(r));
    if (!allowedNormalized.includes(userRole)) {
      throw new ForbiddenError(
        `Ushbu amal uchun ruxsat berilmagan. Talab qilinadigan rol: [${allowedRoles.join(', ')}]`
      );
    }
    next();
  };
};

export const requirePermission = (permissionSlug: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    // Superadmin has all permissions
    if (req.user.role === 'superadmin') {
      return next();
    }

    const roleSlug = req.user.role;
    const hasPermission = await prisma.rolePermission.findFirst({
      where: {
        role: { slug: roleSlug },
        permission: { slug: permissionSlug },
      },
    });

    if (!hasPermission) {
      throw new ForbiddenError(`Sizda '${permissionSlug}' amalini bajarish huquqi mavjud emas`);
    }

    next();
  };
};

export const requireFeature = (featureName: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role === 'superadmin') {
      return next();
    }

    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) {
      throw new ForbiddenError('Bog‘cha aniqlanmadi');
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { features: true },
    });

    const features = (tenant?.features as Record<string, boolean>) || {};
    if (!features[featureName]) {
      throw new ForbiddenError(`Ushbu bog‘cha tarifida '${featureName}' moduli faollashtirilmagan`);
    }

    next();
  };
};
