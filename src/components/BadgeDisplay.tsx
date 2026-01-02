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
  Orbit,
  Shrub,
  Flower,
  // Seasonal icons
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
  // Streak - fire/energy progression
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
  // Seasonal - Holiday badges
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
  'creative_spark': 'from-violet-400 to-purple-500 text-white',
  'premium_patron': 'from-yellow-400 to-amber-500 text-white',
  // Streak - progressively hotter colors
  'creative_ember': 'from-orange-400 to-red-500 text-white',
  'creative_fire': 'from-red-500 to-orange-600 text-white',
  'creative_blaze': 'from-yellow-400 to-orange-500 text-white',
  'creative_rocket': 'from-orange-500 to-red-600 text-white',
  'creative_supernova': 'from-purple-500 to-pink-600 text-white',
  // Collection - cool to warm
  'new_collector': 'from-blue-400 to-indigo-500 text-white',
  'pack_rat': 'from-indigo-400 to-purple-500 text-white',
  'cue_curator': 'from-purple-400 to-pink-500 text-white',
  'grand_gatherer': 'from-pink-400 to-rose-500 text-white',
  // Sharing - green/nature
  'planter_of_seeds': 'from-green-400 to-emerald-500 text-white',
  'gardener_of_growth': 'from-lime-400 to-green-500 text-white',
  'cultivator_of_influence': 'from-emerald-400 to-teal-500 text-white',
  'harvester_of_inspiration': 'from-yellow-400 to-amber-500 text-white',
  // Creative - warm artistic colors
  'first_doodle': 'from-amber-400 to-orange-500 text-white',
  'doodle_diary': 'from-orange-400 to-red-400 text-white',
  'doodle_digest': 'from-rose-400 to-pink-500 text-white',
  'doodle_library': 'from-fuchsia-400 to-purple-500 text-white',
  'daily_doodler': 'from-indigo-400 to-violet-500 text-white',
  // Social
  'warm_fuzzies': 'from-rose-400 to-red-500 text-white',
  'somebody_likes_me': 'from-pink-400 to-rose-500 text-white',
  'idea_fairy': 'from-yellow-300 to-amber-400 text-white',
  // Seasonal - Holiday badges (Legendary)
  'valentines_2026': 'from-pink-500 to-red-600 text-white',
  'lucky_creator_2026': 'from-emerald-500 to-green-600 text-white',
  'earth_day_2026': 'from-green-500 to-teal-600 text-white',
  'independence_2026': 'from-blue-500 to-red-500 text-white',
  'spooky_season_2026': 'from-orange-500 to-purple-600 text-white',
  'thanksgiving_2026': 'from-amber-500 to-orange-600 text-white',
  'holiday_spirit_2026': 'from-red-500 to-green-600 text-white',
  'new_year_spark_2027': 'from-yellow-400 to-amber-500 text-white',
  // Seasonal - Monthly challenge badges (Epic)
  'january_champion_2026': 'from-blue-400 to-cyan-500 text-white',
  'february_faithful_2026': 'from-pink-400 to-red-500 text-white',
  'march_maestro_2026': 'from-green-400 to-emerald-500 text-white',
  'april_artist_2026': 'from-sky-400 to-blue-500 text-white',
  'may_maven_2026': 'from-pink-400 to-rose-500 text-white',
  'june_genius_2026': 'from-yellow-400 to-orange-500 text-white',
  'july_journeyer_2026': 'from-cyan-400 to-teal-500 text-white',
  'august_ace_2026': 'from-orange-400 to-amber-500 text-white',
  'september_star_2026': 'from-amber-400 to-orange-500 text-white',
  'october_original_2026': 'from-purple-500 to-indigo-600 text-white',
  'november_notable_2026': 'from-orange-500 to-red-500 text-white',
  'december_dedicator_2026': 'from-blue-500 to-indigo-600 text-white',
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
  'creative_fire',
  'creative_blaze',
  'creative_rocket',
  'creative_supernova',
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
  'daily_doodler',
  // Social badges
  'warm_fuzzies',
  'somebody_likes_me',
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