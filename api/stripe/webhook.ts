import Stripe from 'stripe';
import { kv } from '../lib/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

export const config = {
  api: {
    bodyParser: false, // 🚨 REQUIRED for Stripe
  },
};

async function getRawBody(req: Request): Promise<Buffer> {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Signature verification failed:', err.message);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const email = session.metadata?.userEmail;

      if (!userId) {
        throw new Error('Missing userId in session metadata');
      }

      await kv.set(`user:${userId}:premium`, {
        email,
        stripeSessionId: session.id,
        paymentIntent: session.payment_intent,
        purchasedAt: new Date().toISOString(),
      });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
    return new Response('Webhook handler failed', { status: 500 });
  }
}
