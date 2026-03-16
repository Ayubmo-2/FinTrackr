import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.middleware';
import * as auth from '../controllers/auth.controller';

const router = Router();

router.post('/register', authLimiter, auth.register);
router.post('/login', authLimiter, auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.get('/verify-email', auth.verifyEmail);
router.post('/forgot-password', authLimiter, auth.forgotPassword);
router.post('/reset-password', authLimiter, auth.resetPassword);

export default router;
