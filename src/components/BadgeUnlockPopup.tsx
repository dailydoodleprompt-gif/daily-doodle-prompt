import { useEffect, useState, useMemo } from 'react';
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
  Star,
} from 'lucide-react';

// Pre-computed badge display data - simple object, no functions
interface BadgeDisplayData {
  iconName: string;
  bgGradient: string;
  ringColor: string;
}

// Static mapping - all values are simple strings
const BADGE_DISPLAY: Record<BadgeType, BadgeDisplayData> = {
  // Membership
  'creative_spark': { iconName: 'sparkles', bgGradient: 'from-violet-400 to-purple-500', ringColor: 'ring-purple-500/50' },
  'premium_patron': { iconName: 'crown', bgGradient: 'from-yellow-400 to-amber-500', ringColor: 'ring-amber-500/50' },
  // Streak
  'creative_ember': { iconName: 'sparkles', bgGradient: 'from-orange-400 to-red-500', ringColor: 'ring-orange-500/50' },
  'creative_fire': { iconName: 'flame-kindling', bgGradient: 'from-red-500 to-orange-600', ringColor: 'ring-red-500/50' },
  'creative_blaze': { iconName: 'flame', bgGradient: 'from-yellow-400 to-orange-500', ringColor: 'ring-yellow-500/50' },
  'creative_rocket': { iconName: 'rocket', bgGradient: 'from-orange-500 to-red-600', ringColor: 'ring-orange-600/50' },
  'creative_supernova': { iconName: 'orbit', bgGradient: 'from-purple-500 to-pink-600', ringColor: 'ring-purple-500/50' },
  // Collection
  'new_collector': { iconName: 'bookmark', bgGradient: 'from-blue-400 to-indigo-500', ringColor: 'ring-blue-500/50' },
  'pack_rat': { iconName: 'book-open', bgGradient: 'from-indigo-400 to-purple-500', ringColor: 'ring-indigo-500/50' },
  'cue_curator': { iconName: 'library', bgGradient: 'from-purple-400 to-pink-500', ringColor: 'ring-purple-500/50' },
  'grand_gatherer': { iconName: 'gem', bgGradient: 'from-pink-400 to-rose-500', ringColor: 'ring-pink-500/50' },
  // Sharing
  'planter_of_seeds': { iconName: 'sprout', bgGradient: 'from-green-400 to-emerald-500', ringColor: 'ring-green-500/50' },
  'gardener_of_growth': { iconName: 'shrub', bgGradient: 'from-lime-400 to-green-500', ringColor: 'ring-lime-500/50' },
  'cultivator_of_influence': { iconName: 'trees', bgGradient: 'from-emerald-400 to-teal-500', ringColor: 'ring-emerald-500/50' },
  'harvester_of_inspiration': { iconName: 'flower', bgGradient: 'from-yellow-400 to-amber-500', ringColor: 'ring-yellow-500/50' },
  // Creative
  'first_doodle': { iconName: 'pencil', bgGradient: 'from-amber-400 to-orange-500', ringColor: 'ring-amber-500/50' },
  'doodle_diary': { iconName: 'book-open', bgGradient: 'from-orange-400 to-red-400', ringColor: 'ring-orange-500/50' },
  'doodle_digest': { iconName: 'palette', bgGradient: 'from-rose-400 to-pink-500', ringColor: 'ring-rose-500/50' },
  'doodle_library': { iconName: 'images', bgGradient: 'from-fuchsia-400 to-purple-500', ringColor: 'ring-fuchsia-500/50' },
  'daily_doodler': { iconName: 'calendar-check', bgGradient: 'from-indigo-400 to-violet-500', ringColor: 'ring-indigo-500/50' },
  // Social
  'warm_fuzzies': { iconName: 'heart', bgGradient: 'from-rose-400 to-red-500', ringColor: 'ring-rose-500/50' },
  'somebody_likes_me': { iconName: 'heart-handshake', bgGradient: 'from-pink-400 to-rose-500', ringColor: 'ring-pink-500/50' },
  'idea_fairy': { iconName: 'lightbulb', bgGradient: 'from-yellow-300 to-amber-400', ringColor: 'ring-yellow-400/50' },
};

