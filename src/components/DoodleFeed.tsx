import { useState, useMemo } from 'react';
import { useAppStore, useUser, useIsAdmin, usePreferences } from '@/store/app-store';
import { type Doodle } from '@/types';
import { type Prompt } from '@/hooks/use-google-sheets';
import { LikeButton } from '@/components/LikeButton';
import { DoodleImage } from '@/components/DoodleImage';
import { BlurredDoodle } from '@/components/BlurredDoodle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Paintbrush,
  Calendar,
  Users,
  Image as ImageIcon,
  Trash2,
  Shield,
  Flag,
} from 'lucide-react';
import { ReportDoodleDialog } from '@/components/ReportDoodleDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getTodayEST, formatShortDate, getDateOffsetFromBase } from '@/lib/timezone';

interface FeedItem {
  type: 'prompt' | 'doodle';
  data: Prompt | Doodle;
  timestamp: string;
  userId?: string;
  username?: string;
}

interface DoodleFeedProps {
  prompts: Prompt[];
  className?: string;
  onUserClick?: (userId: string) => void;
  onPromptClick?: (promptId: string) => void;
  onAuthRequired?: () => void;
}

export function DoodleFeed({ prompts, className, onUserClick, onPromptClick, onAuthRequired }: DoodleFeedProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doodleToDelete, setDoodleToDelete] = useState<{ id: string; isAdmin: boolean } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [doodleToReport, setDoodleToReport] = useState<string | null>(null);

  const user = useUser();
  const isAdmin = useIsAdmin();
  const preferences = usePreferences();
  const getFeed = useAppStore((state) => state.getFeed);
  const getFollowingCount = useAppStore((state) => state.getFollowingCount);
  const deleteDoodle = useAppStore((state) => state.deleteDoodle);

  // Track which doodles have been revealed (when blur is enabled)
  const [revealedDoodles, setRevealedDoodles] = useState<Set<string>>(new Set());

  const handleRevealDoodle = (doodleId: string) => {
    setRevealedDoodles(prev => new Set(prev).add(doodleId));
  };

  const openDeleteDialog = (doodleId: string, asAdmin: boolean) => {
    setDoodleToDelete({ id: doodleId, isAdmin: asAdmin });
    setDeleteDialogOpen(true);
  };

  const openReportDialog = (doodleId: string) => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    setDoodleToReport(doodleId);
    setReportDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!doodleToDelete) return;

    try {
      deleteDoodle(doodleToDelete.id);
      toast.success(doodleToDelete.isAdmin ? 'Doodle deleted by admin' : 'Doodle deleted successfully');
      setRefreshKey(k => k + 1);
    } catch {
      toast.error('Failed to delete doodle');
    } finally {
      setDeleteDialogOpen(false);
      setDoodleToDelete(null);
    }
  };

  const followingCount = user ? getFollowingCount(user.id) : 0;

  // Combine prompts and doodles from followed users
  const feedItems = useMemo(() => {
    const items: FeedItem[] = [];

    // Add today's prompt using EST timezone
    const today = getTodayEST();
    const todayPrompt = prompts.find((p) => p.publish_date === today);
    if (todayPrompt) {
      items.push({
        type: 'prompt',
        data: todayPrompt,
        timestamp: new Date().toISOString(),
      });
    }

    // Add recent prompts (last 3 days) - compare date strings directly
    const recentPrompts = prompts
      .filter((p) => {
        // Compare YYYY-MM-DD strings directly to avoid timezone issues
        return p.publish_date < today && p.publish_date >= getDateOffsetFromBase(today, -3);
      })
      .slice(0, 2);

    recentPrompts.forEach((prompt) => {
      items.push({
        type: 'prompt',
        data: prompt,
        timestamp: new Date(prompt.publish_date).toISOString(),
      });
    });

    // Add doodles from followed users
    const doodleFeed = getFeed();
    doodleFeed.forEach((item) => {
      items.push({
        type: 'doodle',
        data: item.data,
        timestamp: item.timestamp,
      });
    });

    // Sort by timestamp, newest first
    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [prompts, getFeed]);

  if (!user) {
    return null;
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Doodle Feed
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {followingCount > 0
            ? `Your doodles and updates from ${followingCount} artist${followingCount > 1 ? 's' : ''} you follow`
            : 'Your doodles and prompts. Follow artists to see their work too!'}
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {feedItems.length === 0 ? (
          <div className="py-12 text-center px-6">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Your feed is empty</h3>
            <p className="text-sm text-muted-foreground">
              Follow other artists to see their doodles in your feed!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]" key={refreshKey}>
            <div className="space-y-0">
              {feedItems.map((item, index) => (
                <div key={`${item.type}-${item.type === 'prompt' ? (item.data as Prompt).id : (item.data as Doodle).id}`}>
                  {index > 0 && <Separator />}
                  {item.type === 'prompt' ? (
                    <PromptFeedItem prompt={item.data as Prompt} onPromptClick={onPromptClick} />
                  ) : (
                    <DoodleFeedItem
                      doodle={item.data as Doodle}
                      onUserClick={onUserClick}
                      onPromptClick={onPromptClick}
                      isAdmin={isAdmin}
                      onDeleteClick={openDeleteDialog}
                      onReportClick={openReportDialog}
                      onAuthRequired={onAuthRequired}
                      shouldBlur={preferences?.blur_doodles && (item.data as Doodle).user_id !== user?.id && !revealedDoodles.has((item.data as Doodle).id)}
                      onReveal={() => handleRevealDoodle((item.data as Doodle).id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {doodleToDelete?.isAdmin ? 'Admin Delete Doodle' : 'Delete Doodle'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {doodleToDelete?.isAdmin
                ? 'You are about to permanently delete this doodle as an admin. This action cannot be undone.'
                : 'Are you sure you want to delete this doodle? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <ReportDoodleDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        doodleId={doodleToReport || ''}
        onReportSubmitted={() => {
          setDoodleToReport(null);
        }}
      />
    </Card>
  );
}

interface PromptFeedItemProps {
  prompt: Prompt;
  onPromptClick?: (promptId: string) => void;
}

function PromptFeedItem({ prompt, onPromptClick }: PromptFeedItemProps) {
  const isToday = prompt.publish_date === getTodayEST();

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">Daily Prompt</span>
            {isToday && (
              <Badge variant="secondary" className="text-xs">
                Today
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={() => onPromptClick?.(prompt.id)}
            className={cn(
              "font-semibold text-base mb-1 text-left",
              onPromptClick && "hover:underline hover:text-primary cursor-pointer"
            )}
          >
            {prompt.title}
          </button>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {prompt.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {prompt.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatShortDate(prompt.publish_date)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DoodleFeedItemProps {
  doodle: Doodle;
  onUserClick?: (userId: string) => void;
  onPromptClick?: (promptId: string) => void;
  isAdmin?: boolean;
  onDeleteClick?: (doodleId: string, asAdmin: boolean) => void;
  onReportClick?: (doodleId: string) => void;
  onAuthRequired?: () => void;
  shouldBlur?: boolean;
  onReveal?: () => void;
}

function DoodleFeedItem({ doodle, onUserClick, onPromptClick, isAdmin, onDeleteClick, onReportClick, onAuthRequired, shouldBlur, onReveal }: DoodleFeedItemProps) {
  const user = useUser();
  const isOwn = doodle.user_id === user?.id;
  const username = doodle.user_username || 'Artist';
  const canDelete = isOwn || isAdmin;

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors group">
      <div className="flex items-start gap-3">
        {/* User Avatar with clickable link */}
        <button
          type="button"
          onClick={() => onUserClick?.(doodle.user_id)}
          className={cn(onUserClick && "cursor-pointer")}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUserClick?.(doodle.user_id)}
                className={cn(
                  "font-medium text-sm",
                  onUserClick && "hover:underline hover:text-primary cursor-pointer"
                )}
              >
                {username}
              </button>
              <span className="text-xs text-muted-foreground">
                {new Date(doodle.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Report button for non-owners */}
              {!isOwn && user && onReportClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onReportClick(doodle.id)}
                  title="Report doodle"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              )}
              {/* Delete button for owner or admin */}
              {canDelete && onDeleteClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => onDeleteClick(doodle.id, !isOwn && !!isAdmin)}
                  title={isOwn ? 'Delete doodle' : 'Admin delete'}
                >
                  {isOwn ? (
                    <Trash2 className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Doodle Preview - Click to view full prompt details (or reveal if blurred) */}
          <button
            type="button"
            onClick={() => {
              if (shouldBlur) {
                onReveal?.();
              } else {
                onPromptClick?.(doodle.prompt_id);
              }
            }}
            className={cn(
              "relative max-w-[300px] rounded-lg overflow-hidden mb-2 block w-full",
              !shouldBlur && onPromptClick && "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            )}
          >
            {shouldBlur ? (
              <BlurredDoodle
                imageUrl={doodle.image_url}
                alt={doodle.caption || doodle.prompt_title}
                className="w-full"
                isBlurred={true}
                onReveal={onReveal}
              />
            ) : (
              <DoodleImage
                src={doodle.image_url}
                alt={doodle.caption || doodle.prompt_title}
                className="w-full"
              />
            )}
          </button>

          {/* Prompt title as clickable link */}
          <button
            type="button"
            onClick={() => onPromptClick?.(doodle.prompt_id)}
            className={cn(
              "text-sm font-medium mb-1 text-left",
              onPromptClick && "hover:underline hover:text-primary cursor-pointer"
            )}
          >
            {doodle.prompt_title}
          </button>

          <LikeButton
            doodleId={doodle.id}
            likesCount={doodle.likes_count}
            isOwnDoodle={isOwn}
            size="sm"
            onAuthRequired={onAuthRequired}
          />
        </div>
      </div>
    </div>
  );
}
