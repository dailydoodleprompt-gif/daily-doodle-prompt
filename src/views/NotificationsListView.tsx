import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/store/app-store';
import { type Notification, type NotificationType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  BellOff,
  CheckCheck,
  ArrowLeft,
  Heart,
  UserPlus,
  Lightbulb,
  Award,
  Star,
  Flame,
  MessageCircle,
  CheckCircle,
  Megaphone,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
} from '@/lib/notification-service';

interface NotificationsListViewProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

// Icon mapping for notification types
const notificationIcons: Record<NotificationType, React.ElementType> = {
  like_received: Heart,
  follower_gained: UserPlus,
  prompt_idea_reviewed: Lightbulb,
  badge_earned: Award,
  badge_available: Star,
  streak_reminder: Flame,
  support_reply: MessageCircle,
  ticket_closed: CheckCircle,
  system_announcement: Megaphone,
  admin_alert: AlertTriangle,
};

// Color mapping for notification types
const notificationColors: Record<NotificationType, string> = {
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

export function NotificationsListView({ onBack, onNavigate }: NotificationsListViewProps) {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const user = useUser();

  const loadNotifications = useCallback(async (offset = 0, append = false) => {
    if (!user) return;

    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await fetchNotifications({ limit: 20, offset });

      if (append) {
        setNotifications((prev) => [...prev, ...result.notifications]);
      } else {
        setNotifications(result.notifications);
      }

      setTotal(result.total);
      setHasMore(offset + result.notifications.length < result.total);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();

      // Subscribe to real-time updates
      const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        setTotal((prev) => prev + 1);
      });

      return () => unsubscribe();
    }
  }, [user, loadNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      const success = await markAsRead(notification.id);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
      }
    }

    // Navigate to linked page if available
    if (notification.link && onNavigate) {
      // Convert link to view name (e.g., '/profile' -> 'profile')
      const view = notification.link.replace(/^\//, '');
      onNavigate(view);
    }
  };

  const handleMarkAllRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    }
  };

  const handleLoadMore = () => {
    loadNotifications(notifications.length, true);
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
            <p className="text-muted-foreground text-center max-w-md">
              When someone likes your doodle, follows you, or when you receive updates
              about your prompt ideas, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell;
            const iconColor = notificationColors[notification.type] || 'text-muted-foreground';
            const isUnread = !notification.read_at;

            return (
              <Card
                key={notification.id}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-accent',
                  isUnread && 'bg-accent/50'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={cn('mt-1', iconColor)}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={cn('font-semibold', isUnread && 'font-bold')}>
                        {notification.title}
                      </h3>
                      {isUnread && (
                        <Badge variant="default" className="shrink-0">
                          New
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.body}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load more (${total - notifications.length} remaining)`
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
