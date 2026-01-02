import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

function getBearerToken(req: VercelRequest): string | null {
  const header =
    (req.headers.authorization as string | undefined) ||
    (req.headers.Authorization as string | undefined);
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

// Inline HTML template for welcome email
const getWelcomeEmailHTML = (username: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #fdf8ee; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; margin-top: 40px; margin-bottom: 40px;">
    <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; margin: 0 0 20px; text-align: center;">
      Welcome to Daily Doodle Prompt!
    </h1>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Hi ${username},
    </p>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Thanks for joining our creative community! We're thrilled to have you here.
    </p>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Every day, you'll get a fresh creative prompt to spark your imagination. Whether you're a seasoned artist or just starting out, there's something for everyone.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://dailydoodleprompt.com" style="background-color: #6366f1; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 32px; display: inline-block;">
        Get Today's Prompt
      </a>
    </div>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      <strong>What you can do:</strong>
    </p>

    <p style="color: #404040; font-size: 16px; line-height: 28px; margin: 16px 0; padding-left: 20px;">
      - Get a new creative prompt every day<br>
      - Upload your doodles (Premium)<br>
      - Earn badges and build streaks<br>
      - Follow other artists and see their work<br>
      - Save your favorite prompts
    </p>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Ready to unlock all features?
      <a href="https://dailydoodleprompt.com/pricing" style="color: #6366f1; text-decoration: underline;">
        Get Lifetime Premium for just $4.99
      </a>
    </p>

    <p style="color: #404040; font-size: 16px; line-height: 24px; margin: 32px 0 16px;">
      Happy creating!<br>
      The Daily Doodle Prompt Team
    </p>

    <p style="color: #737373; font-size: 14px; line-height: 20px; margin: 16px 0; text-align: center;">
      Not interested in these emails?
      <a href="https://dailydoodleprompt.com/settings" style="color: #6366f1; text-decoration: underline;">
        Update your preferences
      </a>
    </p>
  </div>
</body>
</html>
`;

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

    const fromEmail = process.env.EMAIL_FROM || 'Daily Doodle Prompt <hello@dailydoodleprompt.com>';

    // Send email with inline HTML
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: 'Welcome to Daily Doodle Prompt!',
      html: getWelcomeEmailHTML(username),
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
