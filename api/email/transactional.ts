import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createClient } from '@supabase/supabase-js';

// Import email templates
import { WelcomeEmail } from '../emails/WelcomeEmail';
import { PremiumConfirmationEmail } from '../emails/PremiumConfirmationEmail';
import { BadgeUnlockEmail } from '../emails/BadgeUnlockEmail';
import { ReengagementEmail } from '../emails/ReengagementEmail';

type EmailType = 'welcome' | 'premium_confirmation' | 'badge_unlock' | 'reengagement';

interface EmailRequest {
  emailType: EmailType;
  recipientEmail: string;
  data?: {
    username?: string;
    badgeTitle?: string;
    badgeDescription?: string;
    badgeIcon?: string;
    purchaseDate?: string;
    amount?: string;
    daysSinceLastVisit?: number;
    todayPrompt?: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Verify internal API key for server-to-server calls
  const internalKey = req.headers['x-internal-api-key'];
  const expectedKey = process.env.INTERNAL_API_KEY;

  // For security, this endpoint should only be called from other server-side code
  // Either via internal API key or from the same Vercel deployment
  const isInternalCall =
    (expectedKey && internalKey === expectedKey) ||
    req.headers['x-vercel-deployment-url'];

  if (!isInternalCall && process.env.NODE_ENV === 'production') {
    // In production, require some form of server-side authentication
    // For now, we'll allow calls that come with valid Supabase service key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authHeader = req.headers.authorization;
    if (!authHeader || !serviceKey || authHeader !== `Bearer ${serviceKey}`) {
      res.status(403).json({ error: 'Forbidden - server-side access only' });
      return;
    }
  }

  try {
    const { emailType, recipientEmail, data } = req.body as EmailRequest;

    // Validate required fields
    if (!emailType || !recipientEmail) {
      res.status(400).json({ error: 'Missing required fields: emailType and recipientEmail' });
      return;
    }

    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('[Email] RESEND_API_KEY not configured');
      res.status(500).json({ error: 'Email service not configured' });
      return;
    }

    const resend = new Resend(resendApiKey);

    // Get username from database if not provided
    let username = data?.username;
    if (!username) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('email', recipientEmail)
          .single();

        username = profile?.username || 'Artist';
      }
    }

    // Determine email content based on type
    let subject: string;
    let html: string;

    switch (emailType) {
      case 'welcome':
        subject = 'Welcome to Daily Doodle Prompt!';
        html = await render(WelcomeEmail({ username: username || 'Artist' }));
        break;

      case 'premium_confirmation':
        subject = 'Welcome to Premium!';
        html = await render(PremiumConfirmationEmail({
          username: username || 'Artist',
          purchaseDate: data?.purchaseDate || new Date().toLocaleDateString(),
          amount: data?.amount || '$4.99',
        }));
        break;

      case 'badge_unlock':
        if (!data?.badgeTitle) {
          res.status(400).json({ error: 'badgeTitle required for badge_unlock emails' });
          return;
        }
        subject = `You unlocked: ${data.badgeTitle}!`;
        html = await render(BadgeUnlockEmail({
          username: username || 'Artist',
          badgeTitle: data.badgeTitle,
          badgeDescription: data.badgeDescription || '',
          badgeIcon: data.badgeIcon || '&#9889;',
        }));
        break;

      case 'reengagement':
        subject = `We miss you, ${username || 'Artist'}!`;
        html = await render(ReengagementEmail({
          username: username || 'Artist',
          daysSinceLastVisit: data?.daysSinceLastVisit || 7,
          todayPrompt: data?.todayPrompt || 'A creative adventure awaits',
        }));
        break;

      default:
        res.status(400).json({ error: `Invalid email type: ${emailType}` });
        return;
    }

    // Send email via Resend
    const fromEmail = process.env.EMAIL_FROM || 'Daily Doodle Prompt <onboarding@resend.dev>';

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: subject,
      html: html,
    });

    if (emailError) {
      console.error('[Email] Send failed:', emailError);
      res.status(500).json({ error: 'Failed to send email', details: emailError.message });
      return;
    }

    console.log(`[Email] Sent ${emailType} email to ${recipientEmail}:`, emailResult?.id);

    res.status(200).json({
      success: true,
      emailId: emailResult?.id,
      emailType,
      recipient: recipientEmail,
    });

  } catch (error) {
    console.error('[Email] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
