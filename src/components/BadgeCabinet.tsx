import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useBadges, useAppStore } from '@/store/app-store';
import {
  type BadgeType,
  BADGE_INFO,
  isBadgeVisible,
  getDaysRemainingInMonth,
} from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Flame,
  FlameKindling,
  Crown,
  Pencil,
  Bookmark,
  BookOpen,
  Sparkle,
  Sparkles,
  Rocket,
  Heart,
  Library,
  Gem,
  Sprout,
  Trees,
  Palette,
  Images,
  HeartHandshake,
  CalendarCheck,
  Lightbulb,
  Award,
  Orbit,
  Shrub,
  Flower,
  // Seasonal badge icons
  Clover,
  Globe,
  Star,
  Ghost,
  Leaf,
  Gift,
  PartyPopper,
  Snowflake,
  Wind,
  CloudRain,
  Sun,
  Palmtree,
  Sunrise,
  Moon,
} from 'lucide-react';

const badgeIcons: Record<BadgeType, typeof Flame> = {
  // Membership
  'creative_spark': Sparkle,
  'premium_patron': Crown,
  // Streaks - fire/energy progression
  'creative_ember': Sparkles,
  'creative_fire': FlameKindling,
  'creative_blaze': Flame,
  'creative_rocket': Rocket,
  'creative_supernova': Orbit,
  // Collection - bookmark progression
  'new_collector': Bookmark,
  'pack_rat': BookOpen,
  'cue_curator': Library,
  'grand_gatherer': Gem,
  // Sharing - nature progression
  'planter_of_seeds': Sprout,
  'gardener_of_growth': Shrub,
  'cultivator_of_influence': Trees,
  'harvester_of_inspiration': Flower,
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
  // Seasonal - Holiday badges (icons as fallback, emoji shown primarily)
  'valentines_2026': Heart,
  'lucky_creator_2026': Clover,
  'earth_day_2026': Globe,
  'independence_2026': Star,
  'spooky_season_2026': Ghost,
  'thanksgiving_2026': Leaf,
  'holiday_spirit_2026': Gift,
  'new_year_spark_2027': PartyPopper,
  // Seasonal - Monthly challenge badges
  'january_champion_2026': Snowflake,
  'february_faithful_2026': Heart,
  'march_maestro_2026': Wind,
  'april_artist_2026': CloudRain,
  'may_maven_2026': Flower,
  'june_genius_2026': Sun,
  'july_journeyer_2026': Palmtree,
  'august_ace_2026': Sunrise,
  'september_star_2026': Leaf,
  'october_original_2026': Moon,
  'november_notable_2026': Leaf,
  'december_dedicator_2026': Snowflake,
};

const badgeColors: Record<BadgeType, string> = {
  // Membership
  'creative_spark': 'from-violet-400 to-purple-500',
  'premium_patron': 'from-yellow-400 to-amber-500',
  // Streaks - progressively hotter colors
  'creative_ember': 'from-orange-400 to-red-500',
  'creative_fire': 'from-red-500 to-orange-600',
  'creative_blaze': 'from-yellow-400 to-orange-500',
  'creative_rocket': 'from-orange-500 to-red-600',
  'creative_supernova': 'from-purple-500 to-pink-600',
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
  // Seasonal - Holiday badges (Legendary - golden/special colors)
  'valentines_2026': 'from-pink-500 to-red-600',
  'lucky_creator_2026': 'from-emerald-500 to-green-600',
  'earth_day_2026': 'from-green-500 to-teal-600',
  'independence_2026': 'from-blue-500 to-red-500',
  'spooky_season_2026': 'from-orange-500 to-purple-600',
  'thanksgiving_2026': 'from-amber-500 to-orange-600',
  'holiday_spirit_2026': 'from-red-500 to-green-600',
  'new_year_spark_2027': 'from-yellow-400 to-amber-500',
  // Seasonal - Monthly challenge badges (Epic - seasonal colors)
  'january_champion_2026': 'from-blue-400 to-cyan-500',
  'february_faithful_2026': 'from-pink-400 to-red-500',
  'march_maestro_2026': 'from-green-400 to-emerald-500',
  'april_artist_2026': 'from-sky-400 to-blue-500',
  'may_maven_2026': 'from-pink-400 to-rose-500',
  'june_genius_2026': 'from-yellow-400 to-orange-500',
  'july_journeyer_2026': 'from-cyan-400 to-teal-500',
  'august_ace_2026': 'from-orange-400 to-amber-500',
  'september_star_2026': 'from-amber-400 to-orange-500',
  'october_original_2026': 'from-purple-500 to-indigo-600',
  'november_notable_2026': 'from-orange-500 to-red-500',
  'december_dedicator_2026': 'from-blue-500 to-indigo-600',
};

