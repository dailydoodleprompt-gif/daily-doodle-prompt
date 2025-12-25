import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  User,
  UserPreferences,
  Streak,
  Badge,
  BadgeType,
  Bookmark,
  AvatarType,
  AvatarIconType,
  Doodle,
  DoodleLike,
  Follow,
  Share,
  UserStats,
  AdminSettings,
  ProfileTitleType,
  SupportTicket,
  SupportTicketNote,
  SupportTicketStatus,
  SupportTicketCategory,
  Notification,
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

// Storage keys
const USERS_STORAGE_KEY = 'dailydoodle_users';
const DOODLES_STORAGE_KEY = 'dailydoodle_doodles';
const LIKES_STORAGE_KEY = 'dailydoodle_likes';
const FOLLOWS_STORAGE_KEY = 'dailydoodle_follows';
const SHARES_STORAGE_KEY = 'dailydoodle_shares';
const USER_STATS_STORAGE_KEY = 'dailydoodle_user_stats';
const ADMIN_SETTINGS_STORAGE_KEY = 'dailydoodle_admin_settings';
const USER_BADGES_STORAGE_KEY = 'dailydoodle_user_badges';

// Offensive words filter
const OFFENSIVE_WORDS = [
  'nigger', 'nigga', 'negro', 'kike', 'chink', 'gook', 'spic', 'wetback', 'beaner',
  'cracker', 'honky', 'paki', 'towelhead', 'raghead', 'camel jockey', 'coon', 'darkie',
  'jap', 'nip', 'zipperhead', 'slant', 'slope', 'redskin', 'injun', 'squaw',
  'faggot', 'fag', 'dyke', 'homo', 'tranny', 'shemale', 'queer', 'fairy',
  'heeb', 'hymie',
  'retard', 'retarded', 'spaz', 'spastic', 'cripple', 'tard',
  'bitch', 'cunt', 'whore', 'slut', 'fuck', 'fucker', 'fucking', 'shit', 'asshole',
  'bastard', 'dickhead', 'prick', 'cock', 'pussy', 'twat',
  'nazi', 'hitler', 'kkk', 'aryan', 'skinhead', 'neonazi',
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

// Badge persistence
interface StoredBadge {
  badge_type: BadgeType;
  earned: boolean;
  earnedAt: string;
}

function getStoredUserBadges(userId: string): Badge[] {
  try {
    const stored = localStorage.getItem(USER_BADGES_STORAGE_KEY);
    if (!stored) return [];
    const allBadges: Record<string, StoredBadge[]> = JSON.parse(stored);
    const userBadges = allBadges[userId] || [];
    return userBadges
      .filter(b => b.earned)
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

function hasStoredBadge(userId: string, badgeType: BadgeType): boolean {
  const badges = getStoredUserBadges(userId);
  return badges.some(b => b.badge_type === badgeType);
}

function saveUserBadge(userId: string, badge: Badge): void {
  try {
    const stored = localStorage.getItem(USER_BADGES_STORAGE_KEY);
    const allBadges: Record<string, StoredBadge[]> = stored ? JSON.parse(stored) : {};
    const userBadges = allBadges[userId] || [];

    const existingIndex = userBadges.findIndex(b => b.badge_type === badge.badge_type);
    if (existingIndex >= 0 && userBadges[existingIndex].earned) {
      return;
    }

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

function loadUserBadges(userId: string): Badge[] {
  return getStoredUserBadges(userId);
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const INAPPROPRIATE_KEYWORDS = [
  'porn', 'xxx', 'nude', 'naked', 'sex', 'adult', 'nsfw',
  'hate', 'nazi', 'kkk', 'terrorist',
  'illegal', 'drugs', 'cocaine', 'heroin',
];

function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

interface AppState {
  // User state (managed externally by Supabase now)
  user: User | null;
  preferences: UserPreferences | null;
  streak: Streak | null;
  badges: Badge[];
  bookmarks: Bookmark[];
  userStats: UserStats | null;
  newlyEarnedBadge: BadgeType | null;

  // UI state
  showOnboarding: boolean;
  currentView: string;

  // User actions (NO AUTH - managed by Supabase)
  setUser: (user: User | null) => void;
  loadUserData: (userId: string) => void;
  clearUserData: () => void;
  
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  completeOnboarding: () => void;
  purchaseLifetimeAccess: () => void;
  updateAvatar: (avatarType: AvatarType, avatarIcon?: AvatarIconType) => void;

  // Title actions
  setTitle: (titleId: ProfileTitleType) => void;
  getAvailableTitles: () => ProfileTitleType[];
  getUnlockedSecretTitles: () => ProfileTitleType[];
  clearNewlyUnlockedTitles: () => void;
  checkAndUnlockSecretTitles: () => void;

  // Admin actions
  getAdminStats: () => { totalUsers: number; newUsersThisWeek: number; premiumUsers: number };
  getAppSettings: () => AdminSettings;
  updateAppSettings: (settings: Partial<AdminSettings>) => void;

  // Bookmark actions
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

  // Notification actions
  getNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  getUnreadCount: () => number;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;

  // Prompt Idea actions
  submitPromptIdeaPremium: (title: string, description: string, tags?: string[]) => Promise<{ success: boolean; error?: string }>;
  getAllPromptIdeas: () => PromptIdea[];
  updatePromptIdeaStatus: (ideaId: string, status: 'under_review' | 'approved' | 'rejected', adminNotes?: string) => void;

  // Doodle moderation
  flagDoodle: (doodleId: string, reason: string) => Promise<{ success: boolean; ticketId?: string; error?: string }>;
  getDoodleFlags: (doodleId?: string) => DoodleFlag[];
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

      // User management (replaces auth)
      setUser: (user) => set({ user }),
      
      loadUserData: (userId: string) => {
  const userStats = getOrCreateUserStats(userId);
  const badges = loadUserBadges(userId);
  
  // Initialize default preferences if they don't exist
  const { preferences, user } = get();
  const defaultPreferences: UserPreferences = {
    id: userId,
    user_id: userId,
    push_notifications_enabled: true,
    push_notification_time: '09:00',
    email_notifications_enabled: true,
    theme_mode: 'system',
    has_completed_onboarding: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  set({
    userStats,
    badges,
    preferences: preferences || defaultPreferences,
  });
},

      clearUserData: () => {
        set({
          user: null,
          preferences: null,
          streak: null,
          badges: [],
          bookmarks: [],
          userStats: null,
          newlyEarnedBadge: null,
          showOnboarding: false,
          currentView: 'landing',
        });
      },

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

        setTimeout(() => {
          if (!get().hasBadge('creative_spark')) {
            get().awardBadge('creative_spark');
          }
        }, 300);
      },

      purchaseLifetimeAccess: () => {
        const { user, streak } = get();
        if (!user || user.is_premium) return;

        const now = new Date().toISOString();

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

        setTimeout(() => {
          if (!get().hasBadge('premium_patron')) {
            get().awardBadge('premium_patron');
          }
        }, 300);
      },

      updateAvatar: (avatarType: AvatarType, avatarIcon?: AvatarIconType) => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            avatar_type: avatarType,
            avatar_icon: avatarIcon,
            updated_at: new Date().toISOString(),
          },
        });
      },

      // Title actions
      setTitle: (titleId: ProfileTitleType) => {
        const { user } = get();
        if (!user || (!user.is_premium && !user.is_admin)) return;

        const availableTitles = get().getAvailableTitles();
        if (!availableTitles.includes(titleId)) return;

        set({
          user: {
            ...user,
            current_title: titleId,
            updated_at: new Date().toISOString(),
          },
        });
      },

      getAvailableTitles: () => {
        const { user } = get();
        if (!user || (!user.is_premium && !user.is_admin)) return [];

        const titles: ProfileTitleType[] = [];

        if (user.is_admin) {
          titles.push(ADMIN_TITLE.id);
        }

        DEFAULT_TITLES.forEach(t => titles.push(t.id));

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

        set({
          user: {
            ...user,
            newly_unlocked_titles: [],
            updated_at: new Date().toISOString(),
          },
        });
      },

      checkAndUnlockSecretTitles: () => {
        const { user } = get();
        if (!user || (!user.is_premium && !user.is_admin)) return;

        const doodles = getStoredDoodles();
        const userDoodleCount = doodles.filter(d => d.user_id === user.id).length;

        const currentUnlocked = user.unlocked_titles || [];
        const newlyUnlocked: ProfileTitleType[] = [];

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

      // Admin actions
      getAdminStats: () => {
        // Since we removed the users storage, return mock data
        // In production, this would come from your backend
        return {
          totalUsers: 0,
          newUsersThisWeek: 0,
          premiumUsers: 0,
        };
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

        updateUserStats(user.id, { total_favorites: newBookmarks.length });

        if (newBookmarks.length === 1) {
          get().awardBadge('new_collector');
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

        if (streak.last_viewed_date === today) return;

        let newStreak = streak.current_streak;
        let longestStreak = streak.longest_streak;

        if (shouldResetStreak(streak.last_viewed_date)) {
          newStreak = 1;
        } else if (streak.last_viewed_date && areConsecutiveDays(streak.last_viewed_date, today)) {
          newStreak = streak.current_streak + 1;
        } else if (!streak.last_viewed_date) {
          newStreak = 1;
        } else {
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

        if (newStreak >= 3 && !badges.some(b => b.badge_type === 'creative_ember')) {
  get().awardBadge('creative_ember');
}
if (newStreak >= 7 && !badges.some(b => b.badge_type === 'creative_fire')) {
  get().awardBadge('creative_fire');
}
if (newStreak >= 14 && !badges.some(b => b.badge_type === 'creative_blaze')) {
  get().awardBadge('creative_blaze');
}
if (newStreak >= 30 && !badges.some(b => b.badge_type === 'creative_rocket')) {
  get().awardBadge('creative_rocket');
}
if (newStreak >= 100 && !badges.some(b => b.badge_type === 'creative_supernova')) {
  get().awardBadge('creative_supernova');
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

        if (badges.some(b => b.badge_type === badgeType)) return;
        if (hasStoredBadge(user.id, badgeType)) return;

        const newBadge: Badge = {
          id: generateId(),
          user_id: user.id,
          badge_type: badgeType,
          earned_at: new Date().toISOString(),
        };

        saveUserBadge(user.id, newBadge);

        set({ badges: [...badges, newBadge], newlyEarnedBadge: badgeType });
      },

      hasBadge: (badgeType: BadgeType) => {
        const { user, badges } = get();
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

        if (!user.is_premium) {
          return { success: false, error: 'Doodle upload is a premium feature. Please upgrade to upload doodles.' };
        }

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

        const stats = getOrCreateUserStats(user.id);
        const userDoodles = doodles.filter(d => d.user_id === user.id);
        const totalUploads = userDoodles.length;

        let consecutiveUploadDays = stats.consecutive_upload_days;
        let longestUploadStreak = stats.longest_upload_streak;

        if (stats.last_upload_date === today) {
          // Already uploaded today
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

        if (consecutiveUploadDays >= 7 && !get().hasBadge('daily_doodler')) {
          get().awardBadge('daily_doodler');
        }

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

        const likes = getStoredLikes();
        const doodleLikes = likes.filter(l => l.doodle_id === doodleId);

        if (doodleLikes.length > 0) {
          const ownerStats = getOrCreateUserStats(doodle.user_id);
          const newLikesReceived = Math.max(0, ownerStats.total_likes_received - doodleLikes.length);
          updateUserStats(doodle.user_id, { total_likes_received: newLikesReceived });
        }

        doodleLikes.forEach(like => {
          const likerStats = getOrCreateUserStats(like.user_id);
          const newLikesGiven = Math.max(0, likerStats.total_likes_given - 1);
          updateUserStats(like.user_id, { total_likes_given: newLikesGiven });
        });

        const ownerStats = getOrCreateUserStats(doodle.user_id);
        const remainingUploads = doodles.filter(d => d.user_id === doodle.user_id && d.id !== doodleId).length;
        updateUserStats(doodle.user_id, { total_uploads: remainingUploads });

        const filtered = doodles.filter(d => d.id !== doodleId);
        saveDoodles(filtered);

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

        if (likes.some(l => l.user_id === user.id && l.doodle_id === doodleId)) return;

        const doodle = doodles.find(d => d.id === doodleId);
        if (!doodle) return;

        if (doodle.user_id === user.id) return;

        const newLike: DoodleLike = {
          id: generateId(),
          user_id: user.id,
          doodle_id: doodleId,
          created_at: new Date().toISOString(),
        };

        likes.push(newLike);
        saveLikes(likes);

        const doodleIndex = doodles.findIndex(d => d.id === doodleId);
        doodles[doodleIndex].likes_count += 1;
        saveDoodles(doodles);

        const likerStats = getOrCreateUserStats(user.id);
        const newLikesGiven = likerStats.total_likes_given + 1;
        updateUserStats(user.id, { total_likes_given: newLikesGiven });

        if (newLikesGiven === 1 && !badges.some(b => b.badge_type === 'warm_fuzzies')) {
          get().awardBadge('warm_fuzzies');
        }

        const ownerStats = getOrCreateUserStats(doodle.user_id);
        const newLikesReceived = ownerStats.total_likes_received + 1;
        updateUserStats(doodle.user_id, { total_likes_received: newLikesReceived });
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

        const stats = getOrCreateUserStats(user.id);
        const userShares = shares.filter(s => s.user_id === user.id);
        const totalShares = userShares.length;

        updateUserStats(user.id, { total_shares: totalShares });

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
        notifications.forEach((n: any) => {
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

      // Doodle moderation
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

      getDoodleFlags: (doodleId) => {
        const flags = SupportService.getStoredDoodleFlags();
        if (doodleId) {
          return flags.filter((f: any) => f.doodle_id === doodleId);
        }
        return flags;
      },
    }),
    {
      name: 'dailydoodle-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        preferences: state.preferences,
        streak: state.streak,
        badges: state.badges,
        bookmarks: state.bookmarks,
        userStats: state.userStats,
        showOnboarding: state.showOnboarding,
        currentView: state.currentView,
      }),
    }
  )
);

// Selector hooks
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