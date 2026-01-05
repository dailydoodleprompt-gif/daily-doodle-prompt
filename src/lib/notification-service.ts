/**
 * Notification Service - Supabase-backed notifications
 *
 * This service handles all notification operations using Supabase.
 * Notifications are stored in the `notifications` table and include:
 * - Like notifications (anonymous - no user details exposed)
 * - Follower notifications (anonymous - no user details exposed)
 * - Prompt idea review notifications
 * - Badge earned/available notifications
 * - Support ticket notifications
 * - System announcements
 * - Admin alerts
 */

import { supabase } from '@/sdk/core/supabase';
import type { Notification, NotificationType } from '@/types';

// Cache for unread count to reduce API calls
let unreadCountCache: { count: number; timestamp: number; userId: string | null } = {
  count: 0,
  timestamp: 0,
  userId: null,
};
const CACHE_TTL = 30000; // 30 seconds

/**
 * Fetch notifications for the current user
 */
export async function fetchNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ notifications: Notification[]; total: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { notifications: [], total: 0 };
    }

    const params = new URLSearchParams();
    if (options?.unreadOnly) params.set('unread', 'true');
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const response = await fetch(`/api/notifications?${params.toString()}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!response.ok) {
      console.error('[NOTIFICATION SERVICE] Failed to fetch notifications');
      return { notifications: [], total: 0 };
    }

    const data = await response.json();
    return {
      notifications: data.notifications || [],
      total: data.total || 0,
    };
  } catch (err) {
    console.error('[NOTIFICATION SERVICE] Error fetching notifications:', err);
    return { notifications: [], total: 0 };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(forceRefresh = false): Promise<number> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return 0;
    }

    // Check cache
    const now = Date.now();
    if (
      !forceRefresh &&
      unreadCountCache.userId === session.user.id &&
      now - unreadCountCache.timestamp < CACHE_TTL
    ) {
      return unreadCountCache.count;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .is('read_at', null);

    if (error) {
      console.error('[NOTIFICATION SERVICE] Error getting unread count:', error);
      return unreadCountCache.count; // Return cached value on error
    }

    // Update cache
    unreadCountCache = {
      count: count || 0,
      timestamp: now,
      userId: session.user.id,
    };

    return count || 0;
  } catch (err) {
    console.error('[NOTIFICATION SERVICE] Error getting unread count:', err);
    return 0;
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return false;
    }

    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notification_id: notificationId }),
    });

    if (response.ok) {
      // Invalidate cache
      unreadCountCache.timestamp = 0;
    }

    return response.ok;
  } catch (err) {
    console.error('[NOTIFICATION SERVICE] Error marking as read:', err);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return false;
    }

    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mark_all: true }),
    });

    if (response.ok) {
      // Invalidate cache
      unreadCountCache = { count: 0, timestamp: Date.now(), userId: unreadCountCache.userId };
    }

    return response.ok;
  } catch (err) {
    console.error('[NOTIFICATION SERVICE] Error marking all as read:', err);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return false;
    }

    const response = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notification_id: notificationId }),
    });

    if (response.ok) {
      unreadCountCache.timestamp = 0;
    }

    return response.ok;
  } catch (err) {
    console.error('[NOTIFICATION SERVICE] Error deleting notification:', err);
    return false;
  }
}

/**
 * Create a notification (for client-side use, limited to certain types)
 * Most notifications are created via database triggers or server-side
 */
export async function createNotification(params: {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, unknown>;
  targetUserId?: string; // Only for admins
}): Promise<{ success: boolean; notification?: Notification }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false };
    }

    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_user_id: params.targetUserId,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link,
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    unreadCountCache.timestamp = 0; // Invalidate cache

    return { success: true, notification: data.notification };
  } catch (err) {
    console.error('[NOTIFICATION SERVICE] Error creating notification:', err);
    return { success: false };
  }
}

/**
 * Subscribe to real-time notification updates
 * Returns an unsubscribe function
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: Notification) => void
): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const notification = payload.new as Notification;
        unreadCountCache.timestamp = 0; // Invalidate cache
        onNewNotification(notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    like_received: 'Heart',
    follower_gained: 'UserPlus',
    prompt_idea_reviewed: 'Lightbulb',
    badge_earned: 'Award',
    badge_available: 'Star',
    streak_reminder: 'Flame',
    support_reply: 'MessageCircle',
    ticket_closed: 'CheckCircle',
    system_announcement: 'Megaphone',
    admin_alert: 'AlertTriangle',
  };
  return icons[type] || 'Bell';
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    like_received: 'text-pink-500',
    follower_gained: 'text-blue-500',
    prompt_idea_reviewed: 'text-yellow-500',
    badge_earned: 'text-amber-500',
    badge_available: 'text-purple-500',
    streak_reminder: 'text-orange-500',
    support_reply: 'text-green-500',
    ticket_closed: 'text-green-600',
    system_announcement: 'text-blue-600',
    admin_alert: 'text-red-500',
  };
  return colors[type] || 'text-gray-500';
}

/**
 * Format notification time as relative string
 */
export function formatNotificationTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return created.toLocaleDateString();
}
