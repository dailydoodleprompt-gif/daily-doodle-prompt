import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { kv } from '../../src/lib/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export const config = {
  api: {
    bodyParser: false, // REQUIRED for Stripe
  },
};

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).send('Missing Stripe signature');
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
    console.error('❌ Stripe signature verification failed:', err.message);
    return res.status(400).send('Invalid signature');
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

      console.log('✅ Premium unlocked for user:', userId);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
    return res.status(500).send('Webhook handler failed');
  }
}
