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
import { cn } from '@/lib/utils';

const badgeIcons: Record<BadgeType, typeof Flame> = {
  'creative_spark': Sparkles,
  'premium_patron': Crown,
  'creative_ember': Flame,
  'creative_blaze': Zap,
  'creative_wildfire': Flame,
  'new_collector': Heart,
  'pack_rat': Archive,
  'cue_curator': Library,
  'grand_gatherer': Crown,
  'planter_of_seeds': Share2,
  'gardener_of_growth': Sprout,
  'cultivator_of_influence': Trees,
  'harvester_of_inspiration': Trophy,
  'first_doodle': Image,
  'doodle_diary': BookImage,
  'doodle_digest': Images,
  'doodle_library': Library,
  'warm_fuzzies': Heart,
  'somebody_likes_me': HeartHandshake,
  'daily_doodler': CalendarCheck,
  'idea_fairy': Lightbulb,
  '7_day_streak': Flame,
  '30_day_streak': Trophy,
  '100_day_streak': Crown,
  'first_prompt': Pencil,
  'first_bookmark': Bookmark,
};

const badgeColors: Record<BadgeType, { bg: string; ring: string }> = {
  'creative_spark': { bg: 'from-violet-400 to-purple-500', ring: 'ring-purple-500/50' },
  'premium_patron': { bg: 'from-yellow-400 to-amber-500', ring: 'ring-amber-500/50' },
  'creative_ember': { bg: 'from-orange-400 to-red-500', ring: 'ring-orange-500/50' },
  'creative_blaze': { bg: 'from-yellow-400 to-orange-500', ring: 'ring-yellow-500/50' },
  'creative_wildfire': { bg: 'from-red-500 to-orange-600', ring: 'ring-red-500/50' },
  'new_collector': { bg: 'from-pink-400 to-rose-500', ring: 'ring-pink-500/50' },
  'pack_rat': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'cue_curator': { bg: 'from-blue-400 to-indigo-500', ring: 'ring-blue-500/50' },
  'grand_gatherer': { bg: 'from-purple-400 to-pink-500', ring: 'ring-purple-500/50' },
  'planter_of_seeds': { bg: 'from-green-400 to-emerald-500', ring: 'ring-green-500/50' },
  'gardener_of_growth': { bg: 'from-lime-400 to-green-500', ring: 'ring-lime-500/50' },
  'cultivator_of_influence': { bg: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-500/50' },
  'harvester_of_inspiration': { bg: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-500/50' },
  'first_doodle': { bg: 'from-amber-400 to-orange-500', ring: 'ring-amber-500/50' },
  'doodle_diary': { bg: 'from-orange-400 to-red-400', ring: 'ring-orange-500/50' },
  'doodle_digest': { bg: 'from-rose-400 to-pink-500', ring: 'ring-rose-500/50' },
  'doodle_library': { bg: 'from-fuchsia-400 to-purple-500', ring: 'ring-fuchsia-500/50' },
  'warm_fuzzies': { bg: 'from-rose-400 to-red-500', ring: 'ring-rose-500/50' },
  'somebody_likes_me': { bg: 'from-pink-400 to-rose-500', ring: 'ring-pink-500/50' },
  'daily_doodler': { bg: 'from-indigo-400 to-violet-500', ring: 'ring-indigo-500/50' },
  'idea_fairy': { bg: 'from-yellow-300 to-amber-400', ring: 'ring-yellow-400/50' },
  '7_day_streak': { bg: 'from-orange-400 to-red-500', ring: 'ring-orange-500/50' },
  '30_day_streak': { bg: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-500/50' },
  '100_day_streak': { bg: 'from-purple-400 to-pink-500', ring: 'ring-purple-500/50' },
  'first_prompt': { bg: 'from-green-400 to-emerald-500', ring: 'ring-green-500/50' },
  'first_bookmark': { bg: 'from-blue-400 to-indigo-500', ring: 'ring-blue-500/50' },
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
