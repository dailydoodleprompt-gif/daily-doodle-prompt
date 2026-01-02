// DailyDoodlePrompt Types

// Prompt from Google Sheets
export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publish_date: string; // YYYY-MM-DD format
}

// OAuth provider types
export type OAuthProvider = 'apple' | 'google';

// Avatar icon options - fun and on theme for a doodle app
export type AvatarIconType =
  | 'cat'
  | 'dog'
  | 'rocket'
  | 'star'
  | 'heart'
  | 'palette'
  | 'brush'
  | 'sparkles'
  | 'smile'
  | 'sun';

export type AvatarType = 'initial' | 'icon';

// Profile title types - premium feature
export type DefaultProfileTitle =
  | 'doodle_dude'
  | 'doodle_dame'
  | 'doodle_diva'
  | 'doodle_doer'
  | 'duke_of_doodle'
  | 'duchess_of_doodle'
  | 'doodle_dandy'
  | 'doodle_bug'
  | 'doodle_dork'
  | 'doodle_darling';

export type SecretProfileTitle =
  | 'doodle_dabbler'   // 3 doodles
  | 'doodle_dreamer'   // 10 doodles
  | 'doodle_disciple'  // 25 doodles
  | 'doodle_dominator' // 50 doodles
  | 'doodle_deity';    // 100 doodles

export type AdminProfileTitle = 'doodle_daddy';

export type ProfileTitleType = DefaultProfileTitle | SecretProfileTitle | AdminProfileTitle;

// Title display info
export interface ProfileTitleInfo {
  id: ProfileTitleType;
  displayName: string;
  isSecret: boolean;
  unlockRequirement?: number; // Number of doodles needed for secret titles
}

// All available titles with their info
export const DEFAULT_TITLES: ProfileTitleInfo[] = [
  { id: 'doodle_dude', displayName: 'Doodle Dude', isSecret: false },
  { id: 'doodle_dame', displayName: 'Doodle Dame', isSecret: false },
  { id: 'doodle_diva', displayName: 'Doodle Diva', isSecret: false },
  { id: 'doodle_doer', displayName: 'Doodle Doer', isSecret: false },
  { id: 'duke_of_doodle', displayName: 'Duke of Doodle', isSecret: false },
  { id: 'duchess_of_doodle', displayName: 'Duchess of Doodle', isSecret: false },
  { id: 'doodle_dandy', displayName: 'Doodle Dandy', isSecret: false },
  { id: 'doodle_bug', displayName: 'Doodle Bug', isSecret: false },
  { id: 'doodle_dork', displayName: 'Doodle Dork', isSecret: false },
  { id: 'doodle_darling', displayName: 'Doodle Darling', isSecret: false },
];

export const SECRET_TITLES: ProfileTitleInfo[] = [
  { id: 'doodle_dabbler', displayName: 'Doodle Dabbler', isSecret: true, unlockRequirement: 3 },
  { id: 'doodle_dreamer', displayName: 'Doodle Dreamer', isSecret: true, unlockRequirement: 10 },
  { id: 'doodle_disciple', displayName: 'Doodle Disciple', isSecret: true, unlockRequirement: 25 },
  { id: 'doodle_dominator', displayName: 'Doodle Dominator', isSecret: true, unlockRequirement: 50 },
  { id: 'doodle_deity', displayName: 'Doodle Deity', isSecret: true, unlockRequirement: 100 },
];

export const ADMIN_TITLE: ProfileTitleInfo = {
  id: 'doodle_daddy',
  displayName: 'Doodle Daddy',
  isSecret: false,
};

export const ALL_TITLES: ProfileTitleInfo[] = [...DEFAULT_TITLES, ...SECRET_TITLES, ADMIN_TITLE];

// Helper to get title display name
export function getTitleDisplayName(titleId: ProfileTitleType | null): string | null {
  if (!titleId) return null;
  const title = ALL_TITLES.find(t => t.id === titleId);
  return title?.displayName ?? null;
}

