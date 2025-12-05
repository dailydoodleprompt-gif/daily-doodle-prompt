import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
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
