import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createOrGetCustomer(email: string, existingId?: string | null) {
  if (existingId) return existingId;
  const customer = await stripe.customers.create({ email });
  return customer.id;
}

export async function createCheckoutSession(customerId: string, userId: string) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.CLIENT_URL}/upgrade?cancelled=true`,
    metadata: { userId },
  });
}

export async function createPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.CLIENT_URL}/settings`,
  });
}