// Biometric login types
export interface BiometricCredential {
  id: string;
  device_name: string;
  credential_id: string;
  public_key: string;
  created_at: string;
  last_used_at: string;
}

// User account
export interface User {
  id: string;
  email: string;
  username: string;
  is_premium: boolean;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
  // OAuth fields
  oauth_provider?: OAuthProvider;
  oauth_id?: string;
  avatar_url?: string;
  // Avatar customization
  avatar_type?: AvatarType;
  avatar_icon?: AvatarIconType;
  // Profile title (premium feature)
  current_title?: ProfileTitleType | null;
  unlocked_titles?: ProfileTitleType[];
  newly_unlocked_titles?: ProfileTitleType[]; // Titles unlocked but not yet viewed
  // Username setup
  needs_username_setup?: boolean; // True for OAuth users who haven't chosen username
  // Biometric login
  biometric_enabled?: boolean;
  biometric_credentials?: BiometricCredential[];
  // Stripe payment fields
  premium_purchased_at?: string; // ISO timestamp of when premium was purchased
  stripe_customer_id?: string; // Stripe customer ID
  stripe_session_id?: string; // Latest checkout session ID
}

// Password reset token
export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

// User preferences
export interface UserPreferences {
  id: string;
  user_id: string;
  push_notifications_enabled: boolean;
  push_notification_time: string; // HH:mm format
  email_notifications_enabled: boolean;
  theme_mode: 'light' | 'dark' | 'system';
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

// Bookmark
export interface Bookmark {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: string;
}

// Streak data
export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_viewed_date: string | null; // YYYY-MM-DD format
  streak_freeze_available: boolean;
  streak_freeze_used_this_month: boolean;
  created_at: string;
  updated_at: string;
}

// Badge categories
export type BadgeCategory = 'membership' | 'streak' | 'collection' | 'sharing' | 'creative' | 'social' | 'seasonal';

// Badge rarity levels
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Helper function to check if a seasonal badge is currently available (for awarding)
export function isBadgeAvailable(badgeType: BadgeType): boolean {
  const badge = BADGE_INFO[badgeType];
  if (!badge.availableFrom) return true; // Always available (non-seasonal)

  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

  const from = badge.availableFrom;
  const until = badge.availableUntil;

  if (until) {
    // Time-limited badge - check if today is within the range
    return today >= from && today <= until;
  }

  return today >= from; // Available from date onward
}

// Check if a badge should be VISIBLE in the badge collection UI
// Per alpha feedback:
// - Legendary (holiday) badges: HIDDEN until earned (surprise!)
// - Epic (monthly) badges: Only visible during active month
// - All earned badges: Always visible
export function isBadgeVisible(badgeType: BadgeType, earnedBadges: BadgeType[]): boolean {
  const badge = BADGE_INFO[badgeType];

  // Non-seasonal badges are always visible
  if (badge.category !== 'seasonal') return true;

  // If user has earned it, always visible
  if (earnedBadges.includes(badgeType)) return true;

  // Legendary (holiday) badges: NEVER visible until earned - they're surprises!
  if (badge.rarity === 'legendary') {
    return false;
  }

  // Epic (monthly) badges: Only visible during active period
  if (badge.rarity === 'epic') {
    if (!badge.availableFrom || !badge.availableUntil) return false;
    return isBadgeAvailable(badgeType);
  }

  return false;
}

// Get days remaining in current month (for monthly badge progress)
export function getDaysRemainingInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.getDate() - now.getDate();
}

