import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/sdk/core/supabase';
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
  DoodleReport,
  DoodleReportReason,
  DoodleReportStatus,
} from '@/types';
import {
  DEFAULT_TITLES,
  SECRET_TITLES,
  ADMIN_TITLE,
  BADGE_INFO,
  isBadgeAvailable,
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
const DOODLE_REPORTS_STORAGE_KEY = 'dailydoodle_doodle_reports';

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

// Doodle reports storage
function getStoredDoodleReports(): DoodleReport[] {
  try {
    const stored = localStorage.getItem(DOODLE_REPORTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDoodleReports(reports: DoodleReport[]): void {
  localStorage.setItem(DOODLE_REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

function generateId(): string {
  // Generate a proper UUID for Supabase compatibility
  // crypto.randomUUID() is available in all modern browsers
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments (generates UUID v4 format)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Compress image using Canvas API before upload
// Reduces file size by 70-90% while maintaining visual quality
async function compressImage(
  dataUrl: string,
  options: { maxWidth: number; maxHeight: number; quality: number }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      const originalSize = dataUrl.length;

      if (width > options.maxWidth || height > options.maxHeight) {
        const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with JPEG compression (PNG ignores quality parameter)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressionRatio = ((originalSize - blob.size) / originalSize * 100).toFixed(1);
            console.log(`[compressImage] Compressed: ${width}x${height}, ${(blob.size / 1024).toFixed(1)}KB (${compressionRatio}% smaller)`);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/jpeg',
        options.quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = dataUrl;
  });
}

// Convert base64 data URL to Blob for Supabase Storage upload
function base64ToBlob(base64DataUrl: string): { blob: Blob; mimeType: string } {
  // Extract the base64 part and mime type from data URL
  const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 data URL');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Decode base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return {
    blob: new Blob([bytes], { type: mimeType }),
    mimeType,
  };
}

// Upload image to Supabase Storage and return public URL
async function uploadImageToStorage(
  userId: string,
  doodleId: string,
  base64DataUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Compress image before upload (max 1200x1200, 85% quality)
    console.log('[uploadImageToStorage] Compressing image...');
    const compressedBlob = await compressImage(base64DataUrl, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.85,
    });

    const fileName = `${userId}/${doodleId}.jpg`;

    console.log('[uploadImageToStorage] Uploading to Supabase Storage:', fileName, `(${(compressedBlob.size / 1024).toFixed(1)}KB)`);

    const { data, error } = await supabase.storage
      .from('doodles')
      .upload(fileName, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[uploadImageToStorage] Upload failed:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('doodles')
      .getPublicUrl(fileName);

    console.log('[uploadImageToStorage] Upload successful, URL:', urlData.publicUrl);
    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('[uploadImageToStorage] Error:', err);
    return { url: null, error: String(err) };
  }
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
  viewedBadges: BadgeType[];
  bookmarks: Bookmark[];
  userStats: UserStats | null;
  newlyEarnedBadge: BadgeType | null;

  // UI state
  showOnboarding: boolean;
  currentView: string;

  // User actions (NO AUTH - managed by Supabase)
  setUser: (user: User | null) => void;
  loadUserData: (userId: string) => Promise<void>;
  clearUserData: () => void;
  
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  completeOnboarding: () => void;
  purchaseLifetimeAccess: () => void;
  updateAvatar: (avatarType: AvatarType, avatarIcon?: AvatarIconType) => Promise<void>;

  // Title actions
  setTitle: (titleId: ProfileTitleType | null) => Promise<void>;
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
  markBadgeAsViewed: (badgeType: BadgeType) => Promise<void>;
  setViewedBadges: (badges: BadgeType[]) => void; 

  // Doodle actions
  uploadDoodle: (promptId: string, promptTitle: string, imageData: string, caption: string, isPublic: boolean) => Promise<{ success: boolean; error?: string; imageUrl?: string }>;
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

  // Doodle reporting (new system)
  submitDoodleReport: (doodleId: string, reason: DoodleReportReason, details?: string) => Promise<{ success: boolean; error?: string }>;
  getDoodleReports: (status?: DoodleReportStatus) => DoodleReport[];
  updateReportStatus: (reportId: string, status: DoodleReportStatus, resolutionNotes?: string) => Promise<{ success: boolean; error?: string }>;
}

// Track hydration state outside the store
let hasHydrated = false;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      preferences: null,
      streak: null,
      badges: [],
      viewedBadges: [],
      bookmarks: [],
      userStats: null,
      newlyEarnedBadge: null,
      showOnboarding: false,
      currentView: 'landing',

      // User management (replaces auth)
      setUser: (user) => set({ user }),
      
      loadUserData: async (userId: string) => {
        const userStats = getOrCreateUserStats(userId);
        const { user } = get();

        // BADGES: Supabase is source of truth, localStorage is cache
        let badges: Badge[] = [];
        try {
          console.log('[loadUserData] Fetching badges from Supabase for user:', userId);
          const { data: supabaseBadges, error } = await supabase
            .from('badges')
            .select('*')
            .eq('user_id', userId);

          if (error) {
            console.error('[loadUserData] Failed to fetch badges from Supabase:', error);
            // Fall back to localStorage cache
            badges = loadUserBadges(userId);
            console.log('[loadUserData] Using localStorage cache, found', badges.length, 'badges');
          } else {
            // Supabase is authoritative - use these badges
            badges = (supabaseBadges || []).map(b => ({
              id: b.id || generateId(),
              user_id: b.user_id,
              badge_type: b.badge_type as BadgeType,
              earned_at: b.earned_at,
            }));
            console.log('[loadUserData] Loaded', badges.length, 'badges from Supabase');

            // Also check localStorage for any badges that haven't been synced yet
            const localBadges = loadUserBadges(userId);
            const supabaseBadgeTypes = new Set(badges.map(b => b.badge_type));
            const unsyncedBadges = localBadges.filter(b => !supabaseBadgeTypes.has(b.badge_type));

            if (unsyncedBadges.length > 0) {
              console.log('[loadUserData] Found', unsyncedBadges.length, 'unsynced local badges, syncing to Supabase');
              // Sync unsynced badges to Supabase
              for (const badge of unsyncedBadges) {
                try {
                  await supabase.from('badges').insert({
                    user_id: badge.user_id,
                    badge_type: badge.badge_type,
                    earned_at: badge.earned_at,
                  });
                  badges.push(badge);
                } catch (syncErr) {
                  console.error('[loadUserData] Failed to sync badge:', syncErr);
                }
              }
            }

            // Update localStorage cache with authoritative Supabase data
            const storageKey = `badges_${userId}`;
            try {
              localStorage.setItem(storageKey, JSON.stringify(badges));
            } catch (e) {
              console.error('[loadUserData] Failed to cache badges to localStorage:', e);
            }
          }
        } catch (err) {
          console.error('[loadUserData] Error fetching badges:', err);
          badges = loadUserBadges(userId);
        }

        // Initialize default preferences if they don't exist
        const { preferences } = get();
        const defaultPreferences: UserPreferences = {
          id: userId,
          user_id: userId,
          push_notifications_enabled: true,
          push_notification_time: '09:00',
          email_notifications_enabled: true,
          theme_mode: 'system',
          blur_doodles: false,
          has_completed_onboarding: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // STREAK: Supabase is source of truth
        const defaultStreak: Streak = {
          id: userId,
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_viewed_date: null,
          streak_freeze_available: true,
          streak_freeze_used_this_month: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        let loadedStreak: Streak = defaultStreak;
        try {
          console.log('[loadUserData] Fetching streak from Supabase for user:', userId);
          const { data: supabaseStreak, error } = await supabase
            .from('streaks')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('[loadUserData] Failed to fetch streak from Supabase:', error);
          } else if (supabaseStreak) {
            loadedStreak = {
              id: supabaseStreak.id,
              user_id: supabaseStreak.user_id,
              current_streak: supabaseStreak.current_streak,
              longest_streak: supabaseStreak.longest_streak,
              last_viewed_date: supabaseStreak.last_viewed_date,
              streak_freeze_available: supabaseStreak.streak_freeze_available,
              streak_freeze_used_this_month: supabaseStreak.streak_freeze_used_this_month,
              created_at: supabaseStreak.created_at,
              updated_at: supabaseStreak.updated_at,
            };
            console.log('[loadUserData] Loaded streak from Supabase:', loadedStreak.current_streak);
          } else {
            console.log('[loadUserData] No streak found in Supabase, using default');
          }
        } catch (err) {
          console.error('[loadUserData] Error fetching streak:', err);
        }

        // FOLLOWS: Supabase is source of truth
        try {
          console.log('[loadUserData] Fetching follows from Supabase for user:', userId);
          const { data: supabaseFollows, error } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', userId);

          if (error) {
            console.error('[loadUserData] Failed to fetch follows from Supabase:', error);
          } else if (supabaseFollows && supabaseFollows.length > 0) {
            // Get current localStorage follows
            const localFollows = getStoredFollows();

            // Merge: keep local follows for other users, replace current user's follows with Supabase data
            const otherUsersFollows = localFollows.filter(f => f.follower_id !== userId);
            const supabaseFollowsMapped: Follow[] = supabaseFollows.map(f => ({
              id: f.id,
              follower_id: f.follower_id,
              following_id: f.following_id,
              created_at: f.created_at,
            }));

            // Update localStorage with merged data
            const mergedFollows = [...otherUsersFollows, ...supabaseFollowsMapped];
            saveFollows(mergedFollows);
            console.log('[loadUserData] Loaded', supabaseFollowsMapped.length, 'follows from Supabase');
          } else {
            console.log('[loadUserData] No follows found in Supabase');
          }
        } catch (err) {
          console.error('[loadUserData] Error fetching follows:', err);
        }

        // DOODLES: Supabase is source of truth
        // Fetch BOTH: user's own doodles AND all public doodles from other users
        try {
          console.log('[loadUserData] 🔍 Fetching doodles from Supabase...');

          // Query 1: Get current user's doodles (public + private)
          const { data: userDoodles, error: userError } = await supabase
            .from('doodles')
            .select('*')
            .eq('user_id', userId);

          // Query 2: Get ALL public doodles (for gallery/social features)
          const { data: publicDoodles, error: publicError } = await supabase
            .from('doodles')
            .select('*')
            .eq('is_public', true);

          console.log('[loadUserData] Doodles query results:', {
            userDoodles: { count: userDoodles?.length, error: userError?.message },
            publicDoodles: { count: publicDoodles?.length, error: publicError?.message }
          });

          if (userError) {
            console.error('[loadUserData] ❌ Failed to fetch user doodles:', userError.message);
          }
          if (publicError) {
            console.error('[loadUserData] ❌ Failed to fetch public doodles:', publicError.message);
          }

          // Merge doodles: user's own + public from others (deduplicated)
          const allDoodles = new Map<string, Doodle>();

          const mapDoodle = (d: any): Doodle => ({
            id: d.id,
            user_id: d.user_id,
            user_username: d.user_username,
            user_avatar_type: d.user_avatar_type,
            user_avatar_icon: d.user_avatar_icon,
            prompt_id: d.prompt_id,
            prompt_title: d.prompt_title,
            image_url: d.image_url,
            caption: d.caption || '',
            is_public: d.is_public,
            likes_count: d.likes_count,
            created_at: d.created_at,
          });

          // Add user's own doodles first
          if (userDoodles) {
            userDoodles.forEach(d => allDoodles.set(d.id, mapDoodle(d)));
          }

          // Add public doodles (won't overwrite user's own due to Map)
          if (publicDoodles) {
            publicDoodles.forEach(d => {
              if (!allDoodles.has(d.id)) {
                allDoodles.set(d.id, mapDoodle(d));
              }
            });
          }

          const mergedDoodles = Array.from(allDoodles.values());
          saveDoodles(mergedDoodles);
          console.log('[loadUserData] ✅ Loaded', mergedDoodles.length, 'total doodles (user:', userDoodles?.length || 0, ', public from others:', (publicDoodles?.length || 0) - (userDoodles?.filter(d => d.is_public).length || 0), ')');
        } catch (err) {
          console.error('[loadUserData] Error fetching doodles:', err);
        }

        set({
          userStats,
          badges,
          preferences: preferences || defaultPreferences,
          streak: loadedStreak,
        });

        // Auto-award missing badges after state is set
        setTimeout(() => {
          const { awardBadge, hasBadge } = get();

          // Award creative_spark to all users who don't have it
          if (!hasBadge('creative_spark')) {
            console.log('[loadUserData] Auto-awarding creative_spark badge');
            awardBadge('creative_spark');
          }

          // Award premium_patron to premium users who don't have it
          if (user?.is_premium && !hasBadge('premium_patron')) {
            console.log('[loadUserData] Auto-awarding premium_patron badge');
            awardBadge('premium_patron');
          }
        }, 100);
      },

      clearUserData: () => {
        console.log('[AppStore] Clearing all user data...');

        // Clear Zustand state
        set({
          user: null,
          preferences: null,
          streak: null,
          badges: [],
          viewedBadges: [],
          bookmarks: [],
          userStats: null,
          newlyEarnedBadge: null,
          showOnboarding: false,
          currentView: 'landing',
        });

        // NUCLEAR: Clear all localStorage to prevent stale state
        try {
          // Clear the Zustand persisted store
          localStorage.removeItem('dailydoodle-app-store');

          // Clear all app-specific localStorage items
          localStorage.removeItem(DOODLES_STORAGE_KEY);
          localStorage.removeItem(LIKES_STORAGE_KEY);
          localStorage.removeItem(FOLLOWS_STORAGE_KEY);
          localStorage.removeItem(SHARES_STORAGE_KEY);
          localStorage.removeItem(USER_STATS_STORAGE_KEY);
          localStorage.removeItem(USER_BADGES_STORAGE_KEY);
          localStorage.removeItem(DOODLE_REPORTS_STORAGE_KEY);
          // Note: Keep ADMIN_SETTINGS_STORAGE_KEY as it's not user-specific

          // Clear any Supabase auth tokens that might be lingering
          // Supabase stores tokens with a key pattern like 'sb-<project-ref>-auth-token'
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') && key.includes('-auth-token')) {
              console.log('[AppStore] Removing Supabase token:', key);
              localStorage.removeItem(key);
            }
          });

          console.log('[AppStore] All user data cleared from localStorage');
        } catch (err) {
          console.error('[AppStore] Error clearing localStorage:', err);
        }

        // Reset hydration flag so app knows to re-check
        hasHydrated = false;

        console.log('[AppStore] User data clear complete');
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

      updateAvatar: async (avatarType: AvatarType, avatarIcon?: AvatarIconType) => {
  console.log('[updateAvatar] Called with:', { avatarType, avatarIcon });

  const { user } = get();
  if (!user) {
    console.error('[updateAvatar] No user in store - aborting');
    return;
  }
  console.log('[updateAvatar] Current user:', { id: user.id, username: user.username });

  const now = new Date().toISOString();

  // Update local state immediately (optimistic update)
  set({
    user: {
      ...user,
      avatar_type: avatarType,
      avatar_icon: avatarIcon,
      updated_at: now,
    },
  });
  console.log('[updateAvatar] Local state updated optimistically');

  // Save to Supabase
  try {
    console.log('[updateAvatar] Getting Supabase session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[updateAvatar] Session error:', sessionError);
      return;
    }

    if (!session?.access_token) {
      console.error('[updateAvatar] No session or access token - user may not be authenticated');
      console.log('[updateAvatar] Session data:', session);
      return;
    }
    console.log('[updateAvatar] Got session, token length:', session.access_token.length);

    const payload = {
      avatar_type: avatarType,
      avatar_icon: avatarIcon,
    };
    console.log('[updateAvatar] Sending PATCH to /api/me with payload:', payload);

    const response = await fetch('/api/me', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => null);
    console.log('[updateAvatar] API response:', {
      status: response.status,
      ok: response.ok,
      data: responseData
    });

    if (!response.ok) {
      console.error('[updateAvatar] Failed to save avatar to Supabase:', responseData);
    } else {
      console.log('[updateAvatar] Successfully saved avatar to Supabase');
    }
  } catch (error) {
    console.error('[updateAvatar] Error saving avatar:', error);
  }
},

      // Title actions
      setTitle: async (titleId: ProfileTitleType | null) => {
  console.log('[setTitle] Called with:', { titleId });

  const { user } = get();
  if (!user) {
    console.error('[setTitle] No user in store - aborting');
    return;
  }
  if (!user.is_premium && !user.is_admin) {
    console.error('[setTitle] User is not premium or admin - aborting', {
      is_premium: user.is_premium,
      is_admin: user.is_admin
    });
    return;
  }
  console.log('[setTitle] Current user:', { id: user.id, username: user.username, is_premium: user.is_premium, is_admin: user.is_admin });

  // Allow null to clear the title
  if (titleId !== null) {
    const availableTitles = get().getAvailableTitles();
    console.log('[setTitle] Available titles:', availableTitles);

    if (!availableTitles.includes(titleId)) {
      console.error('[setTitle] Title not in available titles - aborting:', titleId);
      return;
    }
  }

  const now = new Date().toISOString();

  // Update local state immediately (optimistic update)
  set({
    user: {
      ...user,
      current_title: titleId,
      updated_at: now,
    },
  });
  console.log('[setTitle] Local state updated optimistically');

  // Save to Supabase
  try {
    console.log('[setTitle] Getting Supabase session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[setTitle] Session error:', sessionError);
      return;
    }

    if (!session?.access_token) {
      console.error('[setTitle] No session or access token - user may not be authenticated');
      console.log('[setTitle] Session data:', session);
      return;
    }
    console.log('[setTitle] Got session, token length:', session.access_token.length);

    const payload = { current_title: titleId };
    console.log('[setTitle] Sending PATCH to /api/me with payload:', payload);

    const response = await fetch('/api/me', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => null);
    console.log('[setTitle] API response:', {
      status: response.status,
      ok: response.ok,
      data: responseData
    });

    if (!response.ok) {
      console.error('[setTitle] Failed to save title to Supabase:', responseData);
    } else {
      console.log('[setTitle] Successfully saved title to Supabase');
    }
  } catch (error) {
    console.error('[setTitle] Error saving title:', error);
  }
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
        if (!user) return;

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

        const updatedStreak = {
          ...streak,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_viewed_date: today,
          updated_at: new Date().toISOString(),
        };

        set({ streak: updatedStreak });

        // Sync streak to Supabase (fire-and-forget)
        (async () => {
          try {
            const { error } = await supabase
              .from('streaks')
              .upsert({
                user_id: user.id,
                current_streak: newStreak,
                longest_streak: longestStreak,
                last_viewed_date: today,
                updated_at: updatedStreak.updated_at,
              }, { onConflict: 'user_id' });
            if (error) {
              console.error('[recordPromptView] Failed to sync streak to Supabase:', error);
            } else {
              console.log('[recordPromptView] Streak synced to Supabase:', newStreak);
            }
          } catch (err) {
            console.error('[recordPromptView] Error syncing streak:', err);
          }
        })();

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

        // Sync to Supabase badges table
        (async () => {
          try {
            const { error } = await supabase.from('badges').insert({
              user_id: user.id,
              badge_type: badgeType,
              earned_at: newBadge.earned_at,
            });
            if (error) {
              console.error('[awardBadge] Failed to sync badge to Supabase:', error);
            } else {
              console.log('[awardBadge] Badge synced to Supabase:', badgeType);
            }
          } catch (err) {
            console.error('[awardBadge] Error syncing badge:', err);
          }
        })();

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

      setViewedBadges: (badges: BadgeType[]) => {
        set({ viewedBadges: badges });
      },

      markBadgeAsViewed: async (badgeType: BadgeType) => {
  const { viewedBadges } = get();
  if (viewedBadges.includes(badgeType)) return;

  const newViewedBadges = [...viewedBadges, badgeType];
  set({ viewedBadges: newViewedBadges });

  // Sync to Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await fetch('/api/me', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ viewed_badges: newViewedBadges }),
    });
  } catch (error) {
    console.error('[markBadgeAsViewed] Failed to sync to Supabase:', error);
  }
},

      // Doodle actions
      uploadDoodle: async (promptId: string, promptTitle: string, imageData: string, caption: string, isPublic: boolean) => {
        console.log('[uploadDoodle] Starting upload...');
        try {
        const { user } = get();
        console.log('[uploadDoodle] User check:', { hasUser: !!user, isPremium: user?.is_premium });
        if (!user) return { success: false, error: 'Not logged in' };

        if (!user.is_premium) {
          return { success: false, error: 'Doodle upload is a premium feature. Please upgrade to upload doodles.' };
        }

        console.log('[uploadDoodle] Checking content...');
        if (containsInappropriateContent(caption)) {
          return { success: false, error: 'Your caption contains inappropriate content. Please revise and try again.' };
        }

        const doodleId = generateId();
        const now = new Date().toISOString();
        const today = getTodayEST();

        // Upload image to Supabase Storage first
        console.log('[uploadDoodle] Uploading image to Supabase Storage...');
        const { url: storageUrl, error: storageError } = await uploadImageToStorage(
          user.id,
          doodleId,
          imageData
        );

        if (storageError || !storageUrl) {
          console.error('[uploadDoodle] Storage upload failed:', storageError);
          return { success: false, error: `Failed to upload image: ${storageError || 'Unknown error'}` };
        }

        console.log('[uploadDoodle] Image uploaded successfully:', storageUrl);

        const newDoodle: Doodle = {
          id: doodleId,
          user_id: user.id,
          user_username: user.username,
          user_avatar_type: user.avatar_type,
          user_avatar_icon: user.avatar_icon,
          prompt_id: promptId,
          prompt_title: promptTitle,
          image_url: storageUrl, // Use Supabase Storage URL, not base64
          caption,
          is_public: isPublic,
          likes_count: 0,
          created_at: now,
        };

        // Save to Supabase database first (source of truth)
        const insertData = {
          id: newDoodle.id,
          user_id: newDoodle.user_id,
          user_username: newDoodle.user_username,
          user_avatar_type: newDoodle.user_avatar_type,
          user_avatar_icon: newDoodle.user_avatar_icon,
          prompt_id: newDoodle.prompt_id,
          prompt_title: newDoodle.prompt_title,
          image_url: newDoodle.image_url,
          caption: newDoodle.caption,
          is_public: newDoodle.is_public,
          likes_count: newDoodle.likes_count,
          created_at: newDoodle.created_at,
        };
        console.log('[uploadDoodle] Inserting into doodles table:', JSON.stringify(insertData, null, 2));

        const { data: insertedData, error: dbError } = await supabase.from('doodles').insert(insertData).select();

        if (dbError) {
          console.error('[uploadDoodle] ❌ Database insert FAILED:', dbError.message, dbError.code, dbError.details);
        } else {
          console.log('[uploadDoodle] ✅ Doodle saved to Supabase database! Returned:', insertedData);
        }

        // Also save to localStorage as cache
        console.log('[uploadDoodle] Caching to localStorage...');
        const doodles = getStoredDoodles();
        doodles.push(newDoodle);
        saveDoodles(doodles);

        console.log('[uploadDoodle] Updating stats...');
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

        console.log('[uploadDoodle] Awarding badges...');
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

        // Check for seasonal badges (holiday badges - upload on specific day)
        console.log('[uploadDoodle] Checking seasonal badges...');
        const seasonalHolidayBadges: BadgeType[] = [
          'valentines_2026',
          'lucky_creator_2026',
          'earth_day_2026',
          'independence_2026',
          'spooky_season_2026',
          'thanksgiving_2026',
          'holiday_spirit_2026',
          'new_year_spark_2027',
        ];

        for (const badgeType of seasonalHolidayBadges) {
          if (isBadgeAvailable(badgeType) && !get().hasBadge(badgeType)) {
            console.log(`[uploadDoodle] Awarding holiday badge: ${badgeType}`);
            get().awardBadge(badgeType);
          }
        }

        // Check for monthly challenge badges (15 uploads in the month)
        const monthlyBadges: { month: number; year: number; badge: BadgeType }[] = [
          { month: 1, year: 2026, badge: 'january_champion_2026' },
          { month: 2, year: 2026, badge: 'february_faithful_2026' },
          { month: 3, year: 2026, badge: 'march_maestro_2026' },
          { month: 4, year: 2026, badge: 'april_artist_2026' },
          { month: 5, year: 2026, badge: 'may_maven_2026' },
          { month: 6, year: 2026, badge: 'june_genius_2026' },
          { month: 7, year: 2026, badge: 'july_journeyer_2026' },
          { month: 8, year: 2026, badge: 'august_ace_2026' },
          { month: 9, year: 2026, badge: 'september_star_2026' },
          { month: 10, year: 2026, badge: 'october_original_2026' },
          { month: 11, year: 2026, badge: 'november_notable_2026' },
          { month: 12, year: 2026, badge: 'december_dedicator_2026' },
        ];

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-indexed
        const currentYear = currentDate.getFullYear();

        const monthlyBadge = monthlyBadges.find(
          (mb) => mb.month === currentMonth && mb.year === currentYear
        );

        if (monthlyBadge && !get().hasBadge(monthlyBadge.badge)) {
          // Count doodles uploaded this month
          const monthStart = new Date(currentYear, currentMonth - 1, 1);
          const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

          const monthlyDoodles = userDoodles.filter((d) => {
            const doodleDate = new Date(d.created_at);
            return doodleDate >= monthStart && doodleDate <= monthEnd;
          });

          if (monthlyDoodles.length >= 15) {
            console.log(`[uploadDoodle] Awarding monthly badge: ${monthlyBadge.badge} (${monthlyDoodles.length} doodles this month)`);
            get().awardBadge(monthlyBadge.badge);
          }
        }

        console.log('[uploadDoodle] Checking secret titles...');
        get().checkAndUnlockSecretTitles();

        console.log('[uploadDoodle] SUCCESS!');
        return { success: true, imageUrl: storageUrl };
        } catch (err) {
          console.error('[uploadDoodle] CAUGHT ERROR:', err);
          return { success: false, error: String(err) };
        }
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
        console.log('[deleteDoodle] Starting delete for doodle:', doodleId);

        const { user } = get();
        if (!user) {
          console.error('[deleteDoodle] No user logged in');
          return;
        }

        const doodles = getStoredDoodles();
        const doodle = doodles.find(d => d.id === doodleId);

        if (!doodle) {
          console.error('[deleteDoodle] Doodle not found:', doodleId);
          return;
        }

        // Check permissions: owner OR admin can delete
        const isOwner = doodle.user_id === user.id;
        const isAdmin = user.is_admin === true;

        if (!isOwner && !isAdmin) {
          console.error('[deleteDoodle] User is not owner or admin, cannot delete');
          return;
        }

        console.log('[deleteDoodle] Permission check passed:', { isOwner, isAdmin, doodleUserId: doodle.user_id });

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
        console.log('[deleteDoodle] Removed from local storage');

        const filteredLikes = likes.filter(l => l.doodle_id !== doodleId);
        saveLikes(filteredLikes);

        // Sync delete to Supabase
        (async () => {
          try {
            // Delete from database - admin can delete any, owner can delete their own
            let query = supabase
              .from('doodles')
              .delete()
              .eq('id', doodleId);

            // Only add user_id filter for non-admins (owners)
            if (!isAdmin) {
              query = query.eq('user_id', user.id);
            }

            const { error, count } = await query;

            if (error) {
              console.error('[deleteDoodle] ❌ Failed to delete from database:', error.message, error.code);
            } else {
              console.log('[deleteDoodle] ✅ Deleted from database');
            }

            // Also delete image from storage if it's a Supabase Storage URL
            if (doodle.image_url && doodle.image_url.includes('supabase')) {
              // Extract the file path from the URL
              // URL format: https://xxx.supabase.co/storage/v1/object/public/doodles/userId/doodleId.jpg
              let filePath = '';

              // Try to extract path after /doodles/
              const doodlesMatch = doodle.image_url.match(/\/doodles\/(.+?)(?:\?|$)/);
              if (doodlesMatch && doodlesMatch[1]) {
                filePath = decodeURIComponent(doodlesMatch[1]);
              }

              if (filePath) {
                console.log('[deleteDoodle] Deleting from storage:', filePath);
                const { error: storageError } = await supabase.storage
                  .from('doodles')
                  .remove([filePath]);
                if (storageError) {
                  console.error('[deleteDoodle] ❌ Failed to delete from storage:', storageError.message);
                } else {
                  console.log('[deleteDoodle] ✅ Deleted from storage');
                }
              } else {
                console.warn('[deleteDoodle] Could not extract file path from URL:', doodle.image_url);
              }
            }
          } catch (err) {
            console.error('[deleteDoodle] Error syncing delete:', err);
          }
        })();
      },

      toggleDoodleVisibility: (doodleId: string) => {
        const { user } = get();
        if (!user) return;

        const doodles = getStoredDoodles();
        const doodleIndex = doodles.findIndex(d => d.id === doodleId);

        if (doodleIndex === -1 || doodles[doodleIndex].user_id !== user.id) return;

        const newVisibility = !doodles[doodleIndex].is_public;
        doodles[doodleIndex].is_public = newVisibility;
        saveDoodles(doodles);

        // Sync visibility change to Supabase (fire-and-forget)
        (async () => {
          try {
            const { error } = await supabase
              .from('doodles')
              .update({ is_public: newVisibility })
              .eq('id', doodleId)
              .eq('user_id', user.id);
            if (error) {
              console.error('[toggleDoodleVisibility] Failed to sync to Supabase:', error);
            } else {
              console.log('[toggleDoodleVisibility] Visibility synced to Supabase');
            }
          } catch (err) {
            console.error('[toggleDoodleVisibility] Error syncing:', err);
          }
        })();
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

        // Award 'somebody_likes_me' badge to doodle owner on first like received
        if (newLikesReceived === 1) {
          // Check if owner already has the badge
          const ownerBadges = loadUserBadges(doodle.user_id);
          if (!ownerBadges.some(b => b.badge_type === 'somebody_likes_me')) {
            console.log('[likeDoodle] Awarding somebody_likes_me to doodle owner:', doodle.user_id);
            const newBadge: Badge = {
              id: generateId(),
              user_id: doodle.user_id,
              badge_type: 'somebody_likes_me',
              earned_at: new Date().toISOString(),
            };
            saveUserBadge(doodle.user_id, newBadge);

            // Note: Cannot sync cross-user badges to Supabase due to RLS policy.
            // Badge is saved locally and will be available when the owner logs in.
            // The owner can sync their own badges if needed.
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

        // Sync to Supabase (fire-and-forget)
        (async () => {
          try {
            const { error } = await supabase.from('follows').insert({
              follower_id: user.id,
              following_id: userId,
              created_at: newFollow.created_at,
            });
            if (error) {
              console.error('[followUser] Failed to sync follow to Supabase:', error);
            } else {
              console.log('[followUser] Follow synced to Supabase');
            }
          } catch (err) {
            console.error('[followUser] Error syncing follow:', err);
          }
        })();
      },

      unfollowUser: (userId: string) => {
        const { user } = get();
        if (!user) return;

        const follows = getStoredFollows();
        const filtered = follows.filter(
          f => !(f.follower_id === user.id && f.following_id === userId)
        );
        saveFollows(filtered);

        // Sync to Supabase (fire-and-forget)
        (async () => {
          try {
            const { error } = await supabase
              .from('follows')
              .delete()
              .eq('follower_id', user.id)
              .eq('following_id', userId);
            if (error) {
              console.error('[unfollowUser] Failed to sync unfollow to Supabase:', error);
            } else {
              console.log('[unfollowUser] Unfollow synced to Supabase');
            }
          } catch (err) {
            console.error('[unfollowUser] Error syncing unfollow:', err);
          }
        })();
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
          .filter(d => {
            // Include user's own doodles (public or private)
            if (d.user_id === user.id) return true;
            // Include public doodles from followed users
            return d.is_public && following.includes(d.user_id);
          })
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

      // Doodle reporting (new system)
      submitDoodleReport: async (doodleId, reason, details) => {
        const { user } = get();
        if (!user) {
          return { success: false, error: 'Must be logged in to report content' };
        }

        // Check if user has already reported this doodle
        const existingReports = getStoredDoodleReports();
        const alreadyReported = existingReports.some(
          r => r.doodle_id === doodleId && r.reporter_id === user.id && r.status === 'pending'
        );
        if (alreadyReported) {
          return { success: false, error: 'You have already reported this doodle' };
        }

        // Get doodle info for the report
        const doodles = getStoredDoodles();
        const doodle = doodles.find(d => d.id === doodleId);
        if (!doodle) {
          return { success: false, error: 'Doodle not found' };
        }

        // Cannot report your own doodle
        if (doodle.user_id === user.id) {
          return { success: false, error: 'You cannot report your own doodle' };
        }

        const newReport: DoodleReport = {
          id: generateId(),
          doodle_id: doodleId,
          reporter_id: user.id,
          reason,
          details: details || null,
          status: 'pending',
          created_at: new Date().toISOString(),
          reporter_username: user.username,
          doodle: doodle,
        };

        existingReports.push(newReport);
        saveDoodleReports(existingReports);

        // Also sync to Supabase (fire-and-forget)
        (async () => {
          try {
            const { error } = await supabase.from('doodle_reports').insert({
              id: newReport.id,
              doodle_id: newReport.doodle_id,
              reporter_id: newReport.reporter_id,
              reason: newReport.reason,
              details: newReport.details,
              status: newReport.status,
              created_at: newReport.created_at,
            });
            if (error) {
              console.error('[submitDoodleReport] Failed to sync to Supabase:', error);
            } else {
              console.log('[submitDoodleReport] Report synced to Supabase');
            }
          } catch (err) {
            console.error('[submitDoodleReport] Error syncing report:', err);
          }
        })();

        return { success: true };
      },

      getDoodleReports: (status) => {
        const { user } = get();
        if (!user?.is_admin) return [];

        const reports = getStoredDoodleReports();

        // Enrich reports with doodle data
        const doodles = getStoredDoodles();
        const enrichedReports = reports.map(report => ({
          ...report,
          doodle: doodles.find(d => d.id === report.doodle_id),
        }));

        if (status) {
          return enrichedReports.filter(r => r.status === status);
        }
        return enrichedReports;
      },

      updateReportStatus: async (reportId, status, resolutionNotes) => {
        const { user } = get();
        if (!user?.is_admin) {
          return { success: false, error: 'Admin access required' };
        }

        const reports = getStoredDoodleReports();
        const reportIndex = reports.findIndex(r => r.id === reportId);
        if (reportIndex === -1) {
          return { success: false, error: 'Report not found' };
        }

        reports[reportIndex] = {
          ...reports[reportIndex],
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          resolution_notes: resolutionNotes || null,
        };

        saveDoodleReports(reports);

        // Sync to Supabase (fire-and-forget)
        (async () => {
          try {
            const { error } = await supabase
              .from('doodle_reports')
              .update({
                status,
                reviewed_at: reports[reportIndex].reviewed_at,
                reviewed_by: user.id,
                resolution_notes: resolutionNotes || null,
              })
              .eq('id', reportId);
            if (error) {
              console.error('[updateReportStatus] Failed to sync to Supabase:', error);
            } else {
              console.log('[updateReportStatus] Status update synced to Supabase');
            }
          } catch (err) {
            console.error('[updateReportStatus] Error syncing status:', err);
          }
        })();

        return { success: true };
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
        viewedBadges: state.viewedBadges,
        bookmarks: state.bookmarks,
        userStats: state.userStats,
        showOnboarding: state.showOnboarding,
        currentView: state.currentView,
      }),
      onRehydrateStorage: () => {
        console.log('[AppStore] Starting hydration...');
        return (state, error) => {
          if (error) {
            console.error('[AppStore] Hydration error:', error);
          } else {
            console.log('[AppStore] Hydration complete, user:', state?.user?.email || 'null');
          }
          hasHydrated = true;
        };
      },
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

// Hydration hook - use this to wait for store rehydration before rendering
export const useHasHydrated = () => {
  const [hydrated, setHydrated] = useState(hasHydrated);

  useEffect(() => {
    // If already hydrated, we're done
    if (hasHydrated) {
      setHydrated(true);
      return;
    }

    // Otherwise, check periodically until hydrated (max 5 seconds)
    const checkInterval = setInterval(() => {
      if (hasHydrated) {
        setHydrated(true);
        clearInterval(checkInterval);
      }
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      console.warn('[AppStore] Hydration timeout - proceeding anyway');
      setHydrated(true);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  return hydrated;
};