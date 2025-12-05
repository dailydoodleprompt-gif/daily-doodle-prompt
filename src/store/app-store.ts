import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  UserPreferences,
  Streak,
  Badge,
  BadgeType,
  Bookmark,
  OAuthProvider,
  AvatarType,
  AvatarIconType,
  PasswordResetToken,
  Doodle,
  DoodleLike,
  Follow,
  Share,
  UserStats,
  AdminSettings,
  ProfileTitleType,
  BiometricCredential,
  SupportTicket,
  SupportTicketNote,
  SupportTicketStatus,
  SupportTicketCategory,
  Notification,
  NotificationType,
  PromptIdea,
  DoodleFlag,
} from '@/types';
import {
  DEFAULT_TITLES,
  SECRET_TITLES,
  ADMIN_TITLE,
} from '@/types';
import {
  getTodayEST,
  areConsecutiveDays,
  shouldResetStreak,
} from '@/lib/timezone';
import * as SupportService from '@/lib/support-service';
import { notifyAdminOfSupportTicket } from '@/lib/email-service';

// OAuth user profile from providers
interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

// Simulated user data for demo (in production, this would come from an API)
interface AppUser extends User {
  password_hash?: string; // Optional for OAuth users
}

// Storage key for password reset tokens
const RESET_TOKENS_STORAGE_KEY = 'dailydoodle_reset_tokens';

// Offensive words filter - comprehensive list of hate speech, slurs, and offensive terms
// This is a simplified list - production systems should use specialized moderation APIs
const OFFENSIVE_WORDS = [
  // Racial slurs and hate speech
  'nigger', 'nigga', 'negro', 'kike', 'chink', 'gook', 'spic', 'wetback', 'beaner',
  'cracker', 'honky', 'paki', 'towelhead', 'raghead', 'camel jockey', 'coon', 'darkie',
  'jap', 'nip', 'zipperhead', 'slant', 'slope', 'redskin', 'injun', 'squaw',
  // Gender and sexuality slurs
  'faggot', 'fag', 'dyke', 'homo', 'tranny', 'shemale', 'queer', 'fairy',
  // Religious slurs
  'heeb', 'hymie',
  // Disability slurs
  'retard', 'retarded', 'spaz', 'spastic', 'cripple', 'tard',
  // General offensive terms
  'bitch', 'cunt', 'whore', 'slut', 'fuck', 'fucker', 'fucking', 'shit', 'asshole',
  'bastard', 'dickhead', 'prick', 'cock', 'pussy', 'twat',
  // Hate group references
  'nazi', 'hitler', 'kkk', 'aryan', 'skinhead', 'neonazi',
  // Violence-related
  'kill', 'murder', 'rape', 'rapist', 'terrorist', 'bomb',
];

function containsOffensiveWord(text: string): { isOffensive: boolean; word?: string } {
  const lowercaseText = text.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const word of OFFENSIVE_WORDS) {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lowercaseText.includes(cleanWord)) {
      return { isOffensive: true, word };
    }
  }

  // Also check for leetspeak variations
  const leetMap: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's',
  };

  let deleetedText = text.toLowerCase();
  for (const [leet, letter] of Object.entries(leetMap)) {
    deleetedText = deleetedText.split(leet).join(letter);
  }
  deleetedText = deleetedText.replace(/[^a-z0-9]/g, '');

  for (const word of OFFENSIVE_WORDS) {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (deleetedText.includes(cleanWord)) {
      return { isOffensive: true, word };
    }
  }

  return { isOffensive: false };
}

