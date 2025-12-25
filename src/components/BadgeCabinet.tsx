import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useBadges } from '@/store/app-store';
import { type BadgeType, BADGE_INFO } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Flame,
  Trophy,
  Crown,
  Pencil,
  Bookmark,
  BookOpen,
  Sparkles,
  Zap,
  Rocket,
  Infinity,
  Heart,
  Library,
  Gem,
  Share2,
  Sprout,
  Trees,
  Wheat,
  Palette,
  Images,
  HeartHandshake,
  CalendarCheck,
  Lightbulb,
  Award,
} from 'lucide-react';

const badgeIcons: Record<BadgeType, typeof Flame> = {
  // Membership
  'creative_spark': Sparkles,
  'premium_patron': Crown,
  // Streaks - fire/energy progression
  'creative_ember': Flame,
  'creative_blaze': Flame,
  'creative_wildfire': Zap,
  'creative_inferno': Rocket,
  'creative_eternal': Infinity,
  // Collection - bookmark progression
  'new_collector': Bookmark,
  'pack_rat': BookOpen,
  'cue_curator': Library,
  'grand_gatherer': Gem,
  // Sharing - nature progression
  'planter_of_seeds': Sprout,
  'gardener_of_growth': Trees,
  'cultivator_of_influence': Trees,
  'harvester_of_inspiration': Wheat,
  // Creative - art progression
  'first_doodle': Pencil,
  'doodle_diary': BookOpen,
  'doodle_digest': Palette,
  'doodle_library': Images,
  'daily_doodler': CalendarCheck,
  // Social
  'warm_fuzzies': Heart,
  'somebody_likes_me': HeartHandshake,
  'idea_fairy': Lightbulb,
};

const badgeColors: Record<BadgeType, string> = {
  // Membership
  'creative_spark': 'from-violet-400 to-purple-500',
  'premium_patron': 'from-yellow-400 to-amber-500',
  // Streaks - progressively hotter colors
  'creative_ember': 'from-orange-400 to-red-500',
  'creative_blaze': 'from-red-500 to-orange-600',
  'creative_wildfire': 'from-yellow-400 to-orange-500',
  'creative_inferno': 'from-orange-500 to-red-600',
  'creative_eternal': 'from-purple-500 to-pink-600',
  // Collection - cool to warm
  'new_collector': 'from-blue-400 to-indigo-500',
  'pack_rat': 'from-indigo-400 to-purple-500',
  'cue_curator': 'from-purple-400 to-pink-500',
  'grand_gatherer': 'from-pink-400 to-rose-500',
  // Sharing - green/nature
  'planter_of_seeds': 'from-green-400 to-emerald-500',
  'gardener_of_growth': 'from-lime-400 to-green-500',
  'cultivator_of_influence': 'from-emerald-400 to-teal-500',
  'harvester_of_inspiration': 'from-yellow-400 to-amber-500',
  // Creative - warm artistic colors
  'first_doodle': 'from-amber-400 to-orange-500',
  'doodle_diary': 'from-orange-400 to-red-400',
  'doodle_digest': 'from-rose-400 to-pink-500',
  'doodle_library': 'from-fuchsia-400 to-purple-500',
  'daily_doodler': 'from-indigo-400 to-violet-500',
  // Social
  'warm_fuzzies': 'from-rose-400 to-red-500',
  'somebody_likes_me': 'from-pink-400 to-rose-500',
  'idea_fairy': 'from-yellow-300 to-amber-400',
};

// All badges in achievement-progress order (easier to harder)
const allBadgesOrdered: BadgeType[] = [
  // Membership - first things users get
  'creative_spark',
  // Early engagement
  'new_collector',
  'planter_of_seeds',
  'warm_fuzzies',
  // Streak progression
  'creative_ember',
  'creative_blaze',
  'creative_wildfire',
  'creative_inferno',
  'creative_eternal',
  // Doodle progression
  'first_doodle',
  'doodle_diary',
  'doodle_digest',
  'doodle_library',
  'daily_doodler',
  // Collection progression
  'pack_rat',
  'cue_curator',
  'grand_gatherer',
  // Sharing progression
  'gardener_of_growth',
  'cultivator_of_influence',
  'harvester_of_inspiration',
  // Social
  'somebody_likes_me',
  // Special achievements
  'idea_fairy',
  'premium_patron',
];

interface BadgeItemProps {
  badgeType: BadgeType;
  earned: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md';
}

function BadgeItem({ badgeType, earned, earnedAt, size = 'md' }: BadgeItemProps) {
  const info = BADGE_INFO[badgeType];
  const Icon = badgeIcons[badgeType];

  const sizeClasses = size === 'sm'
    ? 'w-12 h-12'
    : 'w-14 h-14 sm:w-16 sm:h-16';

  const iconClasses = size === 'sm'
    ? 'w-6 h-6'
    : 'w-7 h-7 sm:w-8 sm:h-8';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative rounded-full flex items-center justify-center transition-all cursor-pointer',
              sizeClasses,
              earned
                ? cn('bg-gradient-to-br shadow-lg text-white', badgeColors[badgeType])
                : 'bg-muted/50 text-muted-foreground/40 grayscale'
            )}
          >
            <Icon className={iconClasses} />
            {earned && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">{info.name}</p>
            <p className="text-sm text-foreground/80">{info.description}</p>
            {earned && earnedAt && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Earned on{' '}
                {new Date(earnedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
            {!earned && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Not yet earned
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BadgeCabinetProps {
  className?: string;
  compact?: boolean;
}

export function BadgeCabinet({ className, compact = false }: BadgeCabinetProps) {
  const badges = useBadges();

  const earnedBadgeMap = useMemo(() => {
    const map: Record<string, string> = {};
    badges.forEach((b) => {
      map[b.badge_type] = b.earned_at;
    });
    return map;
  }, [badges]);

  const stats = useMemo(() => {
    const total = allBadgesOrdered.length;
    const earned = badges.filter((b) =>
      allBadgesOrdered.includes(b.badge_type)
    ).length;
    return { total, earned };
  }, [badges]);

  // Sort: earned badges first (by earned date), then unearned
  const sortedBadges = useMemo(() => {
    const earned: { type: BadgeType; earnedAt: string }[] = [];
    const unearned: BadgeType[] = [];

    allBadgesOrdered.forEach((badgeType) => {
      if (earnedBadgeMap[badgeType]) {
        earned.push({ type: badgeType, earnedAt: earnedBadgeMap[badgeType] });
      } else {
        unearned.push(badgeType);
      }
    });

    // Sort earned by date (newest first)
    earned.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());

    return [...earned.map((e) => e.type), ...unearned];
  }, [earnedBadgeMap]);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5" />
            Badge Collection
          </CardTitle>
          <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            {stats.earned}/{stats.total}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "flex flex-wrap gap-2 sm:gap-3",
          compact ? "justify-start" : "justify-center"
        )}>
          {sortedBadges.map((badgeType) => (
            <BadgeItem
              key={badgeType}
              badgeType={badgeType}
              earned={!!earnedBadgeMap[badgeType]}
              earnedAt={earnedBadgeMap[badgeType]}
              size={compact ? 'sm' : 'md'}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}