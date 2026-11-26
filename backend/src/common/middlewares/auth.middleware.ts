import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../errors/AppError.js';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.accessToken;

  if (!token) {
    throw new UnauthorizedError('Avtorizatsiya talab etiladi (Token topilmadi)');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    if (payload.tenantId) {
      req.tenantId = payload.tenantId;
    }
    if (payload.branchId) {
      req.branchId = payload.branchId;
    }
    next();
  } catch {
    throw new UnauthorizedError('Token yaroqsiz yoki muddati o‘tgan');
  }
};
