import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import { requirePro } from '../middleware/tier.middleware';
import * as tx from '../controllers/transactions.controller';

const router = Router();

router.get('/export', verifyJWT, requirePro, tx.exportTransactions);
router.get('/', verifyJWT, tx.getTransactions);
router.post('/', verifyJWT, tx.createTransaction);
router.patch('/:id', verifyJWT, tx.updateTransaction);
router.delete('/:id', verifyJWT, tx.deleteTransaction);

export default router;
