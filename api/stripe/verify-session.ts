import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

function getSessionId(req: VercelRequest): string | null {
  // Primary: Vercel parses query into req.query
  const fromQuery = req.query?.session_id;
  if (typeof fromQuery === 'string' && fromQuery.trim()) return fromQuery.trim();

  // Fallback: parse from req.url safely (no url.parse)
  try {
    const base = `https://${req.headers.host || 'www.dailydoodleprompt.com'}`;
    const url = new URL(req.url || '', base);
    const fromUrl = url.searchParams.get('session_id');
    if (fromUrl && fromUrl.trim()) return fromUrl.trim();
  } catch {
    // ignore
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id parameter' });
  }

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === 'paid';

    if (paid) {
      return res.status(200).json({
        success: true,
        paid: true,
        userId: session.client_reference_id || session.metadata?.userId || null,
        userEmail: session.customer_email || session.metadata?.userEmail || null,
        stripeCustomerId: session.customer ?? null,
        sessionId: session.id,
        paymentIntent: session.payment_intent ?? null,
        amount: session.amount_total ?? null,
        currency: session.currency ?? null,
      });
    }

    return res.status(200).json({
      success: true,
      paid: false,
      status: session.payment_status || 'unpaid',
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return res.status(500).json({
      error: 'Failed to verify session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
