import { useEffect, useState } from 'react';
import { useAppStore, useUser } from '@/store/app-store';
import { type Notification } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  BellOff,
  CheckCheck,
  AlertCircle,
  ShieldAlert,
  ShieldX,
  Megaphone,
  Award,
  MessageSquare,
  FileCheck,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsListViewProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export function NotificationsListView({ onBack, onNavigate }: NotificationsListViewProps) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const user = useUser();
  const getNotifications = useAppStore((state) => state.getNotifications);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);

  useEffect(() => {
    if (user) {
      const allNotifications = getNotifications();
      setNotifications(allNotifications);
      setLoading(false);
    }
  }, [user, getNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      markNotificationRead(notification.id);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    }

    // Navigate to linked page if available
    if (notification.link && onNavigate) {
      onNavigate(notification.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'support_reply':
        return MessageSquare;
      case 'ticket_closed':
        return FileCheck;
      case 'report_resolved':
        return CheckCheck;
      case 'content_removed':
        return AlertCircle;
      case 'account_warning':
        return ShieldAlert;
      case 'account_banned':
        return ShieldX;
      case 'system_announcement':
        return Megaphone;
      case 'badge_earned':
        return Award;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'account_warning':
        return 'text-orange-500';
      case 'account_banned':
        return 'text-red-500';
      case 'badge_earned':
        return 'text-yellow-500';
      case 'system_announcement':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
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
              When you receive notifications about support tickets, badges, or other
              updates, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);
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
        </div>
      )}
    </div>
  );
}
