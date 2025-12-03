import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'Missing session_id parameter' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        paid: true,
        userId: session.client_reference_id || session.metadata?.userId,
        userEmail: session.customer_email || session.metadata?.userEmail,
        stripeCustomerId: session.customer,
        sessionId: session.id,
        paymentIntent: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
      });
    }

    return res.status(200).json({
      success: true,
      paid: false,
      status: session.payment_status,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return res.status(500).json({
      error: 'Failed to verify session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
