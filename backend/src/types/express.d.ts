import type { JwtPayload } from '../common/utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenantId?: string;
      branchId?: string;
    }
  }
}

export {};
