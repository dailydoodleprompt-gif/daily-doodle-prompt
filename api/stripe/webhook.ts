import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

// Inline HTML template for premium confirmation email
const getPremiumConfirmationEmailHTML = (username: string, purchaseDate: string, amount: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #fdf8ee; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; margin-top: 40px; margin-bottom: 40px;">
    <div style="text-align: center; margin: 0 0 32px;">
      <div style="font-size: 64px; margin: 0 0 16px;">&#128081;</div>
      <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px; text-align: center;">
        Welcome to Premium!
      </h1>
    </div>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Hi ${username},
    </p>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Thank you for supporting Daily Doodle Prompt! Your premium access is now active.
    </p>

    <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb;">
      <p style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin: 0 0 16px;">
        Purchase Details
      </p>
      <p style="color: #404040; font-size: 14px; line-height: 24px; margin: 8px 0;">
        <strong>Product:</strong> Lifetime Premium Access
      </p>
      <p style="color: #404040; font-size: 14px; line-height: 24px; margin: 8px 0;">
        <strong>Amount:</strong> ${amount}
      </p>
      <p style="color: #404040; font-size: 14px; line-height: 24px; margin: 8px 0;">
        <strong>Date:</strong> ${purchaseDate}
      </p>
      <p style="color: #404040; font-size: 14px; line-height: 24px; margin: 8px 0;">
        <strong>Status:</strong> Active
      </p>
    </div>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      <strong>Your Premium Features:</strong>
    </p>

    <p style="color: #404040; font-size: 16px; line-height: 28px; margin: 16px 0; padding-left: 20px;">
      - Unlimited doodle uploads<br>
      - Unlock all 23 badges<br>
      - Ad-free experience<br>
      - Support indie development<br>
      - Lifetime access - yours forever!
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://dailydoodleprompt.com" style="background-color: #6366f1; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 32px; display: inline-block;">
        Start Creating
      </a>
    </div>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      A Stripe receipt has been sent separately to your email.
    </p>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 32px 0 16px;">
      Thank you for your support!<br>
      The Daily Doodle Prompt Team
    </p>
  </div>
</body>
</html>
`;

// Upstash/Vercel KV (REST) client
const kv = Redis.fromEnv();

// Supabase client with service role for webhook operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Webhook] ❌ Missing Supabase env vars:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    });
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

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
    console.error('[Webhook] ❌ STRIPE_WEBHOOK_SECRET missing in env');
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
    console.error('[Webhook] ❌ Signature verification failed:', err?.message || err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log(`[Webhook] Received ${event.type} (${event.id})`);

  // ✅ Idempotency guard #1: event-level de-dupe
  // If Stripe retries the SAME event.id, we instantly ACK it.
  try {
    const eventKey = `stripe:event:${event.id}`;
    const firstTimeForEvent = await claimOnce(eventKey);

    if (!firstTimeForEvent) {
      console.log(`[Webhook] ↩️ Duplicate Stripe event ignored: ${event.id} (${event.type})`);
      return res.status(200).json({ received: true, duplicate: true });
    }
  } catch (err: any) {
    // If we cannot de-dupe (KV outage), we should 500 so Stripe retries later
    console.error('[Webhook] ❌ Failed to claim idempotency event key:', err?.message || err, {
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
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;

        console.log('[Webhook] Processing checkout.session.completed:', {
          sessionId: session.id,
          userId,
          userEmail,
          stripeCustomerId,
          amount: session.amount_total,
        });

        if (!userId) {
          // Don't 500 Stripe for missing metadata — log and ack
          console.warn('[Webhook] ⚠️ checkout.session.completed missing userId. session:', session.id);
          return res.status(200).json({ received: true, warning: 'missing_userId' });
        }

        // ✅ Idempotency guard #2: session-level de-dupe
        // Covers rare scenarios where session completion might be replayed via a different event id.
        const sessionProcessedKey = `stripe:session:${session.id}:processed`;
        const firstTimeForSession = await claimOnce(sessionProcessedKey);

        if (!firstTimeForSession) {
          console.log(`[Webhook] ↩️ Duplicate checkout session ignored: ${session.id} (user ${userId})`);
          return res.status(200).json({ received: true, duplicateSession: true });
        }

        // ============================================
        // STEP 1: Update Supabase profiles table FIRST
        // ============================================
        const supabase = getSupabaseAdmin();
        if (!supabase) {
          console.error('[Webhook] ❌ Supabase client not available');
          return res.status(500).json({ error: 'Database not configured' });
        }

        const now = new Date().toISOString();

        // Update premium status in profiles table
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_premium: true,
            stripe_customer_id: stripeCustomerId,
            updated_at: now,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('[Webhook] ❌ Database update failed:', {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            userId,
          });
          // Return 500 so Stripe retries the webhook
          return res.status(500).json({
            error: 'Database update failed',
            details: updateError.message,
          });
        }

        console.log('[Webhook] ✅ Premium status updated for user:', userId);

        // ============================================
        // STEP 2: Award premium_patron badge
        // ============================================
        const { error: badgeError } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: 'premium_patron',
            earned_at: now,
          });

        if (badgeError) {
          // Check if it's a duplicate key error (badge already exists)
          if (badgeError.code === '23505') {
            console.log('[Webhook] ℹ️ premium_patron badge already exists for user:', userId);
          } else {
            // Log but don't fail - premium is already activated
            console.warn('[Webhook] ⚠️ Badge award failed:', {
              code: badgeError.code,
              message: badgeError.message,
              userId,
            });
          }
        } else {
          console.log('[Webhook] ✅ premium_patron badge awarded to user:', userId);
        }

        // ============================================
        // STEP 3: Store audit record in KV (backup)
        // ============================================
        const record = {
          userId,
          userEmail,
          stripeSessionId: session.id,
          stripeCustomerId,
          paymentIntent: session.payment_intent ?? null,
          amountTotal: session.amount_total ?? null,
          currency: session.currency ?? null,
          purchasedAt: now,
          sourceEvent: event.id,
          supabaseUpdated: true,
        };

        try {
          await kv.set(`user:${userId}:premium`, record);
          await kv.set(`stripe:session:${session.id}`, record);
          console.log('[Webhook] ✅ Audit record stored in KV');
        } catch (kvErr: any) {
          // Log but don't fail - Supabase is the source of truth
          console.warn('[Webhook] ⚠️ KV storage failed (non-critical):', kvErr?.message || kvErr);
        }

        // ============================================
        // STEP 4: Send premium confirmation email
        // ============================================
        if (userEmail) {
          try {
            const resendApiKey = process.env.RESEND_API_KEY;
            if (resendApiKey) {
              const resend = new Resend(resendApiKey);

              // Get username for personalization
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', userId)
                .single();

              const username = profile?.username || 'Artist';
              const purchaseDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const amount = session.amount_total
                ? `$${(session.amount_total / 100).toFixed(2)}`
                : '$4.99';

              const fromEmail = process.env.EMAIL_FROM || 'Daily Doodle Prompt <onboarding@resend.dev>';

              const { error: emailError } = await resend.emails.send({
                from: fromEmail,
                to: userEmail,
                subject: 'Welcome to Premium!',
                html: getPremiumConfirmationEmailHTML(username, purchaseDate, amount),
              });

              if (emailError) {
                console.warn('[Webhook] ⚠️ Premium confirmation email failed:', emailError);
              } else {
                console.log('[Webhook] ✅ Premium confirmation email sent to:', userEmail);
              }
            } else {
              console.warn('[Webhook] ⚠️ RESEND_API_KEY not configured, skipping email');
            }
          } catch (emailErr: any) {
            // Log but don't fail - premium is already activated
            console.warn('[Webhook] ⚠️ Email send error (non-critical):', emailErr?.message || emailErr);
          }
        } else {
          console.warn('[Webhook] ⚠️ No email address available for confirmation email');
        }

        console.log('[Webhook] ✅ Webhook processed successfully for user:', userId);
        break;
      }

      case 'payment_intent.succeeded': {
        // PaymentIntent events do NOT include your userId metadata in your current flow.
        // We ACK them so Stripe stops retrying, and rely on checkout.session.completed for persistence.
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log('[Webhook] ℹ️ payment_intent.succeeded received:', pi.id);
        break;
      }

      default: {
        // Acknowledge everything else
        console.log(`[Webhook] ℹ️ Unhandled event type: ${event.type}`);
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[Webhook] ❌ Webhook handler crashed:', err?.message || err, {
      eventType: event.type,
      eventId: event.id,
      stack: err?.stack,
    });

    // Important: returning 500 means Stripe will retry the event
    // (which is what we want if persistence failed mid-flight).
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