// Get the currently active monthly badge (if any)
export function getActiveMonthlyBadge(): BadgeType | null {
  const monthlyBadges: BadgeType[] = [
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

  for (const badge of monthlyBadges) {
    if (isBadgeAvailable(badge)) {
      return badge;
    }
  }
  return null;
}

// Badge types - comprehensive list for gamification
export type BadgeType =
  // Membership badges
  | 'creative_spark'           // First successful login (free account creation)
  | 'premium_patron'           // Completed one-time lifetime unlock purchase
  // Streak badges (consecutive visits)
  | 'creative_ember'           // 3 days in a row
  | 'creative_fire'            // 7 days in a row
  | 'creative_blaze'           // 14 days in a row
  | 'creative_rocket'          // 30 days in a row
  | 'creative_supernova'       // 100 days in a row
  // Favorite/Collection badges
  | 'new_collector'            // Favorited first prompt
  | 'pack_rat'                 // Favorited 10 prompts
  | 'cue_curator'              // Favorited 25 prompts
  | 'grand_gatherer'           // Favorited 50 prompts
  // Sharing badges
  | 'planter_of_seeds'         // Shared first prompt
  | 'gardener_of_growth'       // Shared 10 prompts
  | 'cultivator_of_influence'  // Shared 25 prompts
  | 'harvester_of_inspiration' // Shared 50 prompts
  // Doodle upload badges
  | 'first_doodle'             // Uploaded first doodle
  | 'doodle_diary'             // Uploaded 10 doodles
  | 'doodle_digest'            // Uploaded 25 doodles
  | 'doodle_library'           // Uploaded 50 doodles
  | 'daily_doodler'            // Uploaded 7 days in a row
  // Social badges
  | 'warm_fuzzies'             // First like given
  | 'somebody_likes_me'        // First like received
  | 'idea_fairy'               // Submitted a prompt idea
  // Seasonal - Holiday badges (2026)
  | 'valentines_2026'          // Valentine's Day 2026
  | 'lucky_creator_2026'       // St. Patrick's Day 2026
  | 'earth_day_2026'           // Earth Day 2026
  | 'independence_2026'        // July 4th 2026
  | 'spooky_season_2026'       // Halloween 2026
  | 'thanksgiving_2026'        // Thanksgiving 2026
  | 'holiday_spirit_2026'      // Christmas 2026
  | 'new_year_spark_2027'      // New Year's Day 2027
  // Seasonal - Monthly challenge badges (2026)
  | 'january_champion_2026'
  | 'february_faithful_2026'
  | 'march_maestro_2026'
  | 'april_artist_2026'
  | 'may_maven_2026'
  | 'june_genius_2026'
  | 'july_journeyer_2026'
  | 'august_ace_2026'
  | 'september_star_2026'
  | 'october_original_2026'
  | 'november_notable_2026'
  | 'december_dedicator_2026';

export interface Badge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
}

// Badge display info
export interface BadgeInfo {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  // Seasonal badge properties
  rarity?: BadgeRarity;
  emoji?: string; // For seasonal badges that use emoji instead of lucide icons
  availableFrom?: string; // YYYY-MM-DD
  availableUntil?: string; // YYYY-MM-DD
}

