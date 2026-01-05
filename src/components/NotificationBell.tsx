import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
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
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import {
  getUnreadCount,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  formatNotificationTime,
} from '@/lib/notification-service';
import type { Notification, NotificationType } from '@/types';

interface NotificationBellProps {
  onNavigate: (view: string) => void;
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

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const user = useAppStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    const count = await getUnreadCount(true);
    setUnreadCount(count);
  }, [user?.id]);

  // Fetch recent notifications when dropdown opens
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const result = await fetchNotifications({ limit: 5 });
    setNotifications(result.notifications);
    setLoading(false);
  }, [user?.id]);

  // Initial load and subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    refreshUnreadCount();

    // Subscribe to real-time notification updates
    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);
      setUnreadCount((prev) => prev + 1);
    });

    // Refresh count periodically (every 60 seconds)
    const interval = setInterval(refreshUnreadCount, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user?.id, refreshUnreadCount]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      await markAsRead(notification.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    }

    // Navigate if link provided
    if (notification.link) {
      // Convert link to view name (e.g., '/profile' -> 'profile')
      const view = notification.link.replace(/^\//, '');
      onNavigate(view);
    }

    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  };

  const handleViewAll = () => {
    onNavigate('notifications');
    setOpen(false);
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <>
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || 'text-gray-500';

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer ${
                    !notification.read_at ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`mt-0.5 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notification.read_at ? '' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatNotificationTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-primary cursor-pointer"
          onClick={handleViewAll}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
