import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import * as budgets from '../controllers/budgets.controller';

const router = Router();

router.get('/', verifyJWT, budgets.getBudgets);
router.post('/', verifyJWT, budgets.upsertBudget);
router.delete('/:id', verifyJWT, budgets.deleteBudget);

export default router;
