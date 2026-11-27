import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { loginSchema, refreshSchema, updateProfileSchema, changePasswordSchema } from './auth.schema.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';
import { createLoginRateLimiter } from '../../common/middlewares/rateLimit.middleware.js';

const router = Router();
const loginRateLimiter = createLoginRateLimiter(20, 15 * 60 * 1000);

router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.patch('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);

export default router;
