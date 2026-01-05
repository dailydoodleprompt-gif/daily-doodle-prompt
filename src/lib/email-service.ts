// src/lib/email-service.ts
// REAL production email service using /api/send-email
// NOTE: The API automatically sends to SUPPORT_INBOX_EMAIL (server-side env var)
// No client-side email configuration is needed.

import { getAuthToken } from '@/sdk/core/auth';

export interface EmailParams {
  subject: string;
  body: string;
  html?: string;
}

/**
 * Sends an email notification to the support inbox (REAL PRODUCTION VERSION)
 * The recipient is determined server-side from SUPPORT_INBOX_EMAIL env var.
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
    subject: `[DailyDoodlePrompt] New Prompt Idea: ${params.title}`,
    body: emailBody,
  });
}
