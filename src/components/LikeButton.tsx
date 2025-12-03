import { useState, useEffect, useCallback } from 'react';
import { useAppStore, useIsAuthenticated, useUser } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  doodleId: string;
  likesCount: number;
  isOwnDoodle?: boolean;
  size?: 'sm' | 'default';
  className?: string;
  onLikeChange?: (newCount: number, isLiked: boolean) => void;
}

export function LikeButton({
  doodleId,
  likesCount: initialLikesCount,
  isOwnDoodle = false,
  size = 'default',
  className,
  onLikeChange,
}: LikeButtonProps) {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const likeDoodle = useAppStore((state) => state.likeDoodle);
  const unlikeDoodle = useAppStore((state) => state.unlikeDoodle);
  const hasLikedDoodle = useAppStore((state) => state.hasLikedDoodle);
  const awardBadge = useAppStore((state) => state.awardBadge);
  const hasBadge = useAppStore((state) => state.hasBadge);

  // Local state for immediate UI feedback
  const [isLiked, setIsLiked] = useState(() => hasLikedDoodle(doodleId));
  const [displayCount, setDisplayCount] = useState(initialLikesCount);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync with store state when doodleId changes or on mount
  useEffect(() => {
    setIsLiked(hasLikedDoodle(doodleId));
  }, [doodleId, hasLikedDoodle, user?.id]);

  // Update display count when prop changes (from parent re-render)
  useEffect(() => {
    setDisplayCount(initialLikesCount);
  }, [initialLikesCount]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || isOwnDoodle) return;

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (isLiked) {
      // Unlike
      unlikeDoodle(doodleId);
      const newCount = Math.max(0, displayCount - 1);
      setDisplayCount(newCount);
      setIsLiked(false);
      onLikeChange?.(newCount, false);
    } else {
      // Like
      likeDoodle(doodleId);
      const newCount = displayCount + 1;
      setDisplayCount(newCount);
      setIsLiked(true);
      onLikeChange?.(newCount, true);

      // Check for Warm-Fuzzies badge (first like given)
      if (!hasBadge('warm_fuzzies')) {
        // Badge is already awarded in likeDoodle, but we ensure UI feedback
      }
    }
  }, [isAuthenticated, isOwnDoodle, isLiked, doodleId, displayCount, likeDoodle, unlikeDoodle, onLikeChange, hasBadge]);

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-7 px-2 text-xs' : 'h-9 px-3';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={!isAuthenticated || isOwnDoodle}
      className={cn(
        'gap-1.5',
        buttonSize,
        isLiked && 'text-red-500 hover:text-red-600',
        isOwnDoodle && 'cursor-default opacity-70',
        className
      )}
    >
      <Heart
        className={cn(
          iconSize,
          'transition-all duration-200',
          isLiked && 'fill-current',
          isAnimating && 'scale-125'
        )}
      />
      <span>{displayCount}</span>
    </Button>
  );
}