const badgeColorRings: Record<BadgeType, { bg: string; ring: string }> = {
  // Membership
  'creative_spark': { bg: 'from-violet-400 to-purple-500', ring: 'ring-purple-500/50' },
  'premium_patron': { bg: 'from-yellow-400 to-amber-500', ring: 'ring-amber-500/50' },
  // Streak - progressively hotter colors
  'creative_ember': { bg: 'from-orange-400 to-red-500', ring: 'ring-orange-500/50' },
  'creative_fire': { bg: 'from-red-500 to-orange-600', ring: 'ring-red-500/50' },
  'creative_blaze': { bg: 'from-yellow-400 to-orange-500', ring: 'ring-yellow-500/50' },
  'creative_rocket': { bg: 'from-orange-500 to-red-600', ring: 'ring-orange-600/50' },
  'creative_supernova': { bg: 'from-purple-500 to-pink-600', ring: 'ring-purple-500/50' },
  // Collection - cool to warm
  'new_collector': { bg: 'from-blue-400 to-indigo-500', ring: 'ring-blue-500/50' },
  'pack_rat': { bg: 'from-indigo-400 to-purple-500', ring: 'ring-indigo-500/50' },
  'cue_curator': { bg: 'from-purple-400 to-pink-500', ring: 'ring-purple-500/50' },
  'grand_gatherer': { bg: 'from-pink-400 to-rose-500', ring: 'ring-pink-500/50' },
  // Sharing - green/nature
  'planter_of_seeds': { bg: 'from-green-400 to-emerald-500', ring: 'ring-green-500/50' },
  'gardener_of_growth': { bg: 'from-lime-400 to-green-500', ring: 'ring-lime-500/50' },
  'cultivator_of_influence': { bg: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-500/50' },
  'harvester_of_inspiration': { bg: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-500/50' },
  // Creative - warm artistic colors
  'first_doodle': { bg: 'from-amber-400 to-orange-500', ring: 'ring-amber-500/50' },
  'doodle_diary': { bg: 'from-orange-400 to-red-400', ring: 'ring-orange-500/50' },
  'doodle_digest': { bg: 'from-rose-400 to-pink-500', ring: 'ring-rose-500/50' },
  'doodle_library': { bg: 'from-fuchsia-400 to-purple-500', ring: 'ring-fuchsia-500/50' },
  'daily_doodler': { bg: 'from-indigo-400 to-violet-500', ring: 'ring-indigo-500/50' },
  // Social
  'warm_fuzzies': { bg: 'from-rose-400 to-red-500', ring: 'ring-rose-500/50' },
  'somebody_likes_me': { bg: 'from-pink-400 to-rose-500', ring: 'ring-pink-500/50' },
  'idea_fairy': { bg: 'from-yellow-300 to-amber-400', ring: 'ring-yellow-400/50' },
  // Seasonal - Holiday badges (Legendary)
  'valentines_2026': { bg: 'from-pink-500 to-red-600', ring: 'ring-pink-500/50' },
  'lucky_creator_2026': { bg: 'from-emerald-500 to-green-600', ring: 'ring-emerald-500/50' },
  'earth_day_2026': { bg: 'from-green-500 to-teal-600', ring: 'ring-green-500/50' },
  'independence_2026': { bg: 'from-blue-500 to-red-500', ring: 'ring-blue-500/50' },
  'spooky_season_2026': { bg: 'from-orange-500 to-purple-600', ring: 'ring-orange-500/50' },
  'thanksgiving_2026': { bg: 'from-amber-500 to-orange-600', ring: 'ring-amber-500/50' },
  'holiday_spirit_2026': { bg: 'from-red-500 to-green-600', ring: 'ring-red-500/50' },
  'new_year_spark_2027': { bg: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-500/50' },
  // Seasonal - Monthly challenge badges (Epic)
  'january_champion_2026': { bg: 'from-blue-400 to-cyan-500', ring: 'ring-blue-500/50' },
  'february_faithful_2026': { bg: 'from-pink-400 to-red-500', ring: 'ring-pink-500/50' },
  'march_maestro_2026': { bg: 'from-green-400 to-emerald-500', ring: 'ring-green-500/50' },
  'april_artist_2026': { bg: 'from-sky-400 to-blue-500', ring: 'ring-sky-500/50' },
  'may_maven_2026': { bg: 'from-pink-400 to-rose-500', ring: 'ring-pink-500/50' },
  'june_genius_2026': { bg: 'from-yellow-400 to-orange-500', ring: 'ring-yellow-500/50' },
  'july_journeyer_2026': { bg: 'from-cyan-400 to-teal-500', ring: 'ring-cyan-500/50' },
  'august_ace_2026': { bg: 'from-orange-400 to-amber-500', ring: 'ring-orange-500/50' },
  'september_star_2026': { bg: 'from-amber-400 to-orange-500', ring: 'ring-amber-500/50' },
  'october_original_2026': { bg: 'from-purple-500 to-indigo-600', ring: 'ring-purple-500/50' },
  'november_notable_2026': { bg: 'from-orange-500 to-red-500', ring: 'ring-orange-500/50' },
  'december_dedicator_2026': { bg: 'from-blue-500 to-indigo-600', ring: 'ring-blue-500/50' },
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
  'creative_fire',
  'creative_blaze',
  'creative_rocket',
  'creative_supernova',
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
  // Seasonal - Holiday badges (Legendary, year-specific)
  'valentines_2026',
  'lucky_creator_2026',
  'earth_day_2026',
  'independence_2026',
  'spooky_season_2026',
  'thanksgiving_2026',
  'holiday_spirit_2026',
  'new_year_spark_2027',
  // Seasonal - Monthly challenge badges (Epic, year-specific)
  'january_champion_2026',
  'february_faithful_2026',
  'march_maestro_2026',
  'april_artist_2026',
  'may_maven_2026',
  'june_genius_2026',
  'july_journeyer_2026',
  'august_ace_2026',
  'september_star_2026',
  'october_original_2026',
  'november_notable_2026',
  'december_dedicator_2026',
];

interface BadgeItemProps {
  badgeType: BadgeType;
  earned: boolean;
  earnedAt?: string;
  isNew: boolean;
  size?: 'sm' | 'md';
  onClick: () => void;
  monthlyProgress?: { current: number; total: number }; // For active monthly badges
}

function BadgeItem({ badgeType, earned, earnedAt, isNew, size = 'md', onClick, monthlyProgress }: BadgeItemProps) {
  const info = BADGE_INFO[badgeType];
  const Icon = badgeIcons[badgeType];
  const hasEmoji = !!info.emoji;
  const isMonthlyChallenge = info.category === 'seasonal' && info.rarity === 'epic' && !earned;
  const daysRemaining = isMonthlyChallenge ? getDaysRemainingInMonth() : 0;

  const sizeClasses = size === 'sm'
    ? 'w-12 h-12'
    : 'w-14 h-14 sm:w-16 sm:h-16';

  const iconClasses = size === 'sm'
    ? 'w-6 h-6'
    : 'w-7 h-7 sm:w-8 sm:h-8';

  const emojiClasses = size === 'sm'
    ? 'text-xl'
    : 'text-2xl sm:text-3xl';

  // Rarity badge colors - only show for earned badges
  const rarityBorderClass = earned ? (
    info.rarity === 'legendary'
      ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background'
      : info.rarity === 'epic'
      ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-background'
      : ''
  ) : '';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'relative rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110',
              sizeClasses,
              earned
                ? cn('bg-gradient-to-br shadow-lg text-white', badgeColors[badgeType], rarityBorderClass)
                : 'bg-muted/50 text-muted-foreground/40 grayscale hover:grayscale-0'
            )}
          >
            {hasEmoji ? (
              <span className={cn(emojiClasses, !earned && 'grayscale opacity-50')}>
                {info.emoji}
              </span>
            ) : (
              <Icon className={iconClasses} />
            )}

            {/* New badge indicator */}
            {earned && isNew && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            )}

            {/* Monthly challenge active indicator */}
            {isMonthlyChallenge && monthlyProgress && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{info.name}</p>
              {earned && info.rarity === 'legendary' && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded">
                  Legendary
                </span>
              )}
              {earned && info.rarity === 'epic' && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded">
                  Epic
                </span>
              )}
            </div>
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

            {/* Monthly challenge progress */}
            {isMonthlyChallenge && monthlyProgress && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Monthly Challenge Active!
                </p>
                <div className="text-xs text-muted-foreground">
                  {monthlyProgress.current}/{monthlyProgress.total} doodles uploaded
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (monthlyProgress.current / monthlyProgress.total) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {daysRemaining} days remaining
                </p>
              </div>
            )}

            {!earned && !isMonthlyChallenge && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Click to preview - Not yet earned
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
  const markBadgeAsViewed = useAppStore((state) => state.markBadgeAsViewed);
  const viewedBadges = useAppStore((state) => state.viewedBadges);
  const getDoodles = useAppStore((state) => state.getDoodles);
  const user = useAppStore((state) => state.user);

  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  const earnedBadgeTypes = useMemo(() => badges.map(b => b.badge_type), [badges]);

  const earnedBadgeMap = useMemo(() => {
    const map: Record<string, string> = {};
    badges.forEach((b) => {
      map[b.badge_type] = b.earned_at;
    });
    return map;
  }, [badges]);

  // Filter badges using visibility rules - hide secret badges and inactive seasonal badges
  const visibleBadges = useMemo(() => {
    return allBadgesOrdered.filter((badgeType) =>
      isBadgeVisible(badgeType, earnedBadgeTypes)
    );
  }, [earnedBadgeTypes]);

  // Calculate monthly doodle progress for the active monthly challenge
  const monthlyProgress = useMemo(() => {
    if (!user) return null;
    const userDoodles = getDoodles(user.id);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyDoodles = userDoodles.filter((d) => {
      const doodleDate = new Date(d.created_at);
      return doodleDate >= monthStart && doodleDate <= monthEnd;
    });

    return { current: monthlyDoodles.length, total: 15 };
  }, [user, getDoodles]);

  const stats = useMemo(() => {
    // Only count visible badges in the total
    const total = visibleBadges.length;
    const earned = badges.filter((b) =>
      visibleBadges.includes(b.badge_type)
    ).length;
    return { total, earned };
  }, [badges, visibleBadges]);

  // Sort: earned badges first (by earned date), then unearned
  const sortedBadges = useMemo(() => {
    const earned: { type: BadgeType; earnedAt: string }[] = [];
    const unearned: BadgeType[] = [];

    visibleBadges.forEach((badgeType) => {
      if (earnedBadgeMap[badgeType]) {
        earned.push({ type: badgeType, earnedAt: earnedBadgeMap[badgeType] });
      } else {
        unearned.push(badgeType);
      }
    });

    // Sort earned by date (newest first)
    earned.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());

    return [...earned.map((e) => e.type), ...unearned];
  }, [earnedBadgeMap, visibleBadges]);

  const handleBadgeClick = (badgeType: BadgeType) => {
    setSelectedBadge(badgeType);
    // Mark as viewed to remove green dot
    markBadgeAsViewed(badgeType);
  };

  const handleCloseDialog = () => {
    setSelectedBadge(null);
  };

  const selectedBadgeInfo = selectedBadge ? BADGE_INFO[selectedBadge] : null;
  const selectedBadgeIcon = selectedBadge ? badgeIcons[selectedBadge] : null;
  const selectedBadgeColors = selectedBadge ? badgeColorRings[selectedBadge] : null;
  const isSelectedEarned = selectedBadge ? !!earnedBadgeMap[selectedBadge] : false;
  const selectedEarnedAt = selectedBadge ? earnedBadgeMap[selectedBadge] : null;

  return (
    <>
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
            {sortedBadges.map((badgeType) => {
              const info = BADGE_INFO[badgeType];
              const isActiveMonthlyChallenge =
                info.category === 'seasonal' &&
                info.rarity === 'epic' &&
                !earnedBadgeMap[badgeType];

              return (
                <BadgeItem
                  key={badgeType}
                  badgeType={badgeType}
                  earned={!!earnedBadgeMap[badgeType]}
                  earnedAt={earnedBadgeMap[badgeType]}
                  isNew={!!earnedBadgeMap[badgeType] && !viewedBadges.includes(badgeType)}
                  size={compact ? 'sm' : 'md'}
                  onClick={() => handleBadgeClick(badgeType)}
                  monthlyProgress={isActiveMonthlyChallenge ? monthlyProgress ?? undefined : undefined}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Detail Dialog */}
{selectedBadge && selectedBadgeInfo && selectedBadgeIcon && selectedBadgeColors && (() => {
  const hasEmoji = !!selectedBadgeInfo.emoji;
  const isMonthlyChallenge =
    selectedBadgeInfo.category === 'seasonal' &&
    selectedBadgeInfo.rarity === 'epic' &&
    !isSelectedEarned;

  // Rarity ring for earned legendary/epic badges
  const rarityRingClass = isSelectedEarned ? (
    selectedBadgeInfo.rarity === 'legendary'
      ? 'ring-yellow-400'
      : selectedBadgeInfo.rarity === 'epic'
      ? 'ring-purple-400'
      : selectedBadgeColors.ring
  ) : selectedBadgeColors.ring;

  return (
    <Dialog open={!!selectedBadge} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {isSelectedEarned ? 'Badge Earned!' : 'Badge Preview'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSelectedEarned
              ? "You've unlocked this achievement!"
              : isMonthlyChallenge
              ? "Complete the monthly challenge to earn this badge!"
              : "Keep going to unlock this badge!"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-4">
          {/* Rarity badge - only show for earned badges */}
          {isSelectedEarned && selectedBadgeInfo.rarity && (
            <div className={cn(
              "px-3 py-1 text-xs font-bold uppercase rounded-full",
              selectedBadgeInfo.rarity === 'legendary' && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
              selectedBadgeInfo.rarity === 'epic' && "bg-purple-500/20 text-purple-600 dark:text-purple-400"
            )}>
              {selectedBadgeInfo.rarity}
            </div>
          )}

          {/* Badge Display */}
          <div
            className={cn(
              'relative w-32 h-32 rounded-full flex items-center justify-center',
              'bg-gradient-to-br text-white shadow-2xl ring-8',
              selectedBadgeColors.bg,
              rarityRingClass,
              !isSelectedEarned && 'opacity-50 grayscale'
            )}
          >
            {/* Render emoji or icon */}
            {hasEmoji ? (
              <span className={cn("text-5xl", !isSelectedEarned && "grayscale")}>
                {selectedBadgeInfo.emoji}
              </span>
            ) : (() => {
              const IconComponent = selectedBadgeIcon;
              return <IconComponent className="w-16 h-16" />;
            })()}

            {/* Sparkle effects for earned badges */}
            {isSelectedEarned && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="absolute w-6 h-6 text-yellow-300 -top-2 -left-2 animate-pulse" />
                <Sparkles className="absolute w-4 h-4 text-yellow-300 top-0 -right-1 animate-pulse" style={{ animationDelay: '100ms' }} />
                <Sparkles className="absolute w-5 h-5 text-yellow-300 -bottom-1 right-0 animate-pulse" style={{ animationDelay: '200ms' }} />
              </div>
            )}
          </div>

          {/* Badge Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{selectedBadgeInfo.name}</h3>
            <p className="text-muted-foreground">{selectedBadgeInfo.description}</p>

            {isSelectedEarned && selectedEarnedAt && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Earned on{' '}
                {new Date(selectedEarnedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}

            {/* Monthly challenge progress in dialog */}
            {isMonthlyChallenge && monthlyProgress && (
              <div className="space-y-2 pt-2">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Monthly Challenge Active!
                </p>
                <div className="text-sm text-muted-foreground">
                  {monthlyProgress.current}/{monthlyProgress.total} doodles uploaded
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (monthlyProgress.current / monthlyProgress.total) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {getDaysRemainingInMonth()} days remaining this month
                </p>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleCloseDialog} className="w-full">
          {isSelectedEarned ? 'Awesome!' : 'Got it!'}
        </Button>
      </DialogContent>
    </Dialog>
  );
})()}
    </>
  );
}