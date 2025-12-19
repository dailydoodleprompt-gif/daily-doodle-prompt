import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

// Upstash/Vercel KV (REST) client
const kv = Redis.fromEnv();

// IMPORTANT: Stripe needs the raw body
export const config = {
  api: { bodyParser: false },
};

// Idempotency TTL (Stripe retries can span time; 14d is a safe window)
const DEDUPE_TTL_SECONDS = 60 * 60 * 24 * 14;

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Attempts to "claim" a key once using Redis SET NX (atomic).
 * Returns true if this is the first time, false if already claimed.
 */
async function claimOnce(key: string): Promise<boolean> {
  const result = await kv.set(key, '1', { nx: true, ex: DEDUPE_TTL_SECONDS });
  return result === 'OK';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Quick health check (optional but useful)
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET missing in env');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, String(sig), webhookSecret);
  } catch (err: any) {
    console.error('❌ Signature verification failed:', err?.message || err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // ✅ Idempotency guard #1: event-level de-dupe
  // If Stripe retries the SAME event.id, we instantly ACK it.
  try {
    const eventKey = `stripe:event:${event.id}`;
    const firstTimeForEvent = await claimOnce(eventKey);

    if (!firstTimeForEvent) {
      console.log(`↩️ Duplicate Stripe event ignored: ${event.id} (${event.type})`);
      return res.status(200).json({ received: true, duplicate: true });
    }
  } catch (err: any) {
    // If we cannot de-dupe (KV outage), we should 500 so Stripe retries later
    console.error('❌ Failed to claim idempotency event key:', err?.message || err, {
      eventType: event.type,
      eventId: event.id,
    });
    return res.status(500).json({ error: 'Idempotency claim failed' });
  }

  // NEVER throw for unhandled events — always return 200 (unless our persistence fails)
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Prefer client_reference_id, fall back to metadata
        const userId = session.client_reference_id || session.metadata?.userId || null;

        const userEmail = session.customer_email || session.metadata?.userEmail || null;

        if (!userId) {
          // Don't 500 Stripe for missing metadata — log and ack
          console.warn('⚠️ checkout.session.completed missing userId. session:', session.id);
          return res.status(200).json({ received: true, warning: 'missing_userId' });
        }

        // ✅ Idempotency guard #2: session-level de-dupe
        // Covers rare scenarios where session completion might be replayed via a different event id.
        const sessionProcessedKey = `stripe:session:${session.id}:processed`;
        const firstTimeForSession = await claimOnce(sessionProcessedKey);

        if (!firstTimeForSession) {
          console.log(`↩️ Duplicate checkout session ignored: ${session.id} (user ${userId})`);
          return res.status(200).json({ received: true, duplicateSession: true });
        }

        const record = {
          userId,
          userEmail,
          stripeSessionId: session.id,
          stripeCustomerId: session.customer ?? null,
          paymentIntent: session.payment_intent ?? null,
          amountTotal: session.amount_total ?? null,
          currency: session.currency ?? null,
          purchasedAt: new Date().toISOString(),
          sourceEvent: event.id,
        };

        // ✅ Durable writes (source of truth + session audit trail)
        await kv.set(`user:${userId}:premium`, record);
        await kv.set(`stripe:session:${session.id}`, record);

        console.log('✅ Persisted premium purchase for user:', userId);
        break;
      }

      case 'payment_intent.succeeded': {
        // PaymentIntent events do NOT include your userId metadata in your current flow.
        // We ACK them so Stripe stops retrying, and rely on checkout.session.completed for persistence.
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log('ℹ️ payment_intent.succeeded received:', pi.id);
        break;
      }

      default: {
        // Acknowledge everything else
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('❌ Webhook handler crashed:', err?.message || err, {
      eventType: event.type,
      eventId: event.id,
    });

    // Important: returning 500 means Stripe will retry the event
    // (which is what we want if persistence failed mid-flight).
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
