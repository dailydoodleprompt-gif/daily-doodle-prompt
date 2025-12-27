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
export type BadgeCategory = 'membership' | 'streak' | 'collection' | 'sharing' | 'creative' | 'social';

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
  | 'idea_fairy';              // Submitted a prompt idea

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
  image_url: string; // Base64 data URL for local storage
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

// Doodle Flag/Report
export interface DoodleFlag {
  id: string;
  doodle_id: string;
  reporter_user_id: string;
  reason: string;
  created_at: string;
  ticket_id: string; // Links to support ticket system
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
