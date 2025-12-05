import type {
  SupportTicket,
  SupportTicketNote,
  SupportTicketStatus,
  SupportTicketCategory,
  Notification,
  NotificationType,
  PromptIdea,
  DoodleFlag,
} from '@/types';
import { notifyAdminOfSupportTicket, notifyAdminOfDoodleFlag, notifyAdminOfPromptIdea } from './email-service';

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

export function createSupportTicket(params: {
  userId: string | null;
  category: SupportTicketCategory;
  subject: string;
  message: string;
  relatedDoodleId?: string;
}): SupportTicket {
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

// Prompt Ideas
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

export async function submitPromptIdea(params: {
  userId: string;
  username: string;
  title: string;
  description: string;
  tags?: string[];
}): Promise<{ success: boolean; error?: string }> {
  const idea: PromptIdea = {
    id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: params.userId,
    title: params.title,
    description: params.description,
    tags: params.tags || [],
    created_at: new Date().toISOString(),
    status: 'submitted',
  };

  const ideas = getStoredPromptIdeas();
  ideas.push(idea);
  savePromptIdeas(ideas);

  // Send email notification to admin
  await notifyAdminOfPromptIdea({
    ideaId: idea.id,
    userId: params.userId,
    username: params.username,
    title: params.title,
    description: params.description,
    tags: params.tags,
  });

  return { success: true };
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
  // Create support ticket for the flag
  const ticket = createSupportTicket({
    userId: params.reporterUserId,
    category: 'doodle_flag',
    subject: `Doodle Flagged: ${params.doodleId}`,
    message: params.reason,
    relatedDoodleId: params.doodleId,
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