export const BADGE_INFO: Record<BadgeType, Omit<BadgeInfo, 'type'>> = {
  // Membership badges
  'creative_spark': {
    name: 'Creative Spark',
    description: 'Joined the creative community',
    icon: 'sparkles',
    category: 'membership',
  },
  'premium_patron': {
    name: 'Premium Patron',
    description: 'Unlocked lifetime access to all premium features',
    icon: 'crown',
    category: 'membership',
  },
  
  // Streak badges
'creative_ember': {
  name: 'Creative Ember',
  description: 'Visited 3 days in a row',
  icon: 'sparkles',
  category: 'streak',
},
'creative_fire': {  // ← CHANGED from creative_blaze
  name: 'Creative Fire',
  description: 'Visited 7 days in a row',
  icon: 'flame-kindling',
  category: 'streak',
},
'creative_blaze': {  // ← CHANGED from creative_wildfire
  name: 'Creative Blaze',
  description: 'Visited 14 days in a row',
  icon: 'flame',
  category: 'streak',
},
'creative_rocket': {  // ← CHANGED from creative_inferno
  name: 'Creative Rocket',
  description: 'Visited 30 days in a row',
  icon: 'rocket',
  category: 'streak',
},
'creative_supernova': {  // ← CHANGED from creative_eternal
  name: 'Creative Supernova',
  description: 'Visited 100 days in a row',
  icon: 'orbit',
  category: 'streak',
},
  
  // Collection badges - heart/bookmark progression
  'new_collector': {
    name: 'New Collector',
    description: 'Saved your first favorite prompt',
    icon: 'bookmark',
    category: 'collection',
  },
  'pack_rat': {
    name: 'Pack Rat',
    description: 'Saved 10 favorite prompts',
    icon: 'bookmarks',
    category: 'collection',
  },
  'cue_curator': {
    name: 'Cue Curator',
    description: 'Saved 25 favorite prompts',
    icon: 'library',
    category: 'collection',
  },
  'grand_gatherer': {
    name: 'Grand Gatherer',
    description: 'Saved 50 favorite prompts',
    icon: 'gem',
    category: 'collection',
  },
  
  // Sharing badges - nature/growth progression
  'planter_of_seeds': {
    name: 'Planter of Seeds',
    description: 'Shared your first prompt',
    icon: 'sprout',
    category: 'sharing',
  },
  'gardener_of_growth': {
    name: 'Gardener of Growth',
    description: 'Shared 10 prompts',
    icon: 'shrub',
    category: 'sharing',
  },
  'cultivator_of_influence': {
    name: 'Cultivator of Influence',
    description: 'Shared 25 prompts',
    icon: 'trees',
    category: 'sharing',
  },
  'harvester_of_inspiration': {
    name: 'Harvester of Inspiration',
    description: 'Shared 50 prompts',
    icon: 'flower',
    category: 'sharing',
  },
  
  // Creative/Doodle badges - art/creation progression
  'first_doodle': {
    name: 'First Doodle',
    description: 'Uploaded your first doodle',
    icon: 'pencil',
    category: 'creative',
  },
  'doodle_diary': {
    name: 'Doodle Diary',
    description: 'Uploaded 10 doodles',
    icon: 'notebook',
    category: 'creative',
  },
  'doodle_digest': {
    name: 'Doodle Digest',
    description: 'Uploaded 25 doodles',
    icon: 'palette',
    category: 'creative',
  },
  'doodle_library': {
    name: 'Doodle Library',
    description: 'Uploaded 50 doodles',
    icon: 'gallery-horizontal',
    category: 'creative',
  },
  'daily_doodler': {
    name: 'Daily Doodler',
    description: 'Uploaded doodles 7 days in a row',
    icon: 'calendar-check',
    category: 'creative',
  },
  
  // Social badges
  'warm_fuzzies': {
    name: 'Warm Fuzzies',
    description: 'Gave your first like to another artist',
    icon: 'heart',
    category: 'social',
  },
  'somebody_likes_me': {
    name: 'Somebody Likes Me!',
    description: 'Received your first like from another artist',
    icon: 'heart-handshake',
    category: 'social',
  },
  'idea_fairy': {
    name: 'Idea Fairy',
    description: 'Submitted a creative prompt idea',
    icon: 'lightbulb',
    category: 'social',
  },

  // ===== SEASONAL BADGES =====
  // Holiday Badges (2026) - Legendary rarity, single-day availability
  'valentines_2026': {
    name: "Valentine's Artist '26",
    description: "Uploaded a doodle on Valentine's Day 2026",
    icon: 'heart',
    emoji: '💝',
    category: 'seasonal',
    rarity: 'legendary',
    availableFrom: '2026-02-14',
    availableUntil: '2026-02-14',
  },
  'lucky_creator_2026': {
    name: "Lucky Creator '26",
    description: "Uploaded a doodle on St. Patrick's Day 2026",
    icon: 'clover',
    emoji: '🍀',
    category: 'seasonal',
    rarity: 'legendary',
    availableFrom: '2026-03-17',
    availableUntil: '2026-03-17',
  },
  'earth_day_2026': {
    name: "Earth Artist '26",
    description: "Uploaded a doodle on Earth Day 2026",
    icon: 'globe',
    emoji: '🌍',
    category: 'seasonal',
    rarity: 'legendary',
    availableFrom: '2026-04-22',
    availableUntil: '2026-04-22',
  },
  'independence_2026': {
    name: "Freedom Creator '26",
    description: "Uploaded a doodle on Independence Day 2026",
    icon: 'star',
    emoji: '🎆',
    category: 'seasonal',
    rarity: 'legendary',
    availableFrom: '2026-07-04',
    availableUntil: '2026-07-04',
  },
  'spooky_season_2026': {
    name: "Spooky Season '26",
    description: "Uploaded a doodle on Halloween 2026",
    icon: 'ghost',
    emoji: '🎃',
    category: 'seasonal',
    rarity: 'legendary',
    availableFrom: '2026-10-31',
    availableUntil: '2026-10-31',
  },
  'thanksgiving_2026': {
    name: "Grateful Artist '26",
    description: "Uploaded a doodle on Thanksgiving 2026",
    icon: 'leaf',
    emoji: '🦃',
    category: 'seasonal',
    rarity: 'legendary',
    availableFrom: '2026-11-26',
    availableUntil: '2026-11-26',
  },
  'holiday_spirit_2026': {
    name: "Holiday Spirit '26",
    description: "Uploaded a doodle on Christmas 2026",
    icon: 'gift',
    emoji: '🎄',
    category: 'seasonal',
    rarity: 'legendary',
    availableFrom: '2026-12-25',
    availableUntil: '2026-12-25',
  },
  'new_year_spark_2027': {
    name: "New Year Spark '27",
    description: "Uploaded a doodle on New Year's Day 2027",
    icon: 'party-popper',
    emoji: '🎉',
    category: 'seasonal',
    rarity: 'legendary',
    availableFrom: '2027-01-01',
    availableUntil: '2027-01-01',
  },

  // Monthly Challenge Badges (2026) - Epic rarity, upload 15 doodles in the month
  'january_champion_2026': {
    name: "January Champion '26",
    description: "Uploaded 15 doodles in January 2026",
    icon: 'snowflake',
    emoji: '❄️',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-01-01',
    availableUntil: '2026-01-31',
  },
  'february_faithful_2026': {
    name: "February Faithful '26",
    description: "Uploaded 15 doodles in February 2026",
    icon: 'heart',
    emoji: '💖',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-02-01',
    availableUntil: '2026-02-28',
  },
  'march_maestro_2026': {
    name: "March Maestro '26",
    description: "Uploaded 15 doodles in March 2026",
    icon: 'wind',
    emoji: '🌸',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-03-01',
    availableUntil: '2026-03-31',
  },
  'april_artist_2026': {
    name: "April Artist '26",
    description: "Uploaded 15 doodles in April 2026",
    icon: 'cloud-rain',
    emoji: '🌷',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-04-01',
    availableUntil: '2026-04-30',
  },
  'may_maven_2026': {
    name: "May Maven '26",
    description: "Uploaded 15 doodles in May 2026",
    icon: 'flower',
    emoji: '🌺',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-05-01',
    availableUntil: '2026-05-31',
  },
  'june_genius_2026': {
    name: "June Genius '26",
    description: "Uploaded 15 doodles in June 2026",
    icon: 'sun',
    emoji: '☀️',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-06-01',
    availableUntil: '2026-06-30',
  },
  'july_journeyer_2026': {
    name: "July Journeyer '26",
    description: "Uploaded 15 doodles in July 2026",
    icon: 'palmtree',
    emoji: '🏖️',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-07-01',
    availableUntil: '2026-07-31',
  },
  'august_ace_2026': {
    name: "August Ace '26",
    description: "Uploaded 15 doodles in August 2026",
    icon: 'sunset',
    emoji: '🌅',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-08-01',
    availableUntil: '2026-08-31',
  },
  'september_star_2026': {
    name: "September Star '26",
    description: "Uploaded 15 doodles in September 2026",
    icon: 'leaf',
    emoji: '🍂',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-09-01',
    availableUntil: '2026-09-30',
  },
  'october_original_2026': {
    name: "October Original '26",
    description: "Uploaded 15 doodles in October 2026",
    icon: 'moon',
    emoji: '🎃',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-10-01',
    availableUntil: '2026-10-31',
  },
  'november_notable_2026': {
    name: "November Notable '26",
    description: "Uploaded 15 doodles in November 2026",
    icon: 'leaf',
    emoji: '🍁',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-11-01',
    availableUntil: '2026-11-30',
  },
  'december_dedicator_2026': {
    name: "December Dedicator '26",
    description: "Uploaded 15 doodles in December 2026",
    icon: 'snowflake',
    emoji: '⛄',
    category: 'seasonal',
    rarity: 'epic',
    availableFrom: '2026-12-01',
    availableUntil: '2026-12-31',
  },
};

