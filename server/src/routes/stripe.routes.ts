import { Router } from 'express';
import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import * as stripeCtrl from '../controllers/stripe.controller';

const router = Router();

router.post('/checkout', verifyJWT, stripeCtrl.checkout);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeCtrl.webhook);
router.get('/portal', verifyJWT, stripeCtrl.portal);

export default router;
