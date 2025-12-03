import { cn } from '@/lib/utils';
import { useStreak, useIsPremium } from '@/store/app-store';
import { Flame, Snowflake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StreakBadgeProps {
  variant?: 'default' | 'large';
  showFreeze?: boolean;
  className?: string;
}

export function StreakBadge({
  variant = 'default',
  showFreeze = true,
  className,
}: StreakBadgeProps) {
  const streak = useStreak();
  const isPremium = useIsPremium();

  if (!streak) {
    return null;
  }

  const streakCount = streak.current_streak;
  const hasStreak = streakCount > 0;
  const freezeAvailable = isPremium && streak.streak_freeze_available;

  if (variant === 'large') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <div
          className={cn(
            'relative flex items-center justify-center w-24 h-24 rounded-full',
            hasStreak
              ? 'bg-gradient-to-br from-orange-400 to-red-500'
              : 'bg-muted'
          )}
        >
          <Flame
            className={cn(
              'w-12 h-12',
              hasStreak ? 'text-white' : 'text-muted-foreground'
            )}
          />
          <div className="absolute -bottom-2 bg-background rounded-full px-3 py-1 border shadow-sm">
            <span className="font-bold text-lg">{streakCount}</span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold">
            {streakCount === 1 ? '1 Day' : `${streakCount} Days`}
          </p>
          <p className="text-sm text-muted-foreground">Current Streak</p>
        </div>
        {showFreeze && isPremium && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={freezeAvailable ? 'default' : 'secondary'}
                  className={cn(
                    'gap-1',
                    freezeAvailable
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'opacity-60'
                  )}
                >
                  <Snowflake className="w-3 h-3" />
                  Streak Freeze {freezeAvailable ? 'Available' : 'Used'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {freezeAvailable
                  ? 'You can freeze your streak once this month if you miss a day'
                  : 'Streak freeze resets at the start of each month'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'gap-1 cursor-default',
              hasStreak
                ? 'border-orange-400 text-orange-600 dark:text-orange-400'
                : 'text-muted-foreground',
              className
            )}
          >
            <Flame
              className={cn(
                'w-3.5 h-3.5',
                hasStreak && 'text-orange-500 fill-orange-500'
              )}
            />
            <span className="font-semibold">{streakCount}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {hasStreak
              ? `${streakCount} day streak! Keep it going!`
              : 'Start your streak by viewing prompts daily'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
