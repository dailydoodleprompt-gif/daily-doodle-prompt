import { cn } from '@/lib/utils';
import { useBadges } from '@/store/app-store';
import { type BadgeType, BADGE_INFO } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Flame,
  Trophy,
  Crown,
  Pencil,
  Bookmark,
  Sparkles,
  Zap,
  Heart,
  Archive,
  Library,
  Share2,
  Sprout,
  Trees,
  Image,
  BookImage,
  Images,
  HeartHandshake,
  CalendarCheck,
  Lightbulb,
} from 'lucide-react';

const badgeIcons: Record<BadgeType, typeof Flame> = {
  // Membership
  'creative_spark': Sparkles,
  'premium_patron': Crown,
  // Streak
  'creative_ember': Flame,
  'creative_blaze': Zap,
  'creative_wildfire': Flame,
  // Collection
  'new_collector': Heart,
  'pack_rat': Archive,
  'cue_curator': Library,
  'grand_gatherer': Crown,
  // Sharing
  'planter_of_seeds': Share2,
  'gardener_of_growth': Sprout,
  'cultivator_of_influence': Trees,
  'harvester_of_inspiration': Trophy,
  // Creative
  'first_doodle': Image,
  'doodle_diary': BookImage,
  'doodle_digest': Images,
  'doodle_library': Library,
  // Social
  'warm_fuzzies': Heart,
  'somebody_likes_me': HeartHandshake,
  'daily_doodler': CalendarCheck,
  'idea_fairy': Lightbulb,
  // Legacy
  '7_day_streak': Flame,
  '30_day_streak': Trophy,
  '100_day_streak': Crown,
  'first_prompt': Pencil,
  'first_bookmark': Bookmark,
};

const badgeColors: Record<BadgeType, string> = {
  // Membership - Purple/Gold
  'creative_spark': 'from-violet-400 to-purple-500 text-white',
  'premium_patron': 'from-yellow-400 to-amber-500 text-white',
  // Streak - Fire colors
  'creative_ember': 'from-orange-400 to-red-500 text-white',
  'creative_blaze': 'from-yellow-400 to-orange-500 text-white',
  'creative_wildfire': 'from-red-500 to-orange-600 text-white',
  // Collection - Blue/Teal
  'new_collector': 'from-pink-400 to-rose-500 text-white',
  'pack_rat': 'from-teal-400 to-cyan-500 text-white',
  'cue_curator': 'from-blue-400 to-indigo-500 text-white',
  'grand_gatherer': 'from-purple-400 to-pink-500 text-white',
  // Sharing - Green
  'planter_of_seeds': 'from-green-400 to-emerald-500 text-white',
  'gardener_of_growth': 'from-lime-400 to-green-500 text-white',
  'cultivator_of_influence': 'from-emerald-400 to-teal-500 text-white',
  'harvester_of_inspiration': 'from-yellow-400 to-amber-500 text-white',
  // Creative - Warm
  'first_doodle': 'from-amber-400 to-orange-500 text-white',
  'doodle_diary': 'from-orange-400 to-red-400 text-white',
  'doodle_digest': 'from-rose-400 to-pink-500 text-white',
  'doodle_library': 'from-fuchsia-400 to-purple-500 text-white',
  // Social - Pink/Red
  'warm_fuzzies': 'from-rose-400 to-red-500 text-white',
  'somebody_likes_me': 'from-pink-400 to-rose-500 text-white',
  'daily_doodler': 'from-indigo-400 to-violet-500 text-white',
  'idea_fairy': 'from-yellow-300 to-amber-400 text-white',
  // Legacy
  '7_day_streak': 'from-orange-400 to-red-500 text-white',
  '30_day_streak': 'from-yellow-400 to-amber-500 text-white',
  '100_day_streak': 'from-purple-400 to-pink-500 text-white',
  'first_prompt': 'from-green-400 to-emerald-500 text-white',
  'first_bookmark': 'from-blue-400 to-indigo-500 text-white',
};

interface BadgeItemProps {
  badgeType: BadgeType;
  earned: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

function BadgeItem({ badgeType, earned, earnedAt, size = 'md' }: BadgeItemProps) {
  const info = BADGE_INFO[badgeType];
  const Icon = badgeIcons[badgeType];

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'rounded-full flex items-center justify-center transition-all',
              sizeClasses[size],
              earned
                ? cn('bg-gradient-to-br shadow-lg', badgeColors[badgeType])
                : 'bg-muted text-muted-foreground opacity-40'
            )}
          >
            <Icon className={iconSizes[size]} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{info.name}</p>
            <p className="text-sm text-muted-foreground">{info.description}</p>
            {earned && earnedAt && (
              <p className="text-xs text-muted-foreground">
                Earned on{' '}
                {new Date(earnedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
            {!earned && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Not yet earned
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BadgeDisplayProps {
  showAll?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const allBadgeTypes: BadgeType[] = [
  // Membership
  'creative_spark',
  'premium_patron',
  // Streak badges
  'creative_ember',
  'creative_blaze',
  'creative_wildfire',
  // Collection badges
  'new_collector',
  'pack_rat',
  'cue_curator',
  'grand_gatherer',
  // Sharing badges
  'planter_of_seeds',
  'gardener_of_growth',
  'cultivator_of_influence',
  'harvester_of_inspiration',
  // Creative badges
  'first_doodle',
  'doodle_diary',
  'doodle_digest',
  'doodle_library',
  // Social badges
  'warm_fuzzies',
  'somebody_likes_me',
  'daily_doodler',
  'idea_fairy',
];

export function BadgeDisplay({
  showAll = false,
  size = 'md',
  className,
}: BadgeDisplayProps) {
  const badges = useBadges();

  const displayBadges = showAll
    ? allBadgeTypes
    : allBadgeTypes.filter((type) =>
        badges.some((b) => b.badge_type === type)
      );

  if (displayBadges.length === 0 && !showAll) {
    return (
      <p className="text-sm text-muted-foreground">
        No badges earned yet. Keep viewing prompts!
      </p>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {displayBadges.map((badgeType) => {
        const earnedBadge = badges.find((b) => b.badge_type === badgeType);
        return (
          <BadgeItem
            key={badgeType}
            badgeType={badgeType}
            earned={!!earnedBadge}
            earnedAt={earnedBadge?.earned_at}
            size={size}
          />
        );
      })}
    </div>
  );
}
