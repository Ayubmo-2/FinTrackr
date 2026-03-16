import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { stripe, createOrGetCustomer, createCheckoutSession, createPortalSession } from '../services/stripe.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function checkout(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const customerId = await createOrGetCustomer(user.email, user.stripeCustomerId);
  if (customerId !== user.stripeCustomerId) {
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await createCheckoutSession(customerId, user.id);
  return res.json({ url: session.url });
}

export async function webhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { tier: 'PRO', stripeSubId: session.subscription },
      });
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any;
    await prisma.user.updateMany({
      where: { stripeSubId: sub.id },
      data: { tier: 'FREE', stripeSubId: null },
    });
  }

  return res.status(200).json({ received: true });
}

export async function portal(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user?.stripeCustomerId) {
    return res.status(400).json({ error: 'No Stripe customer found' });
  }
  const session = await createPortalSession(user.stripeCustomerId);
  return res.json({ url: session.url });
}
