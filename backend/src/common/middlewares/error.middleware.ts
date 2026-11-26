import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validatsiya xatosi',
      errors: formattedErrors,
    });
  }

  // 2. Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 3. Prisma or Database Errors
  const errMsg = err.message || '';
  if (errMsg.includes('Unique constraint failed')) {
    return res.status(409).json({
      success: false,
      message: 'Ushbu ma’lumot bazada allaqachon mavjud',
    });
  }

  // 4. Default 500 Uncaught Error
  console.error('[UNHANDLED_ERROR]:', err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Ichki server xatoligi yuz berdi'
      : err.message,
  });
};
