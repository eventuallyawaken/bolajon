import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.status(200).json({
        success: true,
        message: 'Tizimga muvaffaqiyatli kirildi',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refreshToken(token);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(token);
      res.clearCookie('refreshToken');

      return res.status(200).json({
        success: true,
        message: 'Tizimdan chiqildi',
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getMe(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await authService.updateProfile(userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Profil ma’lumotlari muvaffaqiyatli yangilandi',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await authService.changePassword(userId, req.body);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