// Doodle - user-uploaded artwork
export interface Doodle {
  id: string;
  user_id: string;
  user_username?: string; // Embedded at upload time for display
  user_avatar_type?: AvatarType; // Embedded at upload time
  user_avatar_icon?: AvatarIconType; // Embedded at upload time
  prompt_id: string;
  prompt_title: string;
  image_url: string; // Supabase Storage public URL
  caption: string;
  is_public: boolean;
  likes_count: number;
  created_at: string;
}

// Doodle Like
export interface DoodleLike {
  id: string;
  user_id: string;
  doodle_id: string;
  created_at: string;
}

// Follow relationship
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// Favorite (user favoriting prompts - renamed from Bookmark for clarity)
export interface Favorite {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: string;
}

// Share tracking
export interface Share {
  id: string;
  user_id: string;
  prompt_id: string;
  platform: string;
  shared_at: string;
}

// User stats for badge tracking
export interface UserStats {
  user_id: string;
  // Visit streaks
  consecutive_visit_days: number;
  longest_visit_streak: number;
  last_visit_date: string | null;
  // Upload streaks
  consecutive_upload_days: number;
  longest_upload_streak: number;
  last_upload_date: string | null;
  // Totals
  total_favorites: number;
  total_shares: number;
  total_uploads: number;
  total_likes_given: number;
  total_likes_received: number;
  // Flags
  has_submitted_prompt_idea: boolean;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  preferences: UserPreferences | null;
  streak: Streak | null;
  badges: Badge[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Google Sheets response types
export interface GoogleSheetsResponse {
  spreadsheetId: string;
  valueRanges: {
    range: string;
    majorDimension: string;
    values: string[][];
  }[];
}

// Admin settings for app-wide configuration
export interface AdminSettings {
  tags_enabled: boolean;
}

// Support Ticket System
export type SupportTicketStatus = 'open' | 'pending' | 'closed';
export type SupportTicketCategory = 'account' | 'billing' | 'bug' | 'doodle_flag' | 'prompt_idea' | 'other';

export interface SupportTicket {
  id: string;
  user_id: string | null; // Nullable for anonymous submissions
  created_at: string;
  updated_at: string;
  status: SupportTicketStatus;
  category: SupportTicketCategory;
  subject: string;
  message: string;
  related_doodle_id?: string | null; // For doodle_flag tickets
  resolution_summary?: string | null;
  closed_by_admin_id?: string | null;
  closed_at?: string | null;
}

export interface SupportTicketNote {
  id: string;
  ticket_id: string;
  admin_id: string;
  note: string;
  created_at: string;
  is_internal: boolean; // true for internal notes, false for user-facing replies
}

// Notification System
export type NotificationType =
  | 'support_reply'
  | 'ticket_closed'
  | 'report_resolved'
  | 'content_removed'
  | 'account_warning'
  | 'account_banned'
  | 'system_announcement'
  | 'badge_earned'; // Adding badge notification support

export interface Notification {
  id: string;
  user_id: string;
  created_at: string;
  read_at: string | null;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null; // Deep link to relevant page
  metadata?: Record<string, unknown>; // Extra data for the notification
}

// Prompt Idea Submission (Premium Feature)
export interface PromptIdea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tags?: string[];
  created_at: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewed_by_admin_id?: string | null;
  reviewed_at?: string | null;
  admin_notes?: string | null;
}

// Doodle Flag/Report (legacy - links to support ticket system)
export interface DoodleFlag {
  id: string;
  doodle_id: string;
  reporter_user_id: string;
  reason: string;
  created_at: string;
  ticket_id: string; // Links to support ticket system
}

// ===== DOODLE REPORTING SYSTEM =====
// Report reasons for flagging inappropriate content
export type DoodleReportReason =
  | 'inappropriate_content'
  | 'spam'
  | 'harassment'
  | 'copyright'
  | 'off_topic'
  | 'other';

export const REPORT_REASONS: Record<DoodleReportReason, { label: string; description: string }> = {
  inappropriate_content: {
    label: 'Inappropriate Content',
    description: 'Contains nudity, violence, or other inappropriate material',
  },
  spam: {
    label: 'Spam',
    description: 'Promotional content, repetitive posts, or unrelated images',
  },
  harassment: {
    label: 'Harassment',
    description: 'Targets, bullies, or harasses another person',
  },
  copyright: {
    label: 'Copyright Violation',
    description: 'Uses copyrighted material without permission',
  },
  off_topic: {
    label: 'Off Topic',
    description: 'Does not relate to the daily prompt',
  },
  other: {
    label: 'Other',
    description: 'Another reason not listed above',
  },
};

// Report status for admin review workflow
export type DoodleReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

// Full doodle report for admin review
export interface DoodleReport {
  id: string;
  doodle_id: string;
  reporter_id: string;
  reason: DoodleReportReason;
  details?: string | null; // Optional additional context from reporter
  status: DoodleReportStatus;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null; // Admin user ID
  resolution_notes?: string | null;
  // Embedded doodle info for display (populated at query time)
  doodle?: Doodle;
  reporter_username?: string;
}

// App state
export interface AppState {
  currentView: 'landing' | 'prompt' | 'archive' | 'bookmarks' | 'profile' | 'settings' | 'pricing';
  selectedPromptId: string | null;
  searchQuery: string;
  filters: {
    category: string | null;
    tags: string[];
  };
}

// Subscription tier
export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionFeatures {
  archiveAccess: 'last_3_days' | 'full';
  bookmarks: boolean;
  streakFreeze: boolean;
  adsEnabled: boolean;
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    archiveAccess: 'last_3_days',
    bookmarks: false,
    streakFreeze: false,
    adsEnabled: true,
  },
  premium: {
    archiveAccess: 'full',
    bookmarks: true,
    streakFreeze: true,
    adsEnabled: false,
  },
};

// Share data
export interface ShareData {
  title: string;
  text: string;
  url: string;
}

// Onboarding slide
export interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image?: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to DailyDoodlePrompt',
    description: 'Get inspired with a new creative drawing prompt every day. Perfect for artists of all skill levels!',
  },
  {
    id: 2,
    title: 'How It Works',
    description: 'Each day you\'ll receive a unique artist-curated prompt to challenge your creativity.',
  },
  {
    id: 3,
    title: 'Track Your Progress',
    description: 'Build streaks, earn badges, and save your favorite prompts. Upgrade to premium for full archive access and more!',
  },
];
