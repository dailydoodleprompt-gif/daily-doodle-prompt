import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userEmail } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields: userId and userEmail' });
    }

    // Get environment variables
    const priceId = process.env.STRIPE_PRICE_ID;
    const successUrl = process.env.STRIPE_SUCCESS_URL || `${req.headers.origin}/payment/success`;
    const cancelUrl = process.env.STRIPE_CANCEL_URL || `${req.headers.origin}/payment/cancel`;

    if (!priceId) {
      return res.status(500).json({ error: 'Stripe Price ID not configured' });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      client_reference_id: userId, // Store user ID to identify them in webhook
      metadata: {
        userId: userId,
        userEmail: userEmail,
        product: 'lifetime_premium',
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
