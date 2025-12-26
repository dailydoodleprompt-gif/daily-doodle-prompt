import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCabinet } from '@/components/BadgeCabinet';
import { DoodleGallery } from '@/components/DoodleGallery';
import { DoodleFeed } from '@/components/DoodleFeed';
import { UserAvatar, AVATAR_ICON_OPTIONS, AVATAR_ICONS, ICON_COLORS } from '@/components/UserAvatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useUser,
  useStreak,
  useBookmarks,
  useIsPremium,
  useAppStore,
} from '@/store/app-store';
import { type Prompt } from '@/hooks/use-google-sheets';
import {
  Crown,
  Star,
  Calendar,
  TrendingUp,
  Check,
  Shield,
  Image,
  Heart,
  Rss,
  Bookmark,
  Upload,
  Flame,
  Snowflake,
} from 'lucide-react';
import type { AvatarIconType, AvatarType, Doodle } from '@/types';
import { getTitleDisplayName } from '@/types';
import { cn } from '@/lib/utils';
import { formatShortDate } from '@/lib/timezone';

interface ProfileViewProps {
  prompts?: Prompt[];
  onUpgrade: () => void;
  onSettings: () => void;
  onAdminDashboard?: () => void;
  onUserClick?: (userId: string) => void;
}

export function ProfileView({ prompts = [], onUpgrade, onSettings, onAdminDashboard, onUserClick }: ProfileViewProps) {
  const user = useUser();
  const streak = useStreak();
  const bookmarks = useBookmarks();
  const isPremium = useIsPremium();
  const updateAvatar = useAppStore((state) => state.updateAvatar);
  const getDoodles = useAppStore((state) => state.getDoodles);
  const getLikedDoodles = useAppStore((state) => state.getLikedDoodles);
  const getFollowerCount = useAppStore((state) => state.getFollowerCount);
  const getFollowingCount = useAppStore((state) => state.getFollowingCount);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const tabsRef = useRef<HTMLDivElement>(null);

  // Streak values with fallbacks
  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const freezeAvailable = isPremium && streak?.streak_freeze_available;

  // Handle clicking on Saved Prompts card
  const handleSavedPromptsClick = () => {
    setActiveTab('favorites');
    // Scroll to tabs section
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!user) {
    return null;
  }

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const currentAvatarType = user.avatar_type ?? 'initial';
  const currentAvatarIcon = user.avatar_icon;

  // Get user's doodles and stats
  const myDoodles = getDoodles(user.id) as Doodle[];
  const likedDoodles = getLikedDoodles() as Doodle[];
  const followerCount = getFollowerCount(user.id);
  const followingCount = getFollowingCount(user.id);

  const handleAvatarSelect = (type: AvatarType, icon?: AvatarIconType) => {
    updateAvatar(type, icon);
    setShowAvatarPicker(false);
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
              >
                <UserAvatar size="xl" />
              </button>
              <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                Edit
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white gap-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
                {user.is_admin && (
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
              </div>
              {/* Profile Title - displayed under username */}
              {user.current_title && (
                <p className="text-sm text-muted-foreground italic mb-1">
                  {getTitleDisplayName(user.current_title)}
                </p>
              )}
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Member since {memberSince}
              </p>

              {/* Social Stats */}
              <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                <div className="text-center">
                  <p className="font-bold">{followerCount}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{followingCount}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{myDoodles.length}</p>
                  <p className="text-xs text-muted-foreground">Doodles</p>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={onSettings}>
              Edit Settings
            </Button>
          </div>

          {/* Avatar Picker */}
          {showAvatarPicker && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-4">Choose your avatar</h3>

              {/* Initial option */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => handleAvatarSelect('initial')}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-colors w-full',
                    currentAvatarType === 'initial'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-muted-foreground/20'
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">First letter of username</span>
                  {currentAvatarType === 'initial' && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              </div>

              {/* Icon options */}
              <p className="text-sm text-muted-foreground mb-3">Or choose an icon:</p>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_ICON_OPTIONS.map(({ value, label }) => {
                  const IconComponent = AVATAR_ICONS[value];
                  const isSelected = currentAvatarType === 'icon' && currentAvatarIcon === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAvatarSelect('icon', value)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:border-muted-foreground/20'
                      )}
                      title={label}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(ICON_COLORS[value], 'font-medium')}>
                          <IconComponent className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {/* Current Streak Card */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'relative flex items-center justify-center w-24 h-24 rounded-full',
                  currentStreak > 0
                    ? 'bg-gradient-to-br from-orange-400 to-red-500'
                    : 'bg-muted'
                )}
              >
                <Flame
                  className={cn(
                    'w-12 h-12',
                    currentStreak > 0 ? 'text-white' : 'text-muted-foreground'
                  )}
                />
                <div className="absolute -bottom-2 bg-background rounded-full px-3 py-1 border shadow-sm">
                  <span className="font-bold text-lg">{currentStreak}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold">
                  {currentStreak === 1 ? '1 Day' : `${currentStreak} Days`}
                </p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
              {isPremium && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={freezeAvailable ? 'default' : 'secondary'}
                        className={cn(
                          'gap-1',
                          freezeAvailable
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'opacity-60'
                        )}
                      >
                        <Snowflake className="w-3 h-3" />
                        Streak Freeze {freezeAvailable ? 'Available' : 'Used'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {freezeAvailable
                        ? 'You can freeze your streak once this month if you miss a day'
                        : 'Streak freeze resets at the start of each month'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Longest Streak Card */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-lg">{longestStreak} Days</p>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Prompts Card - Clickable */}
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleSavedPromptsClick}
        >
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Bookmark className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-lg">{bookmarks.length}</p>
                <p className="text-sm text-muted-foreground">Saved Prompts</p>
              </div>
              <p className="text-xs text-primary">Click to view →</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Collection - Above Feed */}
      <BadgeCabinet className="mb-6" />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6" ref={tabsRef}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="gap-1">
            <Rss className="h-4 w-4" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
          <TabsTrigger value="doodles" className="gap-1">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Doodles</span>
          </TabsTrigger>
          <TabsTrigger value="liked" className="gap-1">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Liked</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Favorites</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4">
          <DoodleFeed prompts={prompts} onUserClick={onUserClick} />
        </TabsContent>

        <TabsContent value="doodles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  My Doodles
                </span>
                <Badge variant="secondary">{myDoodles.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <DoodleGallery
                  doodles={myDoodles}
                  showActions
                  emptyMessage="You haven't uploaded any doodles yet. Go to a prompt page to upload your first doodle!"
                />
              ) : (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Premium Feature</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade to Premium to upload and share your doodles!
                  </p>
                  <Button onClick={onUpgrade}>Upgrade Now</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liked" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Liked Doodles
                </span>
                <Badge variant="secondary">{likedDoodles.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DoodleGallery
                doodles={likedDoodles}
                emptyMessage="You haven't liked any doodles yet. Explore and like doodles from other artists!"
                onUserClick={onUserClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Favorite Prompts
                </span>
                <Badge variant="secondary">{bookmarks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isPremium
                      ? "You haven't saved any prompts yet."
                      : 'Upgrade to Premium to save your favorite prompts!'}
                  </p>
                  {!isPremium && (
                    <Button onClick={onUpgrade} className="mt-4">
                      Upgrade Now
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bookmark) => {
                    const prompt = prompts.find((p) => p.id === bookmark.prompt_id);
                    if (!prompt) return null;

                    return (
                      <div
                        key={bookmark.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <h4 className="font-medium">{prompt.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {prompt.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {prompt.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatShortDate(prompt.publish_date)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Admin Tools - Only visible to admins */}
      {user.is_admin && onAdminDashboard && (
        <Card className="mb-6 bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                <Shield className="w-8 h-8 text-violet-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg mb-1">Admin Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Manage users, view statistics, and access all admin controls
                </p>
              </div>
              <Button onClick={onAdminDashboard} variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Admin Tools
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lifetime Access Upsell */}
      {!isPremium && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg mb-1">
                  Unlock Lifetime Access
                </h3>
                <p className="text-muted-foreground text-sm">
                  One-time purchase. Full Doodle Vault, uploads, social features, badges, and all future upgrades forever!
                </p>
              </div>
              <Button
                onClick={onUpgrade}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Unlock Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
