// src/lib/email-service.ts
// REAL production email service using /api/send-email

import { getAuthToken } from '@/sdk/core/auth';

export interface EmailParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

const SUPPORT_INBOX_EMAIL =
  import.meta.env.SUPPORT_INBOX_EMAIL ||
  import.meta.env.VITE_SUPPORT_INBOX_EMAIL ||
  '';

/**
 * Sends an email notification (REAL PRODUCTION VERSION)
 */
export async function sendEmail(
  params: EmailParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('[EMAIL SERVICE] No auth token available');
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        text: params.body,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[EMAIL SERVICE] Failed:', errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error('[EMAIL SERVICE] Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send support ticket notification to admin
 */
export async function notifyAdminOfSupportTicket(params: {
  ticketId: string;
  userId: string | null;
  username: string;
  category: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!SUPPORT_INBOX_EMAIL) {
    console.warn('[EMAIL SERVICE] SUPPORT_INBOX_EMAIL not configured');
    return { success: false, error: 'Admin email not configured' };
  }

  const emailBody = `
New Support Ticket Received

Ticket ID: ${params.ticketId}
User ID: ${params.userId || 'Anonymous'}
Username: ${params.username}
Category: ${params.category}
Subject: ${params.subject}

Message:
${params.message}

---
View and respond to this ticket in the Admin Panel.
  `.trim();

  return sendEmail({
    to: SUPPORT_INBOX_EMAIL,
    subject: `[DailyDoodlePrompt] New Support Ticket: ${params.subject}`,
    body: emailBody,
  });
}

/**
 * Send doodle flag notification to admin
 */
export async function notifyAdminOfDoodleFlag(params: {
  ticketId: string;
  doodleId: string;
  reporterUserId: string;
  reporterUsername: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!SUPPORT_INBOX_EMAIL) {
    console.warn('[EMAIL SERVICE] SUPPORT_INBOX_EMAIL not configured');
    return { success: false, error: 'Admin email not configured' };
  }

  const emailBody = `
Doodle Flagged for Review

Ticket ID: ${params.ticketId}
Doodle ID: ${params.doodleId}
Reporter: ${params.reporterUsername} (${params.reporterUserId})

Reason:
${params.reason}

---
Review this doodle in the Admin Panel.
  `.trim();

  return sendEmail({
    to: SUPPORT_INBOX_EMAIL,
    subject: `[DailyDoodlePrompt] Doodle Flagged: ${params.doodleId}`,
    body: emailBody,
  });
}

/**
 * Send prompt idea notification to admin
 */
export async function notifyAdminOfPromptIdea(params: {
  ideaId: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  tags?: string[];
}): Promise<{ success: boolean; error?: string }> {
  if (!SUPPORT_INBOX_EMAIL) {
    console.warn('[EMAIL SERVICE] SUPPORT_INBOX_EMAIL not configured');
    return { success: false, error: 'Admin email not configured' };
  }

  const emailBody = `
New Prompt Idea Submitted

Idea ID: ${params.ideaId}
User: ${params.username} (${params.userId})
Title: ${params.title}

Description:
${params.description}

${params.tags && params.tags.length > 0 ? `Tags: ${params.tags.join(', ')}` : ''}

---
Review this idea in the Admin Panel.
  `.trim();

  return sendEmail({
    to: SUPPORT_INBOX_EMAIL,
    subject: `[DailyDoodlePrompt] New Prompt Idea: ${params.title}`,
    body: emailBody,
  });
}
