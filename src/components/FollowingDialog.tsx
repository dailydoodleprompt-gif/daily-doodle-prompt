import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserMinus, Users, Loader2 } from 'lucide-react';
import { useAppStore, useUser } from '@/store/app-store';
import { supabase } from '@/sdk/core/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FollowingUser {
  id: string;
  username: string;
  avatar_type?: string;
  avatar_icon?: string;
}

interface FollowingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserClick?: (userId: string) => void;
}

export function FollowingDialog({ open, onOpenChange, onUserClick }: FollowingDialogProps) {
  const user = useUser();
  const unfollowUser = useAppStore((state) => state.unfollowUser);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;

    async function fetchFollowing() {
      setLoading(true);
      try {
        // Get the list of users the current user is following
        const { data: follows, error: followsError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user!.id);

        if (followsError) throw followsError;

        if (!follows || follows.length === 0) {
          setFollowingUsers([]);
          return;
        }

        const followingIds = follows.map(f => f.following_id);

        // Fetch profile data for all followed users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_type, avatar_icon')
          .in('id', followingIds);

        if (profilesError) throw profilesError;

        setFollowingUsers(profiles || []);
      } catch (err) {
        console.error('Failed to fetch following users:', err);
        toast.error('Failed to load following list');
      } finally {
        setLoading(false);
      }
    }

    fetchFollowing();
  }, [open, user]);

  const handleUnfollow = (userId: string, username: string) => {
    unfollowUser(userId);
    setFollowingUsers(prev => prev.filter(u => u.id !== userId));
    toast.success(`Unfollowed ${username}`);
  };

  const handleUserClick = (userId: string) => {
    onOpenChange(false);
    onUserClick?.(userId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Following
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : followingUsers.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">You're not following anyone yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Follow artists to see their doodles in your feed!
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {followingUsers.map((followedUser) => (
                <div
                  key={followedUser.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleUserClick(followedUser.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {followedUser.username?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium hover:underline">
                      {followedUser.username || 'Unknown'}
                    </span>
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollow(followedUser.id, followedUser.username || 'user')}
                    className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <UserMinus className="h-4 w-4" />
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