function getStoredResetTokens(): PasswordResetToken[] {
  try {
    const stored = localStorage.getItem(RESET_TOKENS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveResetTokens(tokens: PasswordResetToken[]): void {
  localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

interface AppState {
  // User state
  user: User | null;
  preferences: UserPreferences | null;
  streak: Streak | null;
  badges: Badge[];
  bookmarks: Bookmark[];

  // Engagement state
  userStats: UserStats | null;
  newlyEarnedBadge: BadgeType | null; // For popup animation

  // UI state
  showOnboarding: boolean;
  currentView: string;

  // Auth actions
  login: (email: string, password: string, stayLoggedIn?: boolean) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider, stayLoggedIn?: boolean) => Promise<void>;
  logout: () => void;

  // User actions
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  completeOnboarding: () => void;
  purchaseLifetimeAccess: () => void;
  completePremiumPurchase: (stripeCustomerId?: string, stripeSessionId?: string) => void;
  updateAvatar: (avatarType: AvatarType, avatarIcon?: AvatarIconType) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>; // Returns reset token for demo
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // User profile actions
  changeUsername: (newUsername: string, password: string) => Promise<void>;
  changeUsernameOAuth: (newUsername: string) => Promise<void>; // For OAuth users without password
  completeUsernameSetup: (username: string) => Promise<void>; // For initial OAuth username setup

  // Title actions (premium feature)
  setTitle: (titleId: ProfileTitleType) => void;
  getAvailableTitles: () => ProfileTitleType[];
  getUnlockedSecretTitles: () => ProfileTitleType[];
  clearNewlyUnlockedTitles: () => void;
  checkAndUnlockSecretTitles: () => void;

  // Biometric auth actions
  isBiometricAvailable: () => Promise<boolean>;
  enableBiometric: () => Promise<{ success: boolean; error?: string }>;
  disableBiometric: () => void;
  authenticateWithBiometric: () => Promise<{ success: boolean; error?: string }>;

  // Admin actions
  getAllUsers: () => AppUser[];
  getAdminStats: () => { totalUsers: number; newUsersThisWeek: number; premiumUsers: number };
  deleteUser: (userId: string) => Promise<void>;
  toggleUserPremium: (userId: string) => Promise<void>;
  toggleUserAdmin: (userId: string) => Promise<void>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
  adminUpdateUsername: (userId: string, newUsername: string) => Promise<void>;
  adminDeleteDoodle: (doodleId: string) => Promise<void>;
  getAppSettings: () => AdminSettings;
  updateAppSettings: (settings: Partial<AdminSettings>) => void;
  getUserById: (userId: string) => AppUser | undefined;

  // Bookmark/Favorite actions
  addBookmark: (promptId: string) => void;
  removeBookmark: (promptId: string) => void;
  isBookmarked: (promptId: string) => boolean;

  // Streak actions
  recordPromptView: () => void;
  useStreakFreeze: () => boolean;

  // Badge actions
  awardBadge: (badgeType: BadgeType) => void;
  hasBadge: (badgeType: BadgeType) => boolean;
  clearNewlyEarnedBadge: () => void;

  // Doodle actions
  uploadDoodle: (promptId: string, promptTitle: string, imageData: string, caption: string, isPublic: boolean) => Promise<{ success: boolean; error?: string }>;
  getDoodles: (userId?: string, onlyPublic?: boolean) => Doodle[];
  getPromptDoodles: (promptId: string) => Doodle[];
  deleteDoodle: (doodleId: string) => void;
  toggleDoodleVisibility: (doodleId: string) => void;

  // Like actions
  likeDoodle: (doodleId: string) => void;
  unlikeDoodle: (doodleId: string) => void;
  hasLikedDoodle: (doodleId: string) => boolean;
  getLikedDoodles: () => Doodle[];

  // Follow actions
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getFollowers: (userId: string) => string[];
  getFollowing: (userId: string) => string[];
  getFollowerCount: (userId: string) => number;
  getFollowingCount: (userId: string) => number;

  // Share actions
  recordShare: (promptId: string, platform: string) => void;

  // Feed actions
  getFeed: () => Array<{ type: 'prompt' | 'doodle'; data: Doodle; timestamp: string }>;

  // Stats actions
  getUserStats: (userId?: string) => UserStats | null;
  submitPromptIdea: () => void;

  // Support Ticket actions
  createSupportTicket: (category: SupportTicketCategory, subject: string, message: string) => Promise<{ success: boolean; ticketId?: string; error?: string }>;
  getAllTickets: () => SupportTicket[];
  getUserTickets: (userId: string) => SupportTicket[];
  getTicket: (ticketId: string) => SupportTicket | null;
  updateTicketStatus: (ticketId: string, status: SupportTicketStatus, resolutionSummary?: string) => Promise<{ success: boolean; error?: string }>;
  addTicketNote: (ticketId: string, note: string, isInternal: boolean) => Promise<{ success: boolean; error?: string }>;
  getTicketNotes: (ticketId: string) => SupportTicketNote[];
  getTicketWithUser: (ticketId: string) => { ticket: SupportTicket; user: AppUser | null; doodle: Doodle | null } | null;

  // Notification actions
  getNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  getUnreadCount: () => number;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;

  // Prompt Idea actions (premium feature)
  submitPromptIdeaPremium: (title: string, description: string, tags?: string[]) => Promise<{ success: boolean; error?: string }>;
  getAllPromptIdeas: () => PromptIdea[];
  updatePromptIdeaStatus: (ideaId: string, status: 'under_review' | 'approved' | 'rejected', adminNotes?: string) => void;

  // Doodle Flag/Moderation actions
  flagDoodle: (doodleId: string, reason: string) => Promise<{ success: boolean; ticketId?: string; error?: string }>;
  moderateDoodle: (doodleId: string, action: 'no_action' | 'remove_warn' | 'remove_ban', reporterUserId: string, ticketId: string, resolutionSummary: string) => Promise<{ success: boolean; error?: string }>;
  getDoodleFlags: (doodleId?: string) => DoodleFlag[];
  warnUser: (userId: string) => void;
  banUser: (userId: string) => void;
  getUserWarningCount: (userId: string) => number;
}

// Simple hash function for demo (in production, use bcrypt on server)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Date utilities are now imported from @/lib/timezone:
// - getTodayEST() for getting today's date in EST
// - areConsecutiveDays() for streak calculations
// - shouldResetStreak() for streak reset checks

// Storage key for users (simulated database)
const USERS_STORAGE_KEY = 'dailydoodle_users';
const DOODLES_STORAGE_KEY = 'dailydoodle_doodles';
const LIKES_STORAGE_KEY = 'dailydoodle_likes';
const FOLLOWS_STORAGE_KEY = 'dailydoodle_follows';
const SHARES_STORAGE_KEY = 'dailydoodle_shares';
const USER_STATS_STORAGE_KEY = 'dailydoodle_user_stats';
const ADMIN_SETTINGS_STORAGE_KEY = 'dailydoodle_admin_settings';
const USER_BADGES_STORAGE_KEY = 'dailydoodle_user_badges';
const SESSION_PERSISTENCE_KEY = 'dailydoodle_session_persist';

// Default admin settings
const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  tags_enabled: true,
};

function getAdminSettings(): AdminSettings {
  try {
    const stored = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ADMIN_SETTINGS;
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

function saveAdminSettings(settings: AdminSettings): void {
  localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function getStoredUsers(): AppUser[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: AppUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getStoredDoodles(): Doodle[] {
  try {
    const stored = localStorage.getItem(DOODLES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDoodles(doodles: Doodle[]): void {
  localStorage.setItem(DOODLES_STORAGE_KEY, JSON.stringify(doodles));
}

function getStoredLikes(): DoodleLike[] {
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLikes(likes: DoodleLike[]): void {
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
}

function getStoredFollows(): Follow[] {
  try {
    const stored = localStorage.getItem(FOLLOWS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFollows(follows: Follow[]): void {
  localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(follows));
}

function getStoredShares(): Share[] {
  try {
    const stored = localStorage.getItem(SHARES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveShares(shares: Share[]): void {
  localStorage.setItem(SHARES_STORAGE_KEY, JSON.stringify(shares));
}

function getStoredUserStats(): Record<string, UserStats> {
  try {
    const stored = localStorage.getItem(USER_STATS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveUserStats(stats: Record<string, UserStats>): void {
  localStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(stats));
}

function getOrCreateUserStats(userId: string): UserStats {
  const allStats = getStoredUserStats();
  if (!allStats[userId]) {
    allStats[userId] = {
      user_id: userId,
      consecutive_visit_days: 0,
      longest_visit_streak: 0,
      last_visit_date: null,
      consecutive_upload_days: 0,
      longest_upload_streak: 0,
      last_upload_date: null,
      total_favorites: 0,
      total_shares: 0,
      total_uploads: 0,
      total_likes_given: 0,
      total_likes_received: 0,
      has_submitted_prompt_idea: false,
    };
    saveUserStats(allStats);
  }
  return allStats[userId];
}

function updateUserStats(userId: string, updates: Partial<UserStats>): UserStats {
  const allStats = getStoredUserStats();
  const currentStats = getOrCreateUserStats(userId);
  const updatedStats = { ...currentStats, ...updates };
  allStats[userId] = updatedStats;
  saveUserStats(allStats);
  return updatedStats;
}

// ============================================================================
// BADGE PERSISTENCE SYSTEM
// Badges are stored permanently per-user and NEVER reset once earned
// ============================================================================

interface StoredBadge {
  badge_type: BadgeType;
  earned: boolean;        // Once true, NEVER changes back to false
  earnedAt: string;       // ISO timestamp of when badge was earned
}

// Get all badges for a specific user from persistent storage
function getStoredUserBadges(userId: string): Badge[] {
  try {
    const stored = localStorage.getItem(USER_BADGES_STORAGE_KEY);
    if (!stored) return [];
    const allBadges: Record<string, StoredBadge[]> = JSON.parse(stored);
    const userBadges = allBadges[userId] || [];
    // Convert stored format to Badge format
    return userBadges
      .filter(b => b.earned) // Only return earned badges
      .map(b => ({
        id: `${userId}_${b.badge_type}`,
        user_id: userId,
        badge_type: b.badge_type,
        earned_at: b.earnedAt,
      }));
  } catch {
    return [];
  }
}

// Check if a user has a specific badge in persistent storage
function hasStoredBadge(userId: string, badgeType: BadgeType): boolean {
  const badges = getStoredUserBadges(userId);
  return badges.some(b => b.badge_type === badgeType);
}

// Save a badge permanently for a user - NEVER removes earned badges
function saveUserBadge(userId: string, badge: Badge): void {
  try {
    const stored = localStorage.getItem(USER_BADGES_STORAGE_KEY);
    const allBadges: Record<string, StoredBadge[]> = stored ? JSON.parse(stored) : {};
    const userBadges = allBadges[userId] || [];

    // Check if badge already exists (don't overwrite if already earned)
    const existingIndex = userBadges.findIndex(b => b.badge_type === badge.badge_type);
    if (existingIndex >= 0) {
      // Badge already exists and is earned - do NOT modify it
      if (userBadges[existingIndex].earned) {
        return;
      }
    }

    // Add or update the badge
    const storedBadge: StoredBadge = {
      badge_type: badge.badge_type,
      earned: true,
      earnedAt: badge.earned_at,
    };

    if (existingIndex >= 0) {
      userBadges[existingIndex] = storedBadge;
    } else {
      userBadges.push(storedBadge);
    }

    allBadges[userId] = userBadges;
    localStorage.setItem(USER_BADGES_STORAGE_KEY, JSON.stringify(allBadges));
  } catch (err) {
    console.error('Failed to save badge:', err);
  }
}

// Load all badges for a user - combines persistent storage with any new badges
function loadUserBadges(userId: string): Badge[] {
  return getStoredUserBadges(userId);
}

// Sync badges on login - awards any badges the user should have based on their stats
// This ensures badges are never lost and are re-evaluated on each login
function syncBadgesOnLogin(
  get: () => AppState,
  userStats: UserStats,
  currentBadges: Badge[]
): void {
  const hasBadgeInList = (badgeType: BadgeType) =>
    currentBadges.some(b => b.badge_type === badgeType);

  // Helper to award badge if not already earned
  const maybeAwardBadge = (badgeType: BadgeType) => {
    if (!hasBadgeInList(badgeType) && !get().hasBadge(badgeType)) {
      get().awardBadge(badgeType);
    }
  };

  // Check likes received
  if (userStats.total_likes_received > 0) {
    maybeAwardBadge('somebody_likes_me');
  }

  // Check likes given
  if (userStats.total_likes_given > 0) {
    maybeAwardBadge('warm_fuzzies');
  }

  // Check uploads
  if (userStats.total_uploads >= 1) {
    maybeAwardBadge('first_doodle');
  }
  if (userStats.total_uploads >= 10) {
    maybeAwardBadge('doodle_diary');
  }
  if (userStats.total_uploads >= 25) {
    maybeAwardBadge('doodle_digest');
  }
  if (userStats.total_uploads >= 50) {
    maybeAwardBadge('doodle_library');
  }

  // Check favorites
  if (userStats.total_favorites >= 1) {
    maybeAwardBadge('new_collector');
    maybeAwardBadge('first_bookmark');
  }
  if (userStats.total_favorites >= 10) {
    maybeAwardBadge('pack_rat');
  }
  if (userStats.total_favorites >= 25) {
    maybeAwardBadge('cue_curator');
  }
  if (userStats.total_favorites >= 50) {
    maybeAwardBadge('grand_gatherer');
  }

  // Check shares
  if (userStats.total_shares >= 1) {
    maybeAwardBadge('planter_of_seeds');
  }
  if (userStats.total_shares >= 10) {
    maybeAwardBadge('gardener_of_growth');
  }
  if (userStats.total_shares >= 25) {
    maybeAwardBadge('cultivator_of_influence');
  }
  if (userStats.total_shares >= 50) {
    maybeAwardBadge('harvester_of_inspiration');
  }

  // Check upload streak
  if (userStats.consecutive_upload_days >= 7) {
    maybeAwardBadge('daily_doodler');
  }

  // Check if user has submitted prompt idea
  if (userStats.has_submitted_prompt_idea) {
    maybeAwardBadge('idea_fairy');
  }
}

// ============================================================================
// END BADGE PERSISTENCE SYSTEM
// ============================================================================

// ============================================================================
// SESSION PERSISTENCE SYSTEM
// "Stay Logged In" functionality
// ============================================================================

interface SessionPersistence {
  userId: string;
  stayLoggedIn: boolean;
  expiresAt: string | null; // null = no expiry (stay logged in)
}

function getSessionPersistence(): SessionPersistence | null {
  try {
    const stored = localStorage.getItem(SESSION_PERSISTENCE_KEY);
    if (!stored) return null;
    const session: SessionPersistence = JSON.parse(stored);

    // Check if session has expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_PERSISTENCE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function setSessionPersistence(userId: string, stayLoggedIn: boolean): void {
  const session: SessionPersistence = {
    userId,
    stayLoggedIn,
    // If not staying logged in, session expires in 24 hours
    expiresAt: stayLoggedIn ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  localStorage.setItem(SESSION_PERSISTENCE_KEY, JSON.stringify(session));
}

function clearSessionPersistence(): void {
  localStorage.removeItem(SESSION_PERSISTENCE_KEY);
}

// ============================================================================
// END SESSION PERSISTENCE SYSTEM
// ============================================================================

// List of offensive/inappropriate content keywords for safety filter
const INAPPROPRIATE_KEYWORDS = [
  'porn', 'xxx', 'nude', 'naked', 'sex', 'adult', 'nsfw',
  'hate', 'nazi', 'kkk', 'terrorist',
  'illegal', 'drugs', 'cocaine', 'heroin',
];

function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate a username from OAuth profile name
function generateUsernameFromName(name: string, existingUsers: AppUser[]): string {
  // Convert name to username format
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 15);

  let username = baseUsername || 'user';
  let counter = 1;

  // Ensure uniqueness
  while (existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}

// OAuth session storage key - to persist OAuth identity across logout/login cycles
const OAUTH_SESSION_KEY = 'dailydoodle_oauth_session';

interface StoredOAuthSession {
  provider: OAuthProvider;
  id: string; // Stable provider user ID (sub claim)
  email: string;
  name: string;
  avatar_url?: string;
}

function getStoredOAuthSession(provider: OAuthProvider): StoredOAuthSession | null {
  try {
    const stored = localStorage.getItem(OAUTH_SESSION_KEY);
    if (!stored) return null;
    const sessions: Record<string, StoredOAuthSession> = JSON.parse(stored);
    return sessions[provider] || null;
  } catch {
    return null;
  }
}

function saveOAuthSession(session: StoredOAuthSession): void {
  try {
    const stored = localStorage.getItem(OAUTH_SESSION_KEY);
    const sessions: Record<string, StoredOAuthSession> = stored ? JSON.parse(stored) : {};
    sessions[session.provider] = session;
    localStorage.setItem(OAUTH_SESSION_KEY, JSON.stringify(sessions));
  } catch {
    // Silently fail
  }
}

// Simulate OAuth login flow (in production, this would be real OAuth)
// CRITICAL: Uses stable provider ID (sub claim) as the unique identifier
// Apple/Google may use relay emails that change - we NEVER use email as the primary key
async function simulateOAuthLogin(provider: OAuthProvider): Promise<OAuthProfile> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check for existing OAuth session - this simulates a returning user
  // In production, the OAuth provider returns a stable 'sub' claim
  const existingSession = getStoredOAuthSession(provider);

  if (existingSession) {
    // Returning user - use the SAME stable ID from their original login
    // This ensures they get matched to their existing account
    return {
      id: existingSession.id,
      email: existingSession.email, // Email might have changed but ID stays same
      name: existingSession.name,
      avatar_url: existingSession.avatar_url,
    };
  }

  // New user - generate a stable provider ID
  // In production, this comes from the OAuth provider's 'sub' claim
  const stableProviderId = `${provider}_sub_${crypto.randomUUID()}`;
  const mockEmail = `user_${Date.now().toString(36)}@${provider === 'apple' ? 'privaterelay.appleid.com' : 'gmail.com'}`;
  const mockName = provider === 'apple' ? 'Apple User' : 'Google User';
  const avatar_url = provider === 'google'
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(mockName)}&background=4285f4&color=fff`
    : undefined;

  // Save the session for future logins
  const session: StoredOAuthSession = {
    provider,
    id: stableProviderId,
    email: mockEmail,
    name: mockName,
    avatar_url,
  };
  saveOAuthSession(session);

  return {
    id: stableProviderId,
    email: mockEmail,
    name: mockName,
    avatar_url,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      preferences: null,
      streak: null,
      badges: [],
      bookmarks: [],
      userStats: null,
      newlyEarnedBadge: null,
      showOnboarding: false,
      currentView: 'landing',

      // Auth actions
      login: async (email: string, password: string, stayLoggedIn: boolean = false) => {
        const users = getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
          throw new Error('User not found');
        }

        if (user.password_hash !== simpleHash(password)) {
          throw new Error('Invalid password');
        }

        // Create user object without password - include ALL properties
        const safeUser: User = {
          id: user.id,
          email: user.email,
          username: user.username,
          is_premium: user.is_premium,
          is_admin: user.is_admin,
          avatar_type: user.avatar_type,
          avatar_icon: user.avatar_icon,
          current_title: user.current_title,
          unlocked_titles: user.unlocked_titles,
          newly_unlocked_titles: user.newly_unlocked_titles,
          oauth_provider: user.oauth_provider,
          oauth_id: user.oauth_id,
          avatar_url: user.avatar_url,
          needs_username_setup: user.needs_username_setup,
          biometric_enabled: user.biometric_enabled,
          biometric_credentials: user.biometric_credentials,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };

        // Load user stats
        const userStats = getOrCreateUserStats(user.id);

        // Ensure preferences exist for returning user
        const now = new Date().toISOString();
        const currentPreferences = get().preferences;
        const preferences: UserPreferences = currentPreferences || {
          id: generateId(),
          user_id: user.id,
          push_notifications_enabled: false,
          push_notification_time: '09:00',
          email_notifications_enabled: true,
          theme_mode: 'light',
          has_completed_onboarding: true,
          created_at: user.created_at,
          updated_at: now,
        };

        // Ensure streak exists
        const currentStreak = get().streak;
        const streak: Streak = currentStreak || {
          id: generateId(),
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          last_viewed_date: null,
          streak_freeze_available: user.is_premium || false,
          streak_freeze_used_this_month: false,
          created_at: user.created_at,
          updated_at: now,
        };

        // CRITICAL: Load badges from persistent storage
        // This ensures badges persist across logout/login cycles
        const persistedBadges = loadUserBadges(user.id);

        // Save session persistence preference
        setSessionPersistence(user.id, stayLoggedIn);

        set({ user: safeUser, userStats, preferences, streak, badges: persistedBadges });

        // Run badge sync to check for any badges that should be awarded based on current stats
        // This runs AFTER setting the user so hasBadge() works correctly
        setTimeout(() => {
          syncBadgesOnLogin(get, userStats, persistedBadges);
        }, 100);
      },

      signup: async (email: string, password: string, username: string) => {
        const users = getStoredUsers();

        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Email already exists');
        }

        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          throw new Error('Username already taken');
        }

        const now = new Date().toISOString();
        const userId = generateId();

        const newUser: AppUser = {
          id: userId,
          email,
          username,
          password_hash: simpleHash(password),
          is_premium: false,
          created_at: now,
          updated_at: now,
        };

        users.push(newUser);
        saveUsers(users);

        // Create default preferences
        const preferences: UserPreferences = {
          id: generateId(),
          user_id: userId,
          push_notifications_enabled: false,
          push_notification_time: '09:00',
          email_notifications_enabled: true,
          theme_mode: 'light',
          has_completed_onboarding: false,
          created_at: now,
          updated_at: now,
        };

        // Create initial streak
        const streak: Streak = {
          id: generateId(),
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_viewed_date: null,
          streak_freeze_available: false,
          streak_freeze_used_this_month: false,
          created_at: now,
          updated_at: now,
        };

        // Safe user object
        const safeUser: User = {
          id: userId,
          email,
          username,
          is_premium: false,
          created_at: now,
          updated_at: now,
        };

        set({
          user: safeUser,
          preferences,
          streak,
          badges: [],
          bookmarks: [],
          showOnboarding: true,
        });

        // Creative Spark badge will be awarded after onboarding is complete
      },

      loginWithOAuth: async (provider: OAuthProvider, stayLoggedIn: boolean = false) => {
        // Simulate OAuth flow - in production, this would redirect to provider
        // and handle the callback with actual OAuth tokens
        const mockOAuthProfile = await simulateOAuthLogin(provider);

        const users = getStoredUsers();
        let user = users.find(u =>
          u.oauth_provider === provider && u.oauth_id === mockOAuthProfile.id
        );

        const now = new Date().toISOString();

        if (!user) {
          // Check if email already exists with different auth method
          const existingEmailUser = users.find(u =>
            u.email.toLowerCase() === mockOAuthProfile.email.toLowerCase()
          );

          if (existingEmailUser) {
            // Link OAuth to existing account
            existingEmailUser.oauth_provider = provider;
            existingEmailUser.oauth_id = mockOAuthProfile.id;
            existingEmailUser.avatar_url = mockOAuthProfile.avatar_url;
            existingEmailUser.updated_at = now;
            saveUsers(users);
            user = existingEmailUser;
          } else {
            // Create new user from OAuth
            const userId = generateId();
            // Generate a temporary username - user will be prompted to choose their own
            const tempUsername = generateUsernameFromName(mockOAuthProfile.name, users);
            const newUser: AppUser = {
              id: userId,
              email: mockOAuthProfile.email,
              username: tempUsername,
              is_premium: false,
              oauth_provider: provider,
              oauth_id: mockOAuthProfile.id,
              avatar_url: mockOAuthProfile.avatar_url,
              needs_username_setup: true, // OAuth users need to choose their username
              created_at: now,
              updated_at: now,
            };

            users.push(newUser);
            saveUsers(users);
            user = newUser;

            // Create default preferences for new user
            const preferences: UserPreferences = {
              id: generateId(),
              user_id: userId,
              push_notifications_enabled: false,
              push_notification_time: '09:00',
              email_notifications_enabled: true,
              theme_mode: 'light',
              has_completed_onboarding: false,
              created_at: now,
              updated_at: now,
            };

            // Create initial streak
            const streak: Streak = {
              id: generateId(),
              user_id: userId,
              current_streak: 0,
              longest_streak: 0,
              last_viewed_date: null,
              streak_freeze_available: false,
              streak_freeze_used_this_month: false,
              created_at: now,
              updated_at: now,
            };

            const safeUser: User = {
              id: userId,
              email: mockOAuthProfile.email,
              username: newUser.username,
              is_premium: false,
              oauth_provider: provider,
              oauth_id: mockOAuthProfile.id,
              avatar_url: mockOAuthProfile.avatar_url,
              needs_username_setup: true,
              created_at: now,
              updated_at: now,
            };

            // Save session persistence for new OAuth users
            setSessionPersistence(userId, stayLoggedIn);

            set({
              user: safeUser,
              preferences,
              streak,
              badges: [],
              bookmarks: [],
              showOnboarding: true,
            });

            // Creative Spark badge will be awarded after onboarding is complete
            return;
          }
        }

        // Existing user - just log them in (no onboarding, no username setup)
        // Load ALL user properties including premium status, admin status, titles, etc.
        const safeUser: User = {
          id: user.id,
          email: user.email,
          username: user.username,
          is_premium: user.is_premium,
          is_admin: user.is_admin,
          oauth_provider: user.oauth_provider,
          oauth_id: user.oauth_id,
          avatar_url: user.avatar_url,
          avatar_type: user.avatar_type,
          avatar_icon: user.avatar_icon,
          current_title: user.current_title,
          unlocked_titles: user.unlocked_titles,
          newly_unlocked_titles: user.newly_unlocked_titles,
          needs_username_setup: user.needs_username_setup, // Should be false for existing users
          biometric_enabled: user.biometric_enabled,
          biometric_credentials: user.biometric_credentials,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };

        // Load user stats for returning user
        const userStats = getOrCreateUserStats(user.id);

        // Ensure preferences exist for returning user
        // The persisted store should have them, but create defaults if not
        const currentPreferences = get().preferences;
        const preferences: UserPreferences = currentPreferences || {
          id: generateId(),
          user_id: user.id,
          push_notifications_enabled: false,
          push_notification_time: '09:00',
          email_notifications_enabled: true,
          theme_mode: 'light',
          has_completed_onboarding: true, // Returning user has already onboarded
          created_at: user.created_at,
          updated_at: now,
        };

        // Ensure streak exists for returning user
        const currentStreak = get().streak;
        const streak: Streak = currentStreak || {
          id: generateId(),
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          last_viewed_date: null,
          streak_freeze_available: user.is_premium || false,
          streak_freeze_used_this_month: false,
          created_at: user.created_at,
          updated_at: now,
        };

        // CRITICAL: Load badges from persistent storage for returning OAuth users
        const persistedBadges = loadUserBadges(user.id);

        // Save session persistence preference for OAuth users too
        setSessionPersistence(user.id, stayLoggedIn);

        // CRITICAL: Do NOT show onboarding for returning OAuth users
        // They already have an account - just log them in
        set({
          user: safeUser,
          preferences,
          streak,
          userStats,
          badges: persistedBadges,
          showOnboarding: false, // Never show onboarding for returning users
        });

        // Run badge sync to check for any badges that should be awarded based on current stats
        setTimeout(() => {
          syncBadgesOnLogin(get, userStats, persistedBadges);
        }, 100);
      },

      logout: () => {
        // Clear session persistence on logout
        clearSessionPersistence();

        set({
          user: null,
          preferences: null,
          streak: null,
          badges: [],
          bookmarks: [],
          showOnboarding: false,
          currentView: 'landing',
        });
      },

      // User actions
      updatePreferences: (prefs) => {
        const { preferences } = get();
        if (!preferences) return;

        set({
          preferences: {
            ...preferences,
            ...prefs,
            updated_at: new Date().toISOString(),
          },
        });
      },

      completeOnboarding: () => {
        const { preferences } = get();
        set({
          showOnboarding: false,
          preferences: preferences ? {
            ...preferences,
            has_completed_onboarding: true,
            updated_at: new Date().toISOString(),
          } : null,
        });

        // Award Creative Spark badge after onboarding is complete
        // Small delay to ensure the onboarding dialog closes first
        setTimeout(() => {
          if (!get().hasBadge('creative_spark')) {
            get().awardBadge('creative_spark');
          }
        }, 300);
      },

      purchaseLifetimeAccess: () => {
        const { user, streak } = get();
        if (!user) return;

        // Already premium - no need to purchase again
        if (user.is_premium) return;

        const now = new Date().toISOString();

        // Update user in storage
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].is_premium = true;
          users[userIndex].premium_purchased_at = now;
          users[userIndex].updated_at = now;
          saveUsers(users);
        }

        set({
          user: {
            ...user,
            is_premium: true,
            premium_purchased_at: now,
            updated_at: now,
          },
          streak: streak ? {
            ...streak,
            streak_freeze_available: true,
          } : null,
        });

        // Award the Premium Patron badge for lifetime purchase
        setTimeout(() => {
          if (!get().hasBadge('premium_patron')) {
            get().awardBadge('premium_patron');
          }
        }, 300);
      },

      completePremiumPurchase: (stripeCustomerId?: string, stripeSessionId?: string) => {
        const { user, streak } = get();
        if (!user) return;

        // Already premium - no need to update again
        if (user.is_premium) return;

        const now = new Date().toISOString();

        // Update user in storage with Stripe data
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].is_premium = true;
          users[userIndex].premium_purchased_at = now;
          users[userIndex].stripe_customer_id = stripeCustomerId;
          users[userIndex].stripe_session_id = stripeSessionId;
          users[userIndex].updated_at = now;
          saveUsers(users);
        }

        set({
          user: {
            ...user,
            is_premium: true,
            premium_purchased_at: now,
            stripe_customer_id: stripeCustomerId,
            stripe_session_id: stripeSessionId,
            updated_at: now,
          },
          streak: streak ? {
            ...streak,
            streak_freeze_available: true,
          } : null,
        });

        // Award the Premium Patron badge for lifetime purchase
        setTimeout(() => {
          if (!get().hasBadge('premium_patron')) {
            get().awardBadge('premium_patron');
          }
        }, 300);
      },

      updateAvatar: (avatarType: AvatarType, avatarIcon?: AvatarIconType) => {
        const { user } = get();
        if (!user) return;

        const now = new Date().toISOString();

        // Update user in storage
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].avatar_type = avatarType;
          users[userIndex].avatar_icon = avatarIcon;
          users[userIndex].updated_at = now;
          saveUsers(users);
        }

        set({
          user: {
            ...user,
            avatar_type: avatarType,
            avatar_icon: avatarIcon,
            updated_at: now,
          },
        });
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get();
        if (!user) throw new Error('Not logged in');

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1) throw new Error('User not found');

        const storedUser = users[userIndex];

        // OAuth users can't change password this way
        if (storedUser.oauth_provider && !storedUser.password_hash) {
          throw new Error('Password change not available for OAuth accounts');
        }

        // Verify current password
        if (storedUser.password_hash !== simpleHash(currentPassword)) {
          throw new Error('Current password is incorrect');
        }

        // Update password
        users[userIndex].password_hash = simpleHash(newPassword);
        users[userIndex].updated_at = new Date().toISOString();
        saveUsers(users);
      },

      requestPasswordReset: async (email: string) => {
        const users = getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
          // Don't reveal if user exists - just return a fake token message
          throw new Error('If an account exists with this email, a reset link will be sent');
        }

        // Generate reset token
        const token = generateId() + generateId();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

        const resetToken: PasswordResetToken = {
          id: generateId(),
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString(),
          used: false,
          created_at: now.toISOString(),
        };

        // Store the token
        const tokens = getStoredResetTokens();
        tokens.push(resetToken);
        saveResetTokens(tokens);

        // In a real app, this would send an email
        // For demo purposes, we return the token
        return token;
      },

      resetPassword: async (token: string, newPassword: string) => {
        const tokens = getStoredResetTokens();
        const resetToken = tokens.find(t => t.token === token);

        if (!resetToken) {
          throw new Error('Invalid or expired reset token');
        }

        if (resetToken.used) {
          throw new Error('This reset link has already been used');
        }

        if (new Date(resetToken.expires_at) < new Date()) {
          throw new Error('This reset link has expired');
        }

        // Find and update user
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === resetToken.user_id);

        if (userIndex === -1) {
          throw new Error('User not found');
        }

        // Update password
        users[userIndex].password_hash = simpleHash(newPassword);
        users[userIndex].updated_at = new Date().toISOString();
        saveUsers(users);

        // Mark token as used
        resetToken.used = true;
        saveResetTokens(tokens);
      },

      // User profile actions
      changeUsername: async (newUsername: string, password: string) => {
        const { user } = get();
        if (!user) throw new Error('Not logged in');

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex === -1) throw new Error('User not found');

        const storedUser = users[userIndex];

        // Verify password (required for security)
        // OAuth users without password can't change username through this method
        if (!storedUser.password_hash) {
          throw new Error('Password verification not available for OAuth accounts. Please set a password first.');
        }

        if (storedUser.password_hash !== simpleHash(password)) {
          throw new Error('Password is incorrect');
        }

        // Validate username
        if (newUsername.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        if (newUsername.length > 20) {
          throw new Error('Username must be 20 characters or less');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }

        // Check for offensive content
        const offensiveCheck = containsOffensiveWord(newUsername);
        if (offensiveCheck.isOffensive) {
          throw new Error('Username contains inappropriate language and cannot be used');
        }

        // Check if username is taken by another user
        if (users.some(u => u.id !== user.id && u.username.toLowerCase() === newUsername.toLowerCase())) {
          throw new Error('Username already taken');
        }

        // Update username in storage
        const now = new Date().toISOString();
        users[userIndex].username = newUsername;
        users[userIndex].updated_at = now;
        saveUsers(users);

        // Update current user state
        set({
          user: {
            ...user,
            username: newUsername,
            updated_at: now,
          },
        });
      },

      // Username change for OAuth users (no password required)
      changeUsernameOAuth: async (newUsername: string) => {
        const { user } = get();
        if (!user) throw new Error('Not logged in');

        // Only OAuth users without password can use this
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex === -1) throw new Error('User not found');

        const storedUser = users[userIndex];
        if (!storedUser.oauth_provider) {
          throw new Error('This method is only for OAuth accounts');
        }

        // Validate username
        if (newUsername.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        if (newUsername.length > 20) {
          throw new Error('Username must be 20 characters or less');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }

        // Check for offensive content
        const offensiveCheck = containsOffensiveWord(newUsername);
        if (offensiveCheck.isOffensive) {
          throw new Error('Username contains inappropriate language and cannot be used');
        }

        // Check if username is taken by another user
        if (users.some(u => u.id !== user.id && u.username.toLowerCase() === newUsername.toLowerCase())) {
          throw new Error('Username already taken');
        }

        // Update username in storage
        const now = new Date().toISOString();
        users[userIndex].username = newUsername;
        users[userIndex].updated_at = now;
        saveUsers(users);

        // Update current user state
        set({
          user: {
            ...user,
            username: newUsername,
            updated_at: now,
          },
        });
      },

      // Complete username setup for new OAuth users
      completeUsernameSetup: async (username: string) => {
        const { user } = get();
        if (!user) throw new Error('Not logged in');

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex === -1) throw new Error('User not found');

        // Validate username
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        if (username.length > 20) {
          throw new Error('Username must be 20 characters or less');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }

        // Check for offensive content
        const offensiveCheck = containsOffensiveWord(username);
        if (offensiveCheck.isOffensive) {
          throw new Error('Username contains inappropriate language and cannot be used');
        }

        // Check if username is taken by another user
        if (users.some(u => u.id !== user.id && u.username.toLowerCase() === username.toLowerCase())) {
          throw new Error('Username already taken');
        }

        // Update username and clear setup flag
        const now = new Date().toISOString();
        users[userIndex].username = username;
        users[userIndex].needs_username_setup = false;
        users[userIndex].updated_at = now;
        saveUsers(users);

        // Update current user state
        set({
          user: {
            ...user,
            username,
            needs_username_setup: false,
            updated_at: now,
          },
        });
      },

      // Title actions
      setTitle: (titleId: ProfileTitleType) => {
        const { user } = get();
        if (!user) return;
        if (!user.is_premium && !user.is_admin) return; // Title is premium-only

        // Verify user has access to this title
        const availableTitles = get().getAvailableTitles();
        if (!availableTitles.includes(titleId)) return;

        const now = new Date().toISOString();

        // Update in storage
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].current_title = titleId;
          users[userIndex].updated_at = now;
          saveUsers(users);
        }

        set({
          user: {
            ...user,
            current_title: titleId,
            updated_at: now,
          },
        });
      },

      getAvailableTitles: () => {
        const { user } = get();
        if (!user) return [];
        if (!user.is_premium && !user.is_admin) return [];

        const titles: ProfileTitleType[] = [];

        // Admin gets special title
        if (user.is_admin) {
          titles.push(ADMIN_TITLE.id);
        }

        // Add default titles
        DEFAULT_TITLES.forEach(t => titles.push(t.id));

        // Add unlocked secret titles
        const unlockedSecrets = user.unlocked_titles || [];
        unlockedSecrets.forEach(t => {
          if (!titles.includes(t)) titles.push(t);
        });

        return titles;
      },

      getUnlockedSecretTitles: () => {
        const { user } = get();
        if (!user) return [];
        return user.unlocked_titles?.filter(t =>
          SECRET_TITLES.some(s => s.id === t)
        ) || [];
      },

      clearNewlyUnlockedTitles: () => {
        const { user } = get();
        if (!user) return;

        const now = new Date().toISOString();

        // Update in storage
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].newly_unlocked_titles = [];
          users[userIndex].updated_at = now;
          saveUsers(users);
        }

        set({
          user: {
            ...user,
            newly_unlocked_titles: [],
            updated_at: now,
          },
        });
      },

      checkAndUnlockSecretTitles: () => {
        const { user } = get();
        if (!user) return;
        if (!user.is_premium && !user.is_admin) return;

        // Get user's doodle count
        const doodles = getStoredDoodles();
        const userDoodleCount = doodles.filter(d => d.user_id === user.id).length;

        const currentUnlocked = user.unlocked_titles || [];
        const newlyUnlocked: ProfileTitleType[] = [];

        // Check each secret title
        SECRET_TITLES.forEach(title => {
          if (title.unlockRequirement &&
              userDoodleCount >= title.unlockRequirement &&
              !currentUnlocked.includes(title.id)) {
            newlyUnlocked.push(title.id);
          }
        });

        if (newlyUnlocked.length > 0) {
          const now = new Date().toISOString();
          const allUnlocked = [...currentUnlocked, ...newlyUnlocked];
          const allNewlyUnlocked = [...(user.newly_unlocked_titles || []), ...newlyUnlocked];

          // Update in storage
          const users = getStoredUsers();
          const userIndex = users.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            users[userIndex].unlocked_titles = allUnlocked;
            users[userIndex].newly_unlocked_titles = allNewlyUnlocked;
            users[userIndex].updated_at = now;
            saveUsers(users);
          }

          set({
            user: {
              ...user,
              unlocked_titles: allUnlocked,
              newly_unlocked_titles: allNewlyUnlocked,
              updated_at: now,
            },
          });
        }
      },

      // Biometric auth actions
      isBiometricAvailable: async () => {
        // Check if WebAuthn is supported
        if (!window.PublicKeyCredential) {
          return false;
        }

        try {
          // Check if platform authenticator is available (Face ID, Touch ID, Windows Hello)
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          return available;
        } catch {
          return false;
        }
      },

      enableBiometric: async () => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not logged in' };

        const isAvailable = await get().isBiometricAvailable();
        if (!isAvailable) {
          return { success: false, error: 'Biometric authentication is not available on this device' };
        }

        try {
          // Generate a challenge (in production, this should come from server)
          const challenge = new Uint8Array(32);
          crypto.getRandomValues(challenge);

          // Create credential options
          const createOptions: CredentialCreationOptions = {
            publicKey: {
              challenge,
              rp: {
                name: 'Daily Doodle Prompt',
                id: window.location.hostname,
              },
              user: {
                id: new TextEncoder().encode(user.id),
                name: user.email,
                displayName: user.username,
              },
              pubKeyCredParams: [
                { type: 'public-key', alg: -7 }, // ES256
                { type: 'public-key', alg: -257 }, // RS256
              ],
              authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
                residentKey: 'preferred',
              },
              timeout: 60000,
            },
          };

          // Create the credential
          const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential;

          if (!credential) {
            return { success: false, error: 'Failed to create biometric credential' };
          }

          const now = new Date().toISOString();
          const newCredential: BiometricCredential = {
            id: generateId(),
            device_name: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
            credential_id: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            public_key: '', // In production, store the actual public key
            created_at: now,
            last_used_at: now,
          };

          // Update user in storage
          const users = getStoredUsers();
          const userIndex = users.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            const existingCredentials = users[userIndex].biometric_credentials || [];
            users[userIndex].biometric_enabled = true;
            users[userIndex].biometric_credentials = [...existingCredentials, newCredential];
            users[userIndex].updated_at = now;
            saveUsers(users);
          }

          set({
            user: {
              ...user,
              biometric_enabled: true,
              biometric_credentials: [...(user.biometric_credentials || []), newCredential],
              updated_at: now,
            },
          });

          return { success: true };
        } catch (err) {
          console.error('Biometric enrollment failed:', err);
          return { success: false, error: 'Biometric enrollment was cancelled or failed' };
        }
      },

      disableBiometric: () => {
        const { user } = get();
        if (!user) return;

        const now = new Date().toISOString();

        // Update in storage
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].biometric_enabled = false;
          users[userIndex].biometric_credentials = [];
          users[userIndex].updated_at = now;
          saveUsers(users);
        }

        set({
          user: {
            ...user,
            biometric_enabled: false,
            biometric_credentials: [],
            updated_at: now,
          },
        });
      },

      authenticateWithBiometric: async () => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not logged in' };
        if (!user.biometric_enabled || !user.biometric_credentials?.length) {
          return { success: false, error: 'Biometric authentication is not enabled' };
        }

        try {
          // Generate a challenge (in production, this should come from server)
          const challenge = new Uint8Array(32);
          crypto.getRandomValues(challenge);

          // Prepare allowed credentials
          const allowCredentials = user.biometric_credentials.map(cred => ({
            type: 'public-key' as const,
            id: Uint8Array.from(atob(cred.credential_id), c => c.charCodeAt(0)),
          }));

          const getOptions: CredentialRequestOptions = {
            publicKey: {
              challenge,
              rpId: window.location.hostname,
              allowCredentials,
              userVerification: 'required',
              timeout: 60000,
            },
          };

          const credential = await navigator.credentials.get(getOptions) as PublicKeyCredential;

          if (!credential) {
            return { success: false, error: 'Biometric authentication failed' };
          }

          // In production, verify the signature on the server
          // For demo, just check if we got a credential back
          return { success: true };
        } catch (err) {
          console.error('Biometric authentication failed:', err);
          return { success: false, error: 'Biometric authentication was cancelled or failed' };
        }
      },

      // Admin actions
      getAllUsers: () => {
        const { user } = get();
        if (!user?.is_admin) return [];
        return getStoredUsers();
      },

      getAdminStats: () => {
        const { user } = get();
        if (!user?.is_admin) {
          return { totalUsers: 0, newUsersThisWeek: 0, premiumUsers: 0 };
        }

        const users = getStoredUsers();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newUsersThisWeek = users.filter(
          u => new Date(u.created_at) >= oneWeekAgo
        ).length;

        const premiumUsers = users.filter(u => u.is_premium).length;

        return {
          totalUsers: users.length,
          newUsersThisWeek,
          premiumUsers,
        };
      },

      deleteUser: async (userId: string) => {
        const { user } = get();
        if (!user?.is_admin) throw new Error('Admin access required');

        const users = getStoredUsers();
        const targetUser = users.find(u => u.id === userId);

        if (!targetUser) throw new Error('User not found');

        // Prevent admin from deleting themselves
        if (targetUser.id === user.id) {
          throw new Error('Cannot delete your own account');
        }

        // Remove user from storage
        const filteredUsers = users.filter(u => u.id !== userId);
        saveUsers(filteredUsers);
      },

      toggleUserPremium: async (userId: string) => {
        const { user } = get();
        if (!user?.is_admin) throw new Error('Admin access required');

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) throw new Error('User not found');

        const now = new Date().toISOString();
        users[userIndex].is_premium = !users[userIndex].is_premium;
        users[userIndex].updated_at = now;
        saveUsers(users);

        // If toggling current user's premium status, update state
        if (userId === user.id) {
          set({
            user: {
              ...user,
              is_premium: users[userIndex].is_premium,
              updated_at: now,
            },
          });
        }
      },

      toggleUserAdmin: async (userId: string) => {
        const { user } = get();
        if (!user?.is_admin) throw new Error('Admin access required');

        // Prevent admin from removing their own admin status
        if (userId === user.id) {
          throw new Error('Cannot remove your own admin status');
        }

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) throw new Error('User not found');

        const now = new Date().toISOString();
        users[userIndex].is_admin = !users[userIndex].is_admin;
        users[userIndex].updated_at = now;
        saveUsers(users);
      },

      resetUserPassword: async (userId: string, newPassword: string) => {
        const { user } = get();
        if (!user?.is_admin) throw new Error('Admin access required');

        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) throw new Error('User not found');

        const now = new Date().toISOString();
        users[userIndex].password_hash = simpleHash(newPassword);
        users[userIndex].updated_at = now;
        saveUsers(users);
      },

      adminUpdateUsername: async (userId: string, newUsername: string) => {
        const { user } = get();
        if (!user?.is_admin) throw new Error('Admin access required');

        // Validate username
        if (newUsername.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        if (newUsername.length > 20) {
          throw new Error('Username must be 20 characters or less');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }

        const users = getStoredUsers();

        // Check if username is taken by another user
        if (users.some(u => u.id !== userId && u.username.toLowerCase() === newUsername.toLowerCase())) {
          throw new Error('Username already taken');
        }

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) throw new Error('User not found');

        const now = new Date().toISOString();
        users[userIndex].username = newUsername;
        users[userIndex].updated_at = now;
        saveUsers(users);

        // If updating current user's username, update state
        if (userId === user.id) {
          set({
            user: {
              ...user,
              username: newUsername,
              updated_at: now,
            },
          });
        }
      },

      adminDeleteDoodle: async (doodleId: string) => {
        const { user } = get();
        if (!user?.is_admin) throw new Error('Admin access required');

        const doodles = getStoredDoodles();
        const doodle = doodles.find(d => d.id === doodleId);

        if (!doodle) throw new Error('Doodle not found');

        // Get likes for this doodle to update stats
        const likes = getStoredLikes();
        const doodleLikes = likes.filter(l => l.doodle_id === doodleId);

        // Update owner's total_likes_received count
        if (doodleLikes.length > 0) {
          const ownerStats = getOrCreateUserStats(doodle.user_id);
          const newLikesReceived = Math.max(0, ownerStats.total_likes_received - doodleLikes.length);
          updateUserStats(doodle.user_id, { total_likes_received: newLikesReceived });
        }

        // Update liker's stats (decrement total_likes_given for each liker)
        doodleLikes.forEach(like => {
          const likerStats = getOrCreateUserStats(like.user_id);
          const newLikesGiven = Math.max(0, likerStats.total_likes_given - 1);
          updateUserStats(like.user_id, { total_likes_given: newLikesGiven });
        });

        // Update owner's total_uploads count
        const ownerStats = getOrCreateUserStats(doodle.user_id);
        const remainingUploads = doodles.filter(d => d.user_id === doodle.user_id && d.id !== doodleId).length;
        updateUserStats(doodle.user_id, { total_uploads: remainingUploads });

        // Remove the doodle
        const filtered = doodles.filter(d => d.id !== doodleId);
        saveDoodles(filtered);

        // Remove likes for this doodle
        const filteredLikes = likes.filter(l => l.doodle_id !== doodleId);
        saveLikes(filteredLikes);
      },

      getAppSettings: () => {
        return getAdminSettings();
      },

      updateAppSettings: (settings: Partial<AdminSettings>) => {
        const { user } = get();
        if (!user?.is_admin) return;

        const currentSettings = getAdminSettings();
        const newSettings = { ...currentSettings, ...settings };
        saveAdminSettings(newSettings);
      },

      getUserById: (userId: string) => {
        const users = getStoredUsers();
        return users.find(u => u.id === userId);
      },

      // Bookmark actions
      addBookmark: (promptId: string) => {
        const { user, bookmarks } = get();
        if (!user || !user.is_premium) return;

        if (bookmarks.some(b => b.prompt_id === promptId)) return;

        const newBookmark: Bookmark = {
          id: generateId(),
          user_id: user.id,
          prompt_id: promptId,
          created_at: new Date().toISOString(),
        };

        const newBookmarks = [...bookmarks, newBookmark];
        set({ bookmarks: newBookmarks });

        // Update user stats
        updateUserStats(user.id, { total_favorites: newBookmarks.length });

        // Award collection badges
        if (newBookmarks.length === 1) {
          get().awardBadge('new_collector');
          get().awardBadge('first_bookmark'); // Legacy
        }
        if (newBookmarks.length >= 10 && !get().hasBadge('pack_rat')) {
          get().awardBadge('pack_rat');
        }
        if (newBookmarks.length >= 25 && !get().hasBadge('cue_curator')) {
          get().awardBadge('cue_curator');
        }
        if (newBookmarks.length >= 50 && !get().hasBadge('grand_gatherer')) {
          get().awardBadge('grand_gatherer');
        }
      },

      removeBookmark: (promptId: string) => {
        const { bookmarks } = get();
        set({ bookmarks: bookmarks.filter(b => b.prompt_id !== promptId) });
      },

      isBookmarked: (promptId: string) => {
        const { bookmarks } = get();
        return bookmarks.some(b => b.prompt_id === promptId);
      },

      // Streak actions
      recordPromptView: () => {
        const { streak, user, badges } = get();
        if (!user || !streak) return;

        const today = getTodayEST();

        // Already viewed today
        if (streak.last_viewed_date === today) return;

        let newStreak = streak.current_streak;
        let longestStreak = streak.longest_streak;

        // Check if streak should be reset
        if (shouldResetStreak(streak.last_viewed_date)) {
          newStreak = 1;
        } else if (streak.last_viewed_date && areConsecutiveDays(streak.last_viewed_date, today)) {
          // Consecutive day - increment streak
          newStreak = streak.current_streak + 1;
        } else if (!streak.last_viewed_date) {
          // First view ever
          newStreak = 1;
        } else {
          // Same day or gap of 1 day
          newStreak = streak.current_streak + 1;
        }

        if (newStreak > longestStreak) {
          longestStreak = newStreak;
        }

        set({
          streak: {
            ...streak,
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_viewed_date: today,
            updated_at: new Date().toISOString(),
          },
        });

        // Award first prompt badge
        if (!badges.some(b => b.badge_type === 'first_prompt')) {
          get().awardBadge('first_prompt');
        }

        // Check for new streak badges
        if (newStreak >= 3 && !badges.some(b => b.badge_type === 'creative_ember')) {
          get().awardBadge('creative_ember');
        }
        if (newStreak >= 10 && !badges.some(b => b.badge_type === 'creative_blaze')) {
          get().awardBadge('creative_blaze');
        }
        if (newStreak >= 20 && !badges.some(b => b.badge_type === 'creative_wildfire')) {
          get().awardBadge('creative_wildfire');
        }

        // Legacy streak badges
        if (newStreak >= 7 && !badges.some(b => b.badge_type === '7_day_streak')) {
          get().awardBadge('7_day_streak');
        }
        if (newStreak >= 30 && !badges.some(b => b.badge_type === '30_day_streak')) {
          get().awardBadge('30_day_streak');
        }
        if (newStreak >= 100 && !badges.some(b => b.badge_type === '100_day_streak')) {
          get().awardBadge('100_day_streak');
        }
      },

      useStreakFreeze: () => {
        const { streak, user } = get();
        if (!user || !user.is_premium || !streak) return false;

        if (!streak.streak_freeze_available || streak.streak_freeze_used_this_month) {
          return false;
        }

        set({
          streak: {
            ...streak,
            streak_freeze_used_this_month: true,
            streak_freeze_available: false,
            updated_at: new Date().toISOString(),
          },
        });

        return true;
      },

      // Badge actions
      awardBadge: (badgeType: BadgeType) => {
        const { user, badges } = get();
        if (!user) return;

        // Check if badge already exists in state OR in persistent storage
        if (badges.some(b => b.badge_type === badgeType)) return;
        if (hasStoredBadge(user.id, badgeType)) return;

        const newBadge: Badge = {
          id: generateId(),
          user_id: user.id,
          badge_type: badgeType,
          earned_at: new Date().toISOString(),
        };

        // CRITICAL: Save badge to persistent storage FIRST
        // This ensures the badge is never lost, even if the session ends
        saveUserBadge(user.id, newBadge);

        // Then update state
        set({ badges: [...badges, newBadge], newlyEarnedBadge: badgeType });
      },

      hasBadge: (badgeType: BadgeType) => {
        const { user, badges } = get();
        // Check both state AND persistent storage
        if (badges.some(b => b.badge_type === badgeType)) return true;
        if (user && hasStoredBadge(user.id, badgeType)) return true;
        return false;
      },

      clearNewlyEarnedBadge: () => {
        set({ newlyEarnedBadge: null });
      },

      // Doodle actions
      uploadDoodle: async (promptId: string, promptTitle: string, imageData: string, caption: string, isPublic: boolean) => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not logged in' };

        // Premium check for doodle uploads
        if (!user.is_premium) {
          return { success: false, error: 'Doodle upload is a premium feature. Please upgrade to upload doodles.' };
        }

        // Safety check for caption
        if (containsInappropriateContent(caption)) {
          return { success: false, error: 'Your caption contains inappropriate content. Please revise and try again.' };
        }

        const now = new Date().toISOString();
        const today = getTodayEST();

        const newDoodle: Doodle = {
          id: generateId(),
          user_id: user.id,
          prompt_id: promptId,
          prompt_title: promptTitle,
          image_url: imageData,
          caption,
          is_public: isPublic,
          likes_count: 0,
          created_at: now,
        };

        const doodles = getStoredDoodles();
        doodles.push(newDoodle);
        saveDoodles(doodles);

        // Update user stats
        const stats = getOrCreateUserStats(user.id);
        const userDoodles = doodles.filter(d => d.user_id === user.id);
        const totalUploads = userDoodles.length;

        // Check upload streak
        let consecutiveUploadDays = stats.consecutive_upload_days;
        let longestUploadStreak = stats.longest_upload_streak;

        if (stats.last_upload_date === today) {
          // Already uploaded today, no streak change
        } else if (stats.last_upload_date && areConsecutiveDays(stats.last_upload_date, today)) {
          consecutiveUploadDays += 1;
        } else {
          consecutiveUploadDays = 1;
        }

        if (consecutiveUploadDays > longestUploadStreak) {
          longestUploadStreak = consecutiveUploadDays;
        }

        updateUserStats(user.id, {
          total_uploads: totalUploads,
          consecutive_upload_days: consecutiveUploadDays,
          longest_upload_streak: longestUploadStreak,
          last_upload_date: today,
        });

        // Check for doodle badges
        if (totalUploads === 1) {
          get().awardBadge('first_doodle');
        }
        if (totalUploads >= 10 && !get().hasBadge('doodle_diary')) {
          get().awardBadge('doodle_diary');
        }
        if (totalUploads >= 25 && !get().hasBadge('doodle_digest')) {
          get().awardBadge('doodle_digest');
        }
        if (totalUploads >= 50 && !get().hasBadge('doodle_library')) {
          get().awardBadge('doodle_library');
        }

        // Check for daily doodler badge
        if (consecutiveUploadDays >= 7 && !get().hasBadge('daily_doodler')) {
          get().awardBadge('daily_doodler');
        }

        // Check for secret title unlocks based on doodle count
        get().checkAndUnlockSecretTitles();

        return { success: true };
      },

      getDoodles: (userId?: string, onlyPublic?: boolean) => {
        const { user } = get();
        const doodles = getStoredDoodles();

        if (userId) {
          const filtered = doodles.filter(d => d.user_id === userId);
          if (onlyPublic && userId !== user?.id) {
            return filtered.filter(d => d.is_public);
          }
          return filtered;
        }

        // Return all public doodles
        return doodles.filter(d => d.is_public);
      },

      getPromptDoodles: (promptId: string) => {
        const doodles = getStoredDoodles();
        return doodles.filter(d => d.prompt_id === promptId && d.is_public);
      },

      deleteDoodle: (doodleId: string) => {
        const { user } = get();
        if (!user) return;

        const doodles = getStoredDoodles();
        const doodle = doodles.find(d => d.id === doodleId);

        if (!doodle || doodle.user_id !== user.id) return;

        // Get likes for this doodle to update stats
        const likes = getStoredLikes();
        const doodleLikes = likes.filter(l => l.doodle_id === doodleId);

        // Update owner's total_likes_received count
        if (doodleLikes.length > 0) {
          const ownerStats = getOrCreateUserStats(doodle.user_id);
          const newLikesReceived = Math.max(0, ownerStats.total_likes_received - doodleLikes.length);
          updateUserStats(doodle.user_id, { total_likes_received: newLikesReceived });
        }

        // Update liker's stats (decrement total_likes_given for each liker)
        doodleLikes.forEach(like => {
          const likerStats = getOrCreateUserStats(like.user_id);
          const newLikesGiven = Math.max(0, likerStats.total_likes_given - 1);
          updateUserStats(like.user_id, { total_likes_given: newLikesGiven });
        });

        // Update owner's total_uploads count
        const ownerStats = getOrCreateUserStats(doodle.user_id);
        const remainingUploads = doodles.filter(d => d.user_id === doodle.user_id && d.id !== doodleId).length;
        updateUserStats(doodle.user_id, { total_uploads: remainingUploads });

        // Remove doodle
        const filtered = doodles.filter(d => d.id !== doodleId);
        saveDoodles(filtered);

        // Remove likes for this doodle
        const filteredLikes = likes.filter(l => l.doodle_id !== doodleId);
        saveLikes(filteredLikes);
      },

      toggleDoodleVisibility: (doodleId: string) => {
        const { user } = get();
        if (!user) return;

        const doodles = getStoredDoodles();
        const doodleIndex = doodles.findIndex(d => d.id === doodleId);

        if (doodleIndex === -1 || doodles[doodleIndex].user_id !== user.id) return;

        doodles[doodleIndex].is_public = !doodles[doodleIndex].is_public;
        saveDoodles(doodles);
      },

      // Like actions
      likeDoodle: (doodleId: string) => {
        const { user, badges } = get();
        if (!user) return;

        const likes = getStoredLikes();
        const doodles = getStoredDoodles();

        // Check if already liked
        if (likes.some(l => l.user_id === user.id && l.doodle_id === doodleId)) return;

        const doodle = doodles.find(d => d.id === doodleId);
        if (!doodle) return;

        // Can't like own doodle
        if (doodle.user_id === user.id) return;

        const newLike: DoodleLike = {
          id: generateId(),
          user_id: user.id,
          doodle_id: doodleId,
          created_at: new Date().toISOString(),
        };

        likes.push(newLike);
        saveLikes(likes);

        // Update doodle like count
        const doodleIndex = doodles.findIndex(d => d.id === doodleId);
        doodles[doodleIndex].likes_count += 1;
        saveDoodles(doodles);

        // Update liker's stats
        const likerStats = getOrCreateUserStats(user.id);
        const newLikesGiven = likerStats.total_likes_given + 1;
        updateUserStats(user.id, { total_likes_given: newLikesGiven });

        // Check for warm fuzzies badge (first like given)
        if (newLikesGiven === 1 && !badges.some(b => b.badge_type === 'warm_fuzzies')) {
          get().awardBadge('warm_fuzzies');
        }

        // Update doodle owner's stats
        const ownerStats = getOrCreateUserStats(doodle.user_id);
        const newLikesReceived = ownerStats.total_likes_received + 1;
        updateUserStats(doodle.user_id, { total_likes_received: newLikesReceived });

        // Award "somebody likes me" badge to doodle owner if first like received
        // If the current user is the owner, award immediately; otherwise store for later
        if (newLikesReceived === 1) {
          if (doodle.user_id === user.id) {
            // Shouldn't happen since we block self-likes, but just in case
            get().awardBadge('somebody_likes_me');
          } else {
            // Store a pending badge for the doodle owner
            // They'll see it when they log in and the badge system checks their stats
            const users = getStoredUsers();
            const ownerUser = users.find(u => u.id === doodle.user_id);
            if (ownerUser) {
              // We'll award the badge when the owner logs in by checking their stats
              // For now, just update the stats which will trigger badge check on login
              const allStats = getStoredUserStats();
              allStats[doodle.user_id] = { ...allStats[doodle.user_id], total_likes_received: newLikesReceived };
              saveUserStats(allStats);
            }
          }
        }
      },

      unlikeDoodle: (doodleId: string) => {
        const { user } = get();
        if (!user) return;

        const likes = getStoredLikes();
        const doodles = getStoredDoodles();

        const likeIndex = likes.findIndex(l => l.user_id === user.id && l.doodle_id === doodleId);
        if (likeIndex === -1) return;

        likes.splice(likeIndex, 1);
        saveLikes(likes);

        // Update doodle like count
        const doodleIndex = doodles.findIndex(d => d.id === doodleId);
        if (doodleIndex !== -1 && doodles[doodleIndex].likes_count > 0) {
          doodles[doodleIndex].likes_count -= 1;
          saveDoodles(doodles);
        }
      },

      hasLikedDoodle: (doodleId: string) => {
        const { user } = get();
        if (!user) return false;

        const likes = getStoredLikes();
        return likes.some(l => l.user_id === user.id && l.doodle_id === doodleId);
      },

      getLikedDoodles: () => {
        const { user } = get();
        if (!user) return [];

        const likes = getStoredLikes();
        const doodles = getStoredDoodles();
        const likedDoodleIds = likes
          .filter(l => l.user_id === user.id)
          .map(l => l.doodle_id);

        return doodles.filter(d => likedDoodleIds.includes(d.id));
      },

      // Follow actions
      followUser: (userId: string) => {
        const { user } = get();
        if (!user || user.id === userId) return;

        const follows = getStoredFollows();

        // Check if already following
        if (follows.some(f => f.follower_id === user.id && f.following_id === userId)) return;

        const newFollow: Follow = {
          id: generateId(),
          follower_id: user.id,
          following_id: userId,
          created_at: new Date().toISOString(),
        };

        follows.push(newFollow);
        saveFollows(follows);
      },

      unfollowUser: (userId: string) => {
        const { user } = get();
        if (!user) return;

        const follows = getStoredFollows();
        const filtered = follows.filter(
          f => !(f.follower_id === user.id && f.following_id === userId)
        );
        saveFollows(filtered);
      },

      isFollowing: (userId: string) => {
        const { user } = get();
        if (!user) return false;

        const follows = getStoredFollows();
        return follows.some(f => f.follower_id === user.id && f.following_id === userId);
      },

      getFollowers: (userId: string) => {
        const follows = getStoredFollows();
        return follows.filter(f => f.following_id === userId).map(f => f.follower_id);
      },

      getFollowing: (userId: string) => {
        const follows = getStoredFollows();
        return follows.filter(f => f.follower_id === userId).map(f => f.following_id);
      },

      getFollowerCount: (userId: string) => {
        const follows = getStoredFollows();
        return follows.filter(f => f.following_id === userId).length;
      },

      getFollowingCount: (userId: string) => {
        const follows = getStoredFollows();
        return follows.filter(f => f.follower_id === userId).length;
      },

      // Share actions
      recordShare: (promptId: string, platform: string) => {
        const { user } = get();
        if (!user) return;

        const shares = getStoredShares();
        const newShare: Share = {
          id: generateId(),
          user_id: user.id,
          prompt_id: promptId,
          platform,
          shared_at: new Date().toISOString(),
        };

        shares.push(newShare);
        saveShares(shares);

        // Update user stats
        const stats = getOrCreateUserStats(user.id);
        const userShares = shares.filter(s => s.user_id === user.id);
        const totalShares = userShares.length;

        updateUserStats(user.id, { total_shares: totalShares });

        // Check for sharing badges
        if (totalShares === 1) {
          get().awardBadge('planter_of_seeds');
        }
        if (totalShares >= 10 && !get().hasBadge('gardener_of_growth')) {
          get().awardBadge('gardener_of_growth');
        }
        if (totalShares >= 25 && !get().hasBadge('cultivator_of_influence')) {
          get().awardBadge('cultivator_of_influence');
        }
        if (totalShares >= 50 && !get().hasBadge('harvester_of_inspiration')) {
          get().awardBadge('harvester_of_inspiration');
        }
      },

      // Feed actions
      getFeed: () => {
        const { user } = get();
        if (!user) return [];

        const following = getStoredFollows()
          .filter(f => f.follower_id === user.id)
          .map(f => f.following_id);

        const doodles = getStoredDoodles();

        // Get doodles from followed users
        const feedDoodles = doodles
          .filter(d => d.is_public && following.includes(d.user_id))
          .map(d => ({
            type: 'doodle' as const,
            data: d,
            timestamp: d.created_at,
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return feedDoodles;
      },

      // Stats actions
      getUserStats: (userId?: string) => {
        const { user } = get();
        const targetId = userId || user?.id;
        if (!targetId) return null;

        return getOrCreateUserStats(targetId);
      },

      submitPromptIdea: () => {
        const { user } = get();
        if (!user) return;

        const stats = getOrCreateUserStats(user.id);
        if (!stats.has_submitted_prompt_idea) {
          updateUserStats(user.id, { has_submitted_prompt_idea: true });
          get().awardBadge('idea_fairy');
        }
      },

      // Support Ticket actions
      createSupportTicket: async (category, subject, message) => {
        const { user } = get();
        const ticket = SupportService.createSupportTicket({
          userId: user?.id || null,
          category,
          subject,
          message,
        });

        // Send email notification to admin
        if (user) {
          await notifyAdminOfSupportTicket({
            ticketId: ticket.id,
            userId: user.id,
            username: user.username,
            category,
            subject,
            message,
          });
        }

        return { success: true, ticketId: ticket.id };
      },

      getAllTickets: () => {
        return SupportService.getStoredTickets();
      },

      getUserTickets: (userId) => {
      const tickets = SupportService.getStoredTickets();
      return tickets.filter((t: any) => t.user_id === userId);
      },

      getTicket: (ticketId) => {
        const tickets = SupportService.getStoredTickets();
        return tickets.find(t => t.id === ticketId) || null;
      },

      updateTicketStatus: async (ticketId, status, resolutionSummary) => {
        const { user } = get();
        if (!user?.is_admin) {
          return { success: false, error: 'Admin access required' };
        }

        const success = SupportService.updateTicketStatus(ticketId, status, user.id, resolutionSummary);

        // If closing ticket, notify the user who submitted it
        if (success && status === 'closed') {
          const ticket = get().getTicket(ticketId);
          if (ticket?.user_id) {
            SupportService.createNotification({
              userId: ticket.user_id,
              type: 'ticket_closed',
              title: 'Support Ticket Closed',
              body: resolutionSummary || 'Your support ticket has been resolved.',
              link: `/support/${ticketId}`,
            });
          }
        }

        return { success };
      },

      addTicketNote: async (ticketId, note, isInternal) => {
        const { user } = get();
        if (!user?.is_admin) {
          return { success: false, error: 'Admin access required' };
        }

        SupportService.addTicketNote({
          ticketId,
          adminId: user.id,
          note,
          isInternal,
        });

        // If it's a user-facing reply, notify the ticket owner
        if (!isInternal) {
          const ticket = get().getTicket(ticketId);
          if (ticket?.user_id) {
            SupportService.createNotification({
              userId: ticket.user_id,
              type: 'support_reply',
              title: 'Support Ticket Reply',
              body: 'An admin has replied to your support ticket.',
              link: `/support/${ticketId}`,
            });
          }
        }

        return { success: true };
      },

      getTicketNotes: (ticketId) => {
        return SupportService.getTicketNotes(ticketId);
      },

      getTicketWithUser: (ticketId) => {
        const ticket = get().getTicket(ticketId);
        if (!ticket) return null;

        const users = getStoredUsers();
        const user = ticket.user_id ? users.find(u => u.id === ticket.user_id) || null : null;

        let doodle = null;
        if (ticket.related_doodle_id) {
          const doodles = getStoredDoodles();
          doodle = doodles.find(d => d.id === ticket.related_doodle_id) || null;
        }

        return { ticket, user, doodle };
      },

      // Notification actions
      getNotifications: () => {
        const { user } = get();
        if (!user) return [];
        return SupportService.getUserNotifications(user.id, false);
      },

      getUnreadNotifications: () => {
        const { user } = get();
        if (!user) return [];
        return SupportService.getUserNotifications(user.id, true);
      },

      getUnreadCount: () => {
        const { user } = get();
        if (!user) return 0;
        return SupportService.getUnreadCount(user.id);
      },

      markNotificationRead: (notificationId) => {
        const { user } = get();
        if (!user) return;
        SupportService.markNotificationRead(notificationId, user.id);
      },

      markAllNotificationsRead: () => {
        const notifications = get().getUnreadNotifications();
        notifications.forEach(n => {
          get().markNotificationRead(n.id);
        });
      },

      // Prompt Idea actions
      submitPromptIdeaPremium: async (title, description, tags) => {
        const { user } = get();
        if (!user) {
          return { success: false, error: 'Must be logged in' };
        }
        if (!user.is_premium) {
          return { success: false, error: 'Premium membership required' };
        }

        const result = await SupportService.submitPromptIdea({
          userId: user.id,
          username: user.username,
          title,
          description,
          tags,
        });

        // Award Idea Fairy badge on first submission
        const stats = getOrCreateUserStats(user.id);
        if (!stats.has_submitted_prompt_idea) {
          updateUserStats(user.id, { has_submitted_prompt_idea: true });
          get().awardBadge('idea_fairy');
        }

        return result;
      },

      getAllPromptIdeas: () => {
        return SupportService.getStoredPromptIdeas();
      },

      updatePromptIdeaStatus: (ideaId, status, adminNotes) => {
        const { user } = get();
        if (!user?.is_admin) return;

        const ideas = SupportService.getStoredPromptIdeas();
        const ideaIndex = ideas.findIndex((i: any) => i.id === ideaId);
        if (ideaIndex === -1) return;

        ideas[ideaIndex].status = status;
        ideas[ideaIndex].reviewed_by_admin_id = user.id;
        ideas[ideaIndex].reviewed_at = new Date().toISOString();
        if (adminNotes) {
          ideas[ideaIndex].admin_notes = adminNotes;
        }
        SupportService.savePromptIdeas(ideas);

        // Notify the user
        const idea = ideas[ideaIndex];
        SupportService.createNotification({
          userId: idea.user_id,
          type: 'system_announcement',
          title: `Prompt Idea ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Declined' : 'Under Review'}`,
          body: status === 'approved'
            ? 'Your prompt idea has been approved! It may appear in future prompts.'
            : status === 'rejected'
            ? 'Thank you for your submission. We reviewed your prompt idea but cannot use it at this time.'
            : 'Your prompt idea is under review.',
        });
      },

      // Doodle Flag/Moderation actions
      flagDoodle: async (doodleId, reason) => {
        const { user } = get();
        if (!user) {
          return { success: false, error: 'Must be logged in to flag content' };
        }

        return await SupportService.flagDoodle({
          doodleId,
          reporterUserId: user.id,
          reporterUsername: user.username,
          reason,
        });
      },

      moderateDoodle: async (doodleId, action, reporterUserId, ticketId, resolutionSummary) => {
        const { user } = get();
        if (!user?.is_admin) {
          return { success: false, error: 'Admin access required' };
        }

        const doodles = getStoredDoodles();
        const doodleIndex = doodles.findIndex(d => d.id === doodleId);
        if (doodleIndex === -1) {
          return { success: false, error: 'Doodle not found' };
        }

        const doodle = doodles[doodleIndex];
        const doodleOwnerId = doodle.user_id;

        // Handle moderation action
        if (action === 'remove_warn' || action === 'remove_ban') {
          // Remove the doodle
          doodles.splice(doodleIndex, 1);
          saveDoodles(doodles);

          // Warn or ban the user
          if (action === 'remove_warn') {
            get().warnUser(doodleOwnerId);
            SupportService.createNotification({
              userId: doodleOwnerId,
              type: 'content_removed',
              title: 'Content Removed',
              body: 'Your doodle was removed for violating our Terms of Service. You have received a warning.',
            });
          } else if (action === 'remove_ban') {
            get().banUser(doodleOwnerId);
            SupportService.createNotification({
              userId: doodleOwnerId,
              type: 'account_banned',
              title: 'Account Suspended',
              body: 'Your account has been suspended for violating our Terms of Service. Your doodle has been removed.',
            });
          }
        }

        // Notify the reporter
        SupportService.createNotification({
          userId: reporterUserId,
          type: 'report_resolved',
          title: 'Report Resolved',
          body: resolutionSummary,
        });

        // Close the support ticket
        await get().updateTicketStatus(ticketId, 'closed', resolutionSummary);

        return { success: true };
      },

      getDoodleFlags: (doodleId) => {
        const flags = SupportService.getStoredDoodleFlags();
        if (doodleId) {
          return flags.filter(f => f.doodle_id === doodleId);
        }
        return flags;
      },

      warnUser: (userId) => {
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        const warningCount = get().getUserWarningCount(userId) + 1;
        // Store warning count in user metadata (extend User type if needed)
        // For now, we'll just log it
        console.log(`User ${userId} warned. Total warnings: ${warningCount}`);

        SupportService.createNotification({
          userId,
          type: 'account_warning',
          title: 'Account Warning',
          body: 'Your content violated our Terms of Service. Further violations may result in account suspension.',
        });
      },

      banUser: (userId) => {
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        // Mark user as banned (we'll add a banned field to User type via metadata)
        // For this implementation, we'll set is_admin to false and is_premium to false
        // In production, you'd have a proper "banned" or "status" field
        users[userIndex].is_premium = false;
        saveUsers(users);

        SupportService.createNotification({
          userId,
          type: 'account_banned',
          title: 'Account Suspended',
          body: 'Your account has been suspended for violating our Terms of Service.',
        });
      },

      getUserWarningCount: (userId) => {
        // Count notifications of type account_warning for this user
        const allNotifications = SupportService.getStoredNotifications();
        return allNotifications.filter(n => n.user_id === userId && n.type === 'account_warning').length;
      },
    }),
    {
      name: 'dailydoodle-app-store',
      partialize: (state) => ({
        user: state.user,
        preferences: state.preferences,
        streak: state.streak,
        badges: state.badges,
        bookmarks: state.bookmarks,
        userStats: state.userStats,
      }),
    }
  )
);

// Selector hooks for convenience
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => !!state.user);
export const useIsPremium = () => useAppStore((state) => state.user?.is_premium ?? false);
export const useIsAdmin = () => useAppStore((state) => state.user?.is_admin ?? false);
export const usePreferences = () => useAppStore((state) => state.preferences);
export const useStreak = () => useAppStore((state) => state.streak);
export const useBadges = () => useAppStore((state) => state.badges);
export const useBookmarks = () => useAppStore((state) => state.bookmarks);
export const useUserStats = () => useAppStore((state) => state.userStats);
export const useNewlyEarnedBadge = () => useAppStore((state) => state.newlyEarnedBadge);
export const useAppSettings = () => useAppStore((state) => state.getAppSettings());

// Helper function to create an admin user (for setup purposes)
export function createAdminUser(email: string, password: string, username: string): void {
  const users = getStoredUsers();

  // Check if admin already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    console.log('Admin user already exists');
    return;
  }

  const now = new Date().toISOString();
  const userId = generateId();

  const adminUser: AppUser = {
    id: userId,
    email,
    username,
    password_hash: simpleHash(password),
    is_premium: true,
    is_admin: true,
    current_title: 'doodle_daddy', // Admin default title
    created_at: now,
    updated_at: now,
  };

  users.push(adminUser);
  saveUsers(users);
  console.log('Admin user created successfully');
}

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@dailydoodle.com',
  password: 'admin123',
  username: 'admin',
};

// Seed default admin account on app initialization
function seedDefaultAdmin(): void {
  const users = getStoredUsers();

  // Check if any admin exists
  const hasAdmin = users.some(u => u.is_admin);

  if (!hasAdmin) {
    createAdminUser(DEFAULT_ADMIN.email, DEFAULT_ADMIN.password, DEFAULT_ADMIN.username);
    console.log('Default admin account created:');
    console.log('  Email: admin@dailydoodle.com');
    console.log('  Password: admin123');
  }
}

// Initialize default admin on module load
seedDefaultAdmin();

// Expose to window for easy setup (remove in production)
if (typeof window !== 'undefined') {
  (window as unknown as { createAdminUser: typeof createAdminUser }).createAdminUser = createAdminUser;
}


