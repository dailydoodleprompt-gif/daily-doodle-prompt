import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createClient } from '@supabase/supabase-js';
import { WelcomeEmail } from '../emails/WelcomeEmail';

function getBearerToken(req: VercelRequest): string | null {
  const header =
    (req.headers.authorization as string | undefined) ||
    (req.headers.Authorization as string | undefined);
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Require authentication
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Validate the token and get user info
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const userEmail = authData.user.email;
  if (!userEmail) {
    res.status(400).json({ error: 'User has no email address' });
    return;
  }

  try {
    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('[WelcomeEmail] RESEND_API_KEY not configured');
      res.status(500).json({ error: 'Email service not configured' });
      return;
    }

    const resend = new Resend(resendApiKey);

    // Get username from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', authData.user.id)
      .single();

    const username = profile?.username || authData.user.user_metadata?.username || 'Artist';

    // Render email template
    const html = await render(WelcomeEmail({ username }));

    const fromEmail = process.env.EMAIL_FROM || 'Daily Doodle Prompt <onboarding@resend.dev>';

    // Send email
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: 'Welcome to Daily Doodle Prompt!',
      html: html,
    });

    if (emailError) {
      console.error('[WelcomeEmail] Send failed:', emailError);
      res.status(500).json({ error: 'Failed to send email' });
      return;
    }

    console.log(`[WelcomeEmail] Sent to ${userEmail}:`, emailResult?.id);

    res.status(200).json({ success: true, emailId: emailResult?.id });

  } catch (error) {
    console.error('[WelcomeEmail] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
