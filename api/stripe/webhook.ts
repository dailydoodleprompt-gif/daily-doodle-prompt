import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { kv } from '../lib/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

// Disable body parsing — Stripe requires raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: read raw request body
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature as string,
      webhookSecret
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId =
          session.client_reference_id || session.metadata?.userId;

        if (!userId) {
          console.error('❌ checkout.session.completed without userId');
          return res.status(400).json({ error: 'Missing userId in session' });
        }

        const subscriptionRecord = {
          status: 'active',
          stripeSessionId: session.id,
          stripeCustomerId: session.customer,
          stripePaymentIntent: session.payment_intent,
          amount: session.amount_total,
          currency: session.currency,
          purchasedAt: new Date().toISOString(),
        };

        // ✅ Authoritative persistence
        await kv.set(
          `user:${userId}:subscription`,
          subscriptionRecord
        );

        console.log('✅ Subscription activated for user:', userId);
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.log('ℹ️ PaymentIntent succeeded:', intent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.error('⚠️ PaymentIntent failed:', intent.id);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
    }

    // Stripe requires a 200 to acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({
      error: 'Webhook handler failed',
      message:
        error instanceof Error ? error.message : 'Unknown webhook error',
    });
  }
}
