import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import * as user from '../controllers/user.controller';

const router = Router();
router.get('/me', verifyJWT, user.getMe);
router.delete('/me', verifyJWT, user.deleteAccount);

export default router;
