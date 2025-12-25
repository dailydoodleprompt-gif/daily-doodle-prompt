import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useBadges, useAppStore } from '@/store/app-store';
import { type BadgeType, BADGE_INFO } from '@/types';
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
];

interface BadgeItemProps {
  badgeType: BadgeType;
  earned: boolean;
  earnedAt?: string;
  isNew: boolean;
  size?: 'sm' | 'md';
  onClick: () => void;
}

function BadgeItem({ badgeType, earned, earnedAt, isNew, size = 'md', onClick }: BadgeItemProps) {
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
          <button
            onClick={onClick}
            className={cn(
              'relative rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110',
              sizeClasses,
              earned
                ? cn('bg-gradient-to-br shadow-lg text-white', badgeColors[badgeType])
                : 'bg-muted/50 text-muted-foreground/40 grayscale hover:grayscale-0'
            )}
          >
            <Icon className={iconClasses} />
            {earned && isNew && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </button>
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
                Click to preview • Not yet earned
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
  
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

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
            {sortedBadges.map((badgeType) => (
              <BadgeItem
                key={badgeType}
                badgeType={badgeType}
                earned={!!earnedBadgeMap[badgeType]}
                earnedAt={earnedBadgeMap[badgeType]}
                isNew={!!earnedBadgeMap[badgeType] && !viewedBadges.includes(badgeType)}
                size={compact ? 'sm' : 'md'}
                onClick={() => handleBadgeClick(badgeType)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge Detail Dialog */}
{selectedBadge && selectedBadgeInfo && selectedBadgeIcon && selectedBadgeColors && (
  <Dialog open={!!selectedBadge} onOpenChange={handleCloseDialog}>
    <DialogContent className="sm:max-w-md text-center">
      <DialogHeader>
        <DialogTitle className="text-2xl text-center">
          {isSelectedEarned ? 'Badge Earned!' : 'Badge Preview'}
        </DialogTitle>
        <DialogDescription className="text-center">
          {isSelectedEarned 
            ? "You've unlocked this achievement!"
            : "Keep going to unlock this badge!"}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center py-6 space-y-4">
        {/* Badge Display */}
        <div
          className={cn(
            'relative w-32 h-32 rounded-full flex items-center justify-center',
            'bg-gradient-to-br text-white shadow-2xl ring-8',
            selectedBadgeColors.bg,
            selectedBadgeColors.ring,
            !isSelectedEarned && 'opacity-50 grayscale'
          )}
        >
          {/* Render the icon component */}
          {(() => {
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
        </div>
      </div>

      <Button onClick={handleCloseDialog} className="w-full">
        {isSelectedEarned ? 'Awesome!' : 'Got it!'}
      </Button>
    </DialogContent>
  </Dialog>
)}
    </>
  );
}