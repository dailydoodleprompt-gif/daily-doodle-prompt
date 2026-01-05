import type {
  SupportTicket,
  SupportTicketNote,
  SupportTicketStatus,
  SupportTicketCategory,
  Notification,
  NotificationType,
  PromptIdea,
  PromptIdeaStatus,
  DoodleFlag,
} from '@/types';
import { notifyAdminOfSupportTicket, notifyAdminOfDoodleFlag, notifyAdminOfPromptIdea } from './email-service';
import { supabase } from '@/sdk/core/supabase';

// Storage keys
const SUPPORT_TICKETS_KEY = 'dailydoodle_support_tickets';
const TICKET_NOTES_KEY = 'dailydoodle_ticket_notes';
const NOTIFICATIONS_KEY = 'dailydoodle_notifications';
const PROMPT_IDEAS_KEY = 'dailydoodle_prompt_ideas';
const DOODLE_FLAGS_KEY = 'dailydoodle_doodle_flags';

// Support Tickets
export function getStoredTickets(): SupportTicket[] {
  try {
    const stored = localStorage.getItem(SUPPORT_TICKETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTickets(tickets: SupportTicket[]): void {
  localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(tickets));
}

export async function createSupportTicket(params: {
  userId: string | null;
  username?: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
  relatedDoodleId?: string;
  skipEmailNotification?: boolean; // Set true when caller sends their own notification
}): Promise<SupportTicket> {
  const ticket: SupportTicket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: params.userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'open',
    category: params.category,
    subject: params.subject,
    message: params.message,
    related_doodle_id: params.relatedDoodleId || null,
  };

  const tickets = getStoredTickets();
  tickets.push(ticket);
  saveTickets(tickets);

  // Send email notification to admin (unless caller handles it)
  if (!params.skipEmailNotification) {
    try {
      await notifyAdminOfSupportTicket({
        ticketId: ticket.id,
        userId: params.userId,
        username: params.username || 'Unknown',
        category: params.category,
        subject: params.subject,
        message: params.message,
      });
    } catch (error) {
      console.error('[SUPPORT SERVICE] Failed to send email notification:', error);
      // Don't throw - ticket is already saved, email is secondary
    }
  }

  return ticket;
}

export function updateTicketStatus(ticketId: string, status: SupportTicketStatus, adminId: string, resolutionSummary?: string): boolean {
  const tickets = getStoredTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);

  if (ticketIndex === -1) return false;

  tickets[ticketIndex].status = status;
  tickets[ticketIndex].updated_at = new Date().toISOString();

  if (status === 'closed') {
    tickets[ticketIndex].closed_by_admin_id = adminId;
    tickets[ticketIndex].closed_at = new Date().toISOString();
    if (resolutionSummary) {
      tickets[ticketIndex].resolution_summary = resolutionSummary;
    }
  }

  saveTickets(tickets);
  return true;
}

// Ticket Notes
export function getStoredTicketNotes(): SupportTicketNote[] {
  try {
    const stored = localStorage.getItem(TICKET_NOTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTicketNotes(notes: SupportTicketNote[]): void {
  localStorage.setItem(TICKET_NOTES_KEY, JSON.stringify(notes));
}

export function addTicketNote(params: {
  ticketId: string;
  adminId: string;
  note: string;
  isInternal: boolean;
}): SupportTicketNote {
  const note: SupportTicketNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ticket_id: params.ticketId,
    admin_id: params.adminId,
    note: params.note,
    created_at: new Date().toISOString(),
    is_internal: params.isInternal,
  };

  const notes = getStoredTicketNotes();
  notes.push(note);
  saveTicketNotes(notes);

  // Update ticket timestamp
  const tickets = getStoredTickets();
  const ticketIndex = tickets.findIndex(t => t.id === params.ticketId);
  if (ticketIndex !== -1) {
    tickets[ticketIndex].updated_at = new Date().toISOString();
    saveTickets(tickets);
  }

  return note;
}

export function getTicketNotes(ticketId: string): SupportTicketNote[] {
  const allNotes = getStoredTicketNotes();
  return allNotes.filter(note => note.ticket_id === ticketId).sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

// Notifications
export function getStoredNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, unknown>;
}): Notification {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: params.userId,
    created_at: new Date().toISOString(),
    read_at: null,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link || null,
    metadata: params.metadata,
  };

  const notifications = getStoredNotifications();
  notifications.push(notification);
  saveNotifications(notifications);

  return notification;
}

export function markNotificationRead(notificationId: string, userId: string): boolean {
  const notifications = getStoredNotifications();
  const notifIndex = notifications.findIndex(n => n.id === notificationId && n.user_id === userId);

  if (notifIndex === -1) return false;

  notifications[notifIndex].read_at = new Date().toISOString();
  saveNotifications(notifications);
  return true;
}

export function getUserNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
  const allNotifications = getStoredNotifications();
  let userNotifications = allNotifications.filter(n => n.user_id === userId);

  if (unreadOnly) {
    userNotifications = userNotifications.filter(n => !n.read_at);
  }

  return userNotifications.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getUnreadCount(userId: string): number {
  return getUserNotifications(userId, true).length;
}

// Prompt Ideas - Supabase backed
export async function getPromptIdeas(status?: PromptIdeaStatus): Promise<PromptIdea[]> {
  try {
    let query = supabase
      .from('prompt_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[SUPPORT SERVICE] Failed to fetch prompt ideas:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      title: row.title,
      description: row.description,
      tags: row.tags || [],
      created_at: row.created_at,
      status: row.status as PromptIdeaStatus,
      reviewed_by_admin_id: row.reviewed_by_admin_id,
      reviewed_at: row.reviewed_at,
      admin_notes: row.admin_notes,
    }));
  } catch {
    return [];
  }
}

export async function getUserPromptIdeas(userId: string): Promise<PromptIdea[]> {
  try {
    const { data, error } = await supabase
      .from('prompt_ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SUPPORT SERVICE] Failed to fetch user prompt ideas:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      title: row.title,
      description: row.description,
      tags: row.tags || [],
      created_at: row.created_at,
      status: row.status as PromptIdeaStatus,
      reviewed_by_admin_id: row.reviewed_by_admin_id,
      reviewed_at: row.reviewed_at,
      admin_notes: row.admin_notes,
    }));
  } catch {
    return [];
  }
}

export async function submitPromptIdea(params: {
  userId: string;
  username: string;
  title: string;
  description: string;
  tags?: string[];
}): Promise<{ success: boolean; ideaId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('prompt_ideas')
      .insert({
        user_id: params.userId,
        username: params.username,
        title: params.title,
        description: params.description,
        tags: params.tags || [],
        status: 'submitted',
      })
      .select()
      .single();

    if (error) {
      console.error('[SUPPORT SERVICE] Failed to submit prompt idea:', error);
      return { success: false, error: error.message };
    }

    // Send email notification to admin
    try {
      await notifyAdminOfPromptIdea({
        ideaId: data.id,
        userId: params.userId,
        username: params.username,
        title: params.title,
        description: params.description,
        tags: params.tags,
      });
    } catch (emailError) {
      console.error('[SUPPORT SERVICE] Failed to send prompt idea email:', emailError);
      // Don't fail the submission if email fails
    }

    return { success: true, ideaId: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updatePromptIdeaStatus(params: {
  ideaId: string;
  status: PromptIdeaStatus;
  adminId: string;
  adminNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('prompt_ideas')
      .update({
        status: params.status,
        reviewed_by_admin_id: params.adminId,
        reviewed_at: new Date().toISOString(),
        admin_notes: params.adminNotes || null,
      })
      .eq('id', params.ideaId)
      .select()
      .single();

    if (error) {
      console.error('[SUPPORT SERVICE] Failed to update prompt idea:', error);
      return { success: false, error: error.message };
    }

    // Create notification for the user
    const statusMessages: Record<PromptIdeaStatus, { title: string; body: string }> = {
      submitted: { title: 'Prompt Idea Submitted', body: 'Your prompt idea has been submitted for review.' },
      under_review: { title: 'Prompt Idea Under Review', body: 'Your prompt idea is being reviewed by our team.' },
      approved: { title: 'Prompt Idea Approved!', body: `Great news! Your prompt idea "${data.title}" has been approved and may be featured in future prompts.` },
      rejected: { title: 'Prompt Idea Reviewed', body: `Your prompt idea "${data.title}" was reviewed but won't be used at this time.${params.adminNotes ? ` Feedback: ${params.adminNotes}` : ''}` },
    };

    const message = statusMessages[params.status];
    createNotification({
      userId: data.user_id,
      type: 'prompt_idea_reviewed',
      title: message.title,
      body: message.body,
      link: '/prompt-ideas',
      metadata: { ideaId: params.ideaId, status: params.status },
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getPromptIdeasCount(status?: PromptIdeaStatus): Promise<number> {
  try {
    let query = supabase
      .from('prompt_ideas')
      .select('id', { count: 'exact', head: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { count, error } = await query;

    if (error) {
      console.error('[SUPPORT SERVICE] Failed to count prompt ideas:', error);
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

// Legacy localStorage functions for backwards compatibility during migration
// These can be removed once all users have migrated to Supabase
export function getStoredPromptIdeas(): PromptIdea[] {
  try {
    const stored = localStorage.getItem(PROMPT_IDEAS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePromptIdeas(ideas: PromptIdea[]): void {
  localStorage.setItem(PROMPT_IDEAS_KEY, JSON.stringify(ideas));
}

// Doodle Flags
export function getStoredDoodleFlags(): DoodleFlag[] {
  try {
    const stored = localStorage.getItem(DOODLE_FLAGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveDoodleFlags(flags: DoodleFlag[]): void {
  localStorage.setItem(DOODLE_FLAGS_KEY, JSON.stringify(flags));
}

export async function flagDoodle(params: {
  doodleId: string;
  reporterUserId: string;
  reporterUsername: string;
  reason: string;
}): Promise<{ success: boolean; ticketId?: string; error?: string }> {
  // Create support ticket for the flag (skip email - flagDoodle sends its own specific notification)
  const ticket = await createSupportTicket({
    userId: params.reporterUserId,
    username: params.reporterUsername,
    category: 'doodle_flag',
    subject: `Doodle Flagged: ${params.doodleId}`,
    message: params.reason,
    relatedDoodleId: params.doodleId,
    skipEmailNotification: true,
  });

  // Create flag record
  const flag: DoodleFlag = {
    id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    doodle_id: params.doodleId,
    reporter_user_id: params.reporterUserId,
    reason: params.reason,
    created_at: new Date().toISOString(),
    ticket_id: ticket.id,
  };

  const flags = getStoredDoodleFlags();
  flags.push(flag);
  saveDoodleFlags(flags);

  // Send email notification to admin
  await notifyAdminOfDoodleFlag({
    ticketId: ticket.id,
    doodleId: params.doodleId,
    reporterUserId: params.reporterUserId,
    reporterUsername: params.reporterUsername,
    reason: params.reason,
  });

  return { success: true, ticketId: ticket.id };
}
