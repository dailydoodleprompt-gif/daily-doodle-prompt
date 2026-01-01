import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function getBearerToken(req: VercelRequest): string | null {
  const header =
    (req.headers.authorization as string | undefined) ||
    (req.headers.Authorization as string | undefined);
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Security: Require authentication to prevent abuse
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Validate the token
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: authError } = await supabase.auth.getUser(token);
    if (authError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
  }

  try {
    const { to, subject, text, html } = req.body as {
      to: string;
      subject: string;
      text: string;
      html?: string;
    };

    if (!to || !subject || !text) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Security: Only allow sending to the configured admin email
    const allowedRecipient = process.env.SUPPORT_INBOX_EMAIL || process.env.VITE_SUPPORT_INBOX_EMAIL;
    if (!allowedRecipient || to !== allowedRecipient) {
      res.status(403).json({ error: 'Recipient not allowed' });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.EMAIL_FROM || 'Daily Doodle Prompt <onboarding@resend.dev>';

    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      res.status(500).json({ error: 'Email service not configured' });
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html: html ?? `<pre>${text}</pre>`,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Resend error:', response.status, errorBody);
      res.status(500).json({ error: 'Failed to send email' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send-email error:', err);
    res.status(500).json({ error: 'Unexpected error' });
  }
}
