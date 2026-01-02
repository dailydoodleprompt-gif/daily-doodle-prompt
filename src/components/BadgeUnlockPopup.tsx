import { useEffect, useState } from 'react';
import { useAppStore, useNewlyEarnedBadge } from '@/store/app-store';
import { type BadgeType, BADGE_INFO } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Flame,
  FlameKindling,
  Crown,
  Pencil,
  Bookmark,
  BookOpen,
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
  'creative_spark': Sparkles,
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

const badgeColors: Record<BadgeType, { bg: string; ring: string }> = {
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

export function BadgeUnlockPopup() {
  const newlyEarnedBadge = useNewlyEarnedBadge();
  const clearNewlyEarnedBadge = useAppStore((state) => state.clearNewlyEarnedBadge);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (newlyEarnedBadge) {
      setIsAnimating(true);
      // Reset animation state after animation completes
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [newlyEarnedBadge]);

  if (!newlyEarnedBadge) return null;

  const info = BADGE_INFO[newlyEarnedBadge];
  const Icon = badgeIcons[newlyEarnedBadge];
  const colors = badgeColors[newlyEarnedBadge];

  // Defensive check - if any lookup failed, don't render and clear the badge
  if (!info || !Icon || !colors) {
    console.error('[BadgeUnlockPopup] Missing data for badge:', newlyEarnedBadge, { info: !!info, Icon: !!Icon, colors: !!colors });
    // Clear the badge so we don't get stuck
    clearNewlyEarnedBadge();
    return null;
  }

  const handleClose = () => {
    clearNewlyEarnedBadge();
  };

  return (
    <Dialog open={!!newlyEarnedBadge} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Badge Unlocked!
          </DialogTitle>
          <DialogDescription className="text-center">
            Congratulations! You&apos;ve earned a new badge!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-4">
          {/* Animated Badge */}
          <div
            className={cn(
              'relative w-32 h-32 rounded-full flex items-center justify-center',
              'bg-gradient-to-br text-white shadow-2xl',
              'ring-8',
              colors.bg,
              colors.ring,
              isAnimating && 'animate-bounce'
            )}
          >
            <Icon className="w-16 h-16" />

            {/* Sparkle effects */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className={cn(
                'absolute w-6 h-6 text-yellow-300',
                '-top-2 -left-2',
                isAnimating && 'animate-pulse'
              )} />
              <Sparkles className={cn(
                'absolute w-4 h-4 text-yellow-300',
                'top-0 -right-1',
                isAnimating && 'animate-pulse delay-100'
              )} />
              <Sparkles className={cn(
                'absolute w-5 h-5 text-yellow-300',
                '-bottom-1 right-0',
                isAnimating && 'animate-pulse delay-200'
              )} />
            </div>
          </div>

          {/* Badge Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{info.name}</h3>
            <p className="text-muted-foreground">{info.description}</p>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full">
          Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
}