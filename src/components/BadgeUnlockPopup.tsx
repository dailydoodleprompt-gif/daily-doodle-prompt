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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
  Rat,
  Share2,
  Copy,
  Check,
  // Seasonal icons - Holiday badges
  Rose,
  Clover,
  Globe,
  Star,
  Ghost,
  Drumstick,
  Gift,
  PartyPopper,
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
  'pack_rat': Rat,
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
  // Seasonal - Holiday badges (unique icons per holiday)
  'valentines_2026': Rose,
  'lucky_creator_2026': Clover,
  'earth_day_2026': Globe,
  'independence_2026': Star,
  'spooky_season_2026': Ghost,
  'thanksgiving_2026': Drumstick,
  'holiday_spirit_2026': Gift,
  'new_year_spark_2027': PartyPopper,
  // Seasonal - Monthly challenge badges (all use CalendarCheck)
  'january_champion_2026': CalendarCheck,
  'february_faithful_2026': CalendarCheck,
  'march_maestro_2026': CalendarCheck,
  'april_artist_2026': CalendarCheck,
  'may_maven_2026': CalendarCheck,
  'june_genius_2026': CalendarCheck,
  'july_journeyer_2026': CalendarCheck,
  'august_ace_2026': CalendarCheck,
  'september_star_2026': CalendarCheck,
  'october_original_2026': CalendarCheck,
  'november_notable_2026': CalendarCheck,
  'december_dedicator_2026': CalendarCheck,
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
  // Seasonal - Monthly challenge badges (Epic) - 2026 uses teal gradient
  'january_champion_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'february_faithful_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'march_maestro_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'april_artist_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'may_maven_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'june_genius_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'july_journeyer_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'august_ace_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'september_star_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'october_original_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'november_notable_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
  'december_dedicator_2026': { bg: 'from-teal-400 to-cyan-500', ring: 'ring-teal-500/50' },
};

export function BadgeUnlockPopup() {
  const newlyEarnedBadge = useNewlyEarnedBadge();
  const clearNewlyEarnedBadge = useAppStore((state) => state.clearNewlyEarnedBadge);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Check badge type for special celebration messaging
  const isSecretHolidayBadge = info.category === 'seasonal' && info.rarity === 'legendary';
  const isMonthlyChallenge = info.category === 'seasonal' && info.rarity === 'epic';
  const isDedicatedDoodler = isMonthlyChallenge && info.displayMonth && info.displayYear;

  // Special ring colors for rarity
  const rarityRingClass = isSecretHolidayBadge
    ? 'ring-yellow-400'
    : isMonthlyChallenge
    ? 'ring-teal-400'
    : colors.ring;

  const handleClose = () => {
    clearNewlyEarnedBadge();
  };

  // Share functionality
  const badgeDisplayName = isDedicatedDoodler
    ? `${info.name} - ${info.displayMonth} ${info.displayYear}`
    : info.name;
  const shareText = isDedicatedDoodler
    ? `🏆 I just earned the ${info.name} badge for ${info.displayMonth} ${info.displayYear} on Daily Doodle Prompt!\n\n${info.description}\n\nJoin me in building creative habits!`
    : `🏆 I just unlocked "${info.name}" on Daily Doodle Prompt!\n\n${info.description}\n\nJoin me in building creative habits!`;
  const shareUrl = `https://dailydoodleprompt.com/badge/${newlyEarnedBadge}`;
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: `I unlocked ${badgeDisplayName}!`,
        text: shareText,
        url: shareUrl,
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        handleCopyLink();
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareToTwitter = () => {
    const twitterText = isDedicatedDoodler
      ? `🏆 I just earned the ${info.name} badge for ${info.displayMonth} ${info.displayYear} on @DailyDoodleApp!\n\n${info.description}`
      : `🏆 I just unlocked "${info.name}" on @DailyDoodleApp!\n\n${info.description}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <Dialog open={!!newlyEarnedBadge} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {isSecretHolidayBadge ? (
              <span className="flex items-center justify-center gap-2">
                <span className="text-3xl">🎉</span>
                SECRET BADGE UNLOCKED!
                <span className="text-3xl">🎉</span>
              </span>
            ) : isMonthlyChallenge ? (
              <span className="flex items-center justify-center gap-2">
                <span className="text-3xl">🏆</span>
                Monthly Challenge Complete!
              </span>
            ) : (
              'Badge Unlocked!'
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSecretHolidayBadge
              ? "You discovered a hidden holiday badge!"
              : isMonthlyChallenge
              ? "You completed the monthly doodle challenge!"
              : "Congratulations! You've earned a new badge!"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-4">
          {/* Rarity indicator for seasonal badges */}
          {info.rarity && (
            <div className={cn(
              "px-3 py-1 text-xs font-bold uppercase rounded-full",
              info.rarity === 'legendary' && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
              info.rarity === 'epic' && "bg-purple-500/20 text-purple-600 dark:text-purple-400"
            )}>
              {info.rarity}
            </div>
          )}

          {/* Animated Badge */}
          <div
            className={cn(
              'relative w-32 h-32 rounded-full flex items-center justify-center',
              'bg-gradient-to-br text-white shadow-2xl',
              'ring-8',
              colors.bg,
              rarityRingClass,
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
            {isDedicatedDoodler && (
              <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                {info.displayMonth} {info.displayYear}
              </p>
            )}
            <p className="text-muted-foreground">{info.description}</p>
          </div>
        </div>

        {/* Share Button */}
        <div className="flex gap-2 justify-center mb-4">
          {isMobile ? (
            <Button onClick={handleNativeShare} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Achievement
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Achievement
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem onClick={handleCopyLink}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to clipboard
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToTwitter}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToFacebook}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Button onClick={handleClose} className="w-full">
          Continue Doodling
        </Button>
      </DialogContent>
    </Dialog>
  );
}