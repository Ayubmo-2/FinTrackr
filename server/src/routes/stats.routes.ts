import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import { getSummary } from '../controllers/stats.controller';

const router = Router();
router.get('/summary', verifyJWT, getSummary);

export default router;