// Render icon based on name - explicit switch for production safety
function BadgeIcon({ name, className }: { name: string; className?: string }) {
  const iconClass = className || 'w-16 h-16';

  switch (name) {
    case 'sparkles': return <Sparkles className={iconClass} />;
    case 'crown': return <Crown className={iconClass} />;
    case 'flame-kindling': return <FlameKindling className={iconClass} />;
    case 'flame': return <Flame className={iconClass} />;
    case 'rocket': return <Rocket className={iconClass} />;
    case 'orbit': return <Orbit className={iconClass} />;
    case 'bookmark': return <Bookmark className={iconClass} />;
    case 'book-open': return <BookOpen className={iconClass} />;
    case 'library': return <Library className={iconClass} />;
    case 'gem': return <Gem className={iconClass} />;
    case 'sprout': return <Sprout className={iconClass} />;
    case 'shrub': return <Shrub className={iconClass} />;
    case 'trees': return <Trees className={iconClass} />;
    case 'flower': return <Flower className={iconClass} />;
    case 'pencil': return <Pencil className={iconClass} />;
    case 'palette': return <Palette className={iconClass} />;
    case 'images': return <Images className={iconClass} />;
    case 'calendar-check': return <CalendarCheck className={iconClass} />;
    case 'heart': return <Heart className={iconClass} />;
    case 'heart-handshake': return <HeartHandshake className={iconClass} />;
    case 'lightbulb': return <Lightbulb className={iconClass} />;
    default: return <Star className={iconClass} />; // Fallback icon
  }
}

export function BadgeUnlockPopup() {
  const newlyEarnedBadge = useNewlyEarnedBadge();
  const clearNewlyEarnedBadge = useAppStore((state) => state.clearNewlyEarnedBadge);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Pre-compute all badge data safely
  const badgeData = useMemo(() => {
    if (!newlyEarnedBadge) return null;

    try {
      const info = BADGE_INFO[newlyEarnedBadge];
      const display = BADGE_DISPLAY[newlyEarnedBadge];

      if (!info || !display) {
        console.error('[BadgeUnlockPopup] Missing data for badge:', newlyEarnedBadge);
        return null;
      }

      return {
        type: newlyEarnedBadge,
        name: info.name || 'Badge Unlocked',
        description: info.description || 'You earned a new badge!',
        iconName: display.iconName,
        bgGradient: display.bgGradient,
        ringColor: display.ringColor,
      };
    } catch (err) {
      console.error('[BadgeUnlockPopup] Error computing badge data:', err);
      return null;
    }
  }, [newlyEarnedBadge]);

  // Handle opening/closing with animation
  useEffect(() => {
    if (newlyEarnedBadge && badgeData) {
      setIsOpen(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [newlyEarnedBadge, badgeData]);

  // If no badge or data is invalid, clear and don't render
  useEffect(() => {
    if (newlyEarnedBadge && !badgeData) {
      console.warn('[BadgeUnlockPopup] Clearing invalid badge:', newlyEarnedBadge);
      clearNewlyEarnedBadge();
    }
  }, [newlyEarnedBadge, badgeData, clearNewlyEarnedBadge]);

  const handleClose = () => {
    setIsOpen(false);
    // Small delay before clearing to allow dialog close animation
    setTimeout(() => {
      clearNewlyEarnedBadge();
    }, 150);
  };

  // Don't render if no valid badge data
  if (!badgeData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
              badgeData.bgGradient,
              badgeData.ringColor,
              isAnimating && 'animate-bounce'
            )}
          >
            <BadgeIcon name={badgeData.iconName} className="w-16 h-16" />

            {/* Sparkle effects */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Sparkles className={cn(
                'absolute w-6 h-6 text-yellow-300',
                '-top-2 -left-2',
                isAnimating && 'animate-pulse'
              )} />
              <Sparkles className={cn(
                'absolute w-4 h-4 text-yellow-300',
                'top-0 -right-1',
                isAnimating && 'animate-pulse'
              )} style={{ animationDelay: '100ms' }} />
              <Sparkles className={cn(
                'absolute w-5 h-5 text-yellow-300',
                '-bottom-1 right-0',
                isAnimating && 'animate-pulse'
              )} style={{ animationDelay: '200ms' }} />
            </div>
          </div>

          {/* Badge Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{badgeData.name}</h3>
            <p className="text-muted-foreground">{badgeData.description}</p>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full">
          Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
