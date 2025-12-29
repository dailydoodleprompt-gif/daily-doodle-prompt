import { useAppStore, useUser, useIsAuthenticated } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  username?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showIcon?: boolean;
  className?: string;
  onAuthRequired?: () => void;
}

export function FollowButton({
  userId,
  username,
  size = 'default',
  variant = 'default',
  showIcon = true,
  className,
  onAuthRequired,
}: FollowButtonProps) {
  const currentUser = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isFollowing = useAppStore((state) => state.isFollowing(userId));
  const followUser = useAppStore((state) => state.followUser);
  const unfollowUser = useAppStore((state) => state.unfollowUser);

  // Can't follow yourself
  if (currentUser?.id === userId) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Prompt login if not authenticated
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  const Icon = isFollowing ? UserCheck : UserPlus;

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      className={cn(
        'gap-2',
        isFollowing && 'border-green-500 text-green-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 group',
        className
      )}
    >
      {showIcon && (
        <>
          <Icon className={cn(
            'h-4 w-4',
            isFollowing && 'group-hover:hidden'
          )} />
          {isFollowing && (
            <UserMinus className="h-4 w-4 hidden group-hover:block" />
          )}
        </>
      )}
      <span className={cn(isFollowing && 'group-hover:hidden')}>
        {isFollowing ? 'Following' : 'Follow'}
      </span>
      {isFollowing && (
        <span className="hidden group-hover:inline">Unfollow</span>
      )}
    </Button>
  );
}
