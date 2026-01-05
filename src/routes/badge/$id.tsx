import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { BADGE_INFO, type BadgeType } from '@/types';
import {
  Flame,
  FlameKindling,
  Crown,
  Pencil,
  Bookmark,
  BookOpen,
  Sparkle,
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
  Rose,
  Clover,
  Globe,
  Star,
  Ghost,
  Drumstick,
  Gift,
  PartyPopper,
  Rat,
} from 'lucide-react';

export const Route = createFileRoute('/badge/$id')({
  component: BadgeSharePage,
});

// Badge icon mapping (same as BadgeCabinet)
const badgeIcons: Record<BadgeType, typeof Flame> = {
  'creative_spark': Sparkle,
  'premium_patron': Crown,
  'creative_ember': Sparkles,
  'creative_fire': FlameKindling,
  'creative_blaze': Flame,
  'creative_rocket': Rocket,
  'creative_supernova': Orbit,
  'new_collector': Bookmark,
  'pack_rat': Rat,
  'cue_curator': Library,
  'grand_gatherer': Gem,
  'planter_of_seeds': Sprout,
  'first_doodle': Pencil,
  'doodle_diary': BookOpen,
  'doodle_digest': Palette,
  'doodle_library': Images,
  'daily_doodler': CalendarCheck,
  'warm_fuzzies': Heart,
  'somebody_likes_me': HeartHandshake,
  'idea_fairy': Lightbulb,
  'valentines_2026': Rose,
  'lucky_creator_2026': Clover,
  'earth_day_2026': Globe,
  'independence_2026': Star,
  'spooky_season_2026': Ghost,
  'thanksgiving_2026': Drumstick,
  'holiday_spirit_2026': Gift,
  'new_year_spark_2027': PartyPopper,
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

// Badge gradient colors
const badgeColors: Record<BadgeType, string> = {
  'creative_spark': 'from-violet-400 to-purple-500',
  'premium_patron': 'from-yellow-400 to-amber-500',
  'creative_ember': 'from-orange-400 to-red-500',
  'creative_fire': 'from-red-500 to-orange-600',
  'creative_blaze': 'from-yellow-400 to-orange-500',
  'creative_rocket': 'from-orange-500 to-red-600',
  'creative_supernova': 'from-purple-500 to-pink-600',
  'new_collector': 'from-blue-400 to-indigo-500',
  'pack_rat': 'from-indigo-400 to-purple-500',
  'cue_curator': 'from-purple-400 to-pink-500',
  'grand_gatherer': 'from-pink-400 to-rose-500',
  'planter_of_seeds': 'from-green-400 to-emerald-500',
  'first_doodle': 'from-amber-400 to-orange-500',
  'doodle_diary': 'from-orange-400 to-red-400',
  'doodle_digest': 'from-rose-400 to-pink-500',
  'doodle_library': 'from-fuchsia-400 to-purple-500',
  'daily_doodler': 'from-indigo-400 to-violet-500',
  'warm_fuzzies': 'from-rose-400 to-red-500',
  'somebody_likes_me': 'from-pink-400 to-rose-500',
  'idea_fairy': 'from-yellow-300 to-amber-400',
  'valentines_2026': 'from-pink-500 to-red-600',
  'lucky_creator_2026': 'from-emerald-500 to-green-600',
  'earth_day_2026': 'from-green-500 to-teal-600',
  'independence_2026': 'from-blue-500 to-red-500',
  'spooky_season_2026': 'from-orange-500 to-purple-600',
  'thanksgiving_2026': 'from-amber-500 to-orange-600',
  'holiday_spirit_2026': 'from-red-500 to-green-600',
  'new_year_spark_2027': 'from-yellow-400 to-amber-500',
  'january_champion_2026': 'from-teal-400 to-cyan-500',
  'february_faithful_2026': 'from-teal-400 to-cyan-500',
  'march_maestro_2026': 'from-teal-400 to-cyan-500',
  'april_artist_2026': 'from-teal-400 to-cyan-500',
  'may_maven_2026': 'from-teal-400 to-cyan-500',
  'june_genius_2026': 'from-teal-400 to-cyan-500',
  'july_journeyer_2026': 'from-teal-400 to-cyan-500',
  'august_ace_2026': 'from-teal-400 to-cyan-500',
  'september_star_2026': 'from-teal-400 to-cyan-500',
  'october_original_2026': 'from-teal-400 to-cyan-500',
  'november_notable_2026': 'from-teal-400 to-cyan-500',
  'december_dedicator_2026': 'from-teal-400 to-cyan-500',
};

function BadgeSharePage() {
  const { id } = useParams({ from: '/badge/$id' });
  const navigate = useNavigate();

  const badgeInfo = BADGE_INFO[id as BadgeType];
  const BadgeIcon = badgeIcons[id as BadgeType];

  if (!badgeInfo || !BadgeIcon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="text-6xl mb-4">🏅</div>
        <h1 className="text-2xl font-bold">Badge Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This badge doesn't exist or may have been removed.
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    );
  }

  const isDedicatedDoodler = badgeInfo.displayMonth && badgeInfo.displayYear;
  const gradientColors = badgeColors[id as BadgeType] || 'from-gray-400 to-gray-500';

  // Rarity ring color
  const rarityRingClass =
    badgeInfo.rarity === 'legendary'
      ? 'ring-yellow-400'
      : badgeInfo.rarity === 'epic'
      ? 'ring-teal-400'
      : 'ring-primary/30';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 items-center px-4">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="Daily Doodle Prompt" className="h-8 w-auto" />
            <span className="hidden sm:inline-block">DailyDoodlePrompt</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-lg mx-auto py-8 px-4">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Rarity Tag */}
              {badgeInfo.rarity && (
                <div
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                    badgeInfo.rarity === 'legendary'
                      ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                      : badgeInfo.rarity === 'epic'
                      ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
                      : 'bg-primary/20 text-primary'
                  }`}
                >
                  {badgeInfo.rarity}
                </div>
              )}

              {/* Badge Icon */}
              <div
                className={`relative w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br text-white shadow-2xl ring-8 ${gradientColors} ${rarityRingClass}`}
              >
                <BadgeIcon className="w-16 h-16" />
                {/* Sparkle effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="absolute w-6 h-6 text-yellow-300 -top-2 -left-2 animate-pulse" />
                  <Sparkles
                    className="absolute w-4 h-4 text-yellow-300 top-0 -right-1 animate-pulse"
                    style={{ animationDelay: '100ms' }}
                  />
                  <Sparkles
                    className="absolute w-5 h-5 text-yellow-300 -bottom-1 right-0 animate-pulse"
                    style={{ animationDelay: '200ms' }}
                  />
                </div>
              </div>

              {/* Badge Name */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{badgeInfo.name}</h1>
                {isDedicatedDoodler && (
                  <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                    {badgeInfo.displayMonth} {badgeInfo.displayYear}
                  </p>
                )}
                <p className="text-muted-foreground">{badgeInfo.description}</p>
              </div>

              {/* Category */}
              <div className="text-sm text-muted-foreground capitalize">
                {badgeInfo.category} Achievement
              </div>

              {/* CTA */}
              <div className="border-t pt-6 mt-6 w-full">
                <p className="text-muted-foreground mb-4">
                  Want to earn badges and join the creative community?
                </p>
                <Button onClick={() => navigate({ to: '/' })} className="w-full" size="lg">
                  Join Daily Doodle Prompt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
