import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Badge Availability Notification Cron Job
 *
 * This endpoint should be called daily by Vercel Cron (or manually for testing).
 * It sends notifications to users about upcoming time-limited badges.
 *
 * Notification Strategy (based on Duolingo/gamification best practices):
 *
 * LEGENDARY (Holiday) Badges - Single day, high urgency:
 * - Day before: "Tomorrow is [holiday]! Upload a doodle to earn the exclusive [badge] badge"
 * - Day of (morning): "Today only! Upload a doodle to earn the [badge] badge before midnight"
 *
 * EPIC (Monthly) Badges - Month-long, lower urgency:
 * - First day: "The Dedicated Doodler challenge for [month] has begun!"
 * - Last week: "One week left to earn the [month] Dedicated Doodler badge!"
 */

// Holiday badge definitions with notification messages
const HOLIDAY_BADGES = [
  {
    type: 'valentines_2026',
    date: '2026-02-14',
    name: "Valentine's Artist '26",
    holiday: "Valentine's Day",
    emoji: '🌹',
  },
  {
    type: 'lucky_creator_2026',
    date: '2026-03-17',
    name: "Lucky Creator '26",
    holiday: "St. Patrick's Day",
    emoji: '🍀',
  },
  {
    type: 'earth_day_2026',
    date: '2026-04-22',
    name: "Earth Artist '26",
    holiday: 'Earth Day',
    emoji: '🌍',
  },
  {
    type: 'independence_2026',
    date: '2026-07-04',
    name: "Independent Artist '26",
    holiday: 'Independence Day',
    emoji: '🎆',
  },
  {
    type: 'spooky_season_2026',
    date: '2026-10-31',
    name: "Spooky Season '26",
    holiday: 'Halloween',
    emoji: '👻',
  },
  {
    type: 'thanksgiving_2026',
    date: '2026-11-26',
    name: "Thankful Artist '26",
    holiday: 'Thanksgiving',
    emoji: '🦃',
  },
  {
    type: 'holiday_spirit_2026',
    date: '2026-12-25',
    name: "Holiday Spirit '26",
    holiday: 'Christmas',
    emoji: '🎁',
  },
  {
    type: 'new_year_spark_2027',
    date: '2027-01-01',
    name: "New Year New Doodle '27",
    holiday: "New Year's Day",
    emoji: '🎉',
  },
];

// Monthly badge definitions
const MONTHLY_BADGES = [
  { type: 'january_champion_2026', month: 'January', year: '2026', startDate: '2026-01-01', endDate: '2026-01-31' },
  { type: 'february_faithful_2026', month: 'February', year: '2026', startDate: '2026-02-01', endDate: '2026-02-28' },
  { type: 'march_maestro_2026', month: 'March', year: '2026', startDate: '2026-03-01', endDate: '2026-03-31' },
  { type: 'april_artist_2026', month: 'April', year: '2026', startDate: '2026-04-01', endDate: '2026-04-30' },
  { type: 'may_maven_2026', month: 'May', year: '2026', startDate: '2026-05-01', endDate: '2026-05-31' },
  { type: 'june_genius_2026', month: 'June', year: '2026', startDate: '2026-06-01', endDate: '2026-06-30' },
  { type: 'july_journeyer_2026', month: 'July', year: '2026', startDate: '2026-07-01', endDate: '2026-07-31' },
  { type: 'august_ace_2026', month: 'August', year: '2026', startDate: '2026-08-01', endDate: '2026-08-31' },
  { type: 'september_star_2026', month: 'September', year: '2026', startDate: '2026-09-01', endDate: '2026-09-30' },
  { type: 'october_original_2026', month: 'October', year: '2026', startDate: '2026-10-01', endDate: '2026-10-31' },
  { type: 'november_notable_2026', month: 'November', year: '2026', startDate: '2026-11-01', endDate: '2026-11-30' },
  { type: 'december_dedicator_2026', month: 'December', year: '2026', startDate: '2026-12-01', endDate: '2026-12-31' },
];

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setDate(date.getDate() + days);
  return getDateString(date);
}

function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00Z');
  const d2 = new Date(dateStr2 + 'T00:00:00Z');
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret or allow in development
  const cronSecret = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
    // Allow manual testing with query param in development
    const testMode = req.query.test === 'true' && process.env.NODE_ENV !== 'production';
    if (!testMode) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[BADGE CRON] Missing Supabase credentials');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Use service role key to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const today = getDateString(new Date());
  const tomorrow = addDays(today, 1);

  console.log(`[BADGE CRON] Running for date: ${today}`);

  const notifications: Array<{
    user_id: string;
    type: 'badge_available';
    title: string;
    body: string;
    link: string;
    metadata: Record<string, unknown>;
  }> = [];

  // Get all active users (who have logged in recently and haven't disabled notifications)
  const { data: activeUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, email_notifications')
    .eq('email_notifications', true);

  if (usersError) {
    console.error('[BADGE CRON] Failed to fetch users:', usersError);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }

  const userIds = activeUsers?.map(u => u.id) || [];
  console.log(`[BADGE CRON] Found ${userIds.length} active users with notifications enabled`);

  if (userIds.length === 0) {
    return res.status(200).json({ message: 'No active users to notify', notifications: 0 });
  }

  // Get badges already earned by these users
  const { data: earnedBadges, error: badgesError } = await supabase
    .from('badges')
    .select('user_id, badge_type')
    .in('user_id', userIds);

  if (badgesError) {
    console.error('[BADGE CRON] Failed to fetch earned badges:', badgesError);
  }

  const userBadgeMap = new Map<string, Set<string>>();
  earnedBadges?.forEach(b => {
    if (!userBadgeMap.has(b.user_id)) {
      userBadgeMap.set(b.user_id, new Set());
    }
    userBadgeMap.get(b.user_id)!.add(b.badge_type);
  });

  // Check for existing badge_available notifications sent today (dedupe)
  const { data: existingNotifications } = await supabase
    .from('notifications')
    .select('user_id, metadata')
    .eq('type', 'badge_available')
    .gte('created_at', today + 'T00:00:00Z')
    .lt('created_at', tomorrow + 'T00:00:00Z');

  const alreadyNotified = new Set<string>();
  existingNotifications?.forEach(n => {
    const badgeType = (n.metadata as any)?.badge_type;
    if (badgeType) {
      alreadyNotified.add(`${n.user_id}:${badgeType}`);
    }
  });

  // === HOLIDAY BADGES ===
  for (const badge of HOLIDAY_BADGES) {
    const daysUntil = daysBetween(today, badge.date);

    // Day before notification (24 hours advance notice)
    if (daysUntil === 1) {
      console.log(`[BADGE CRON] Tomorrow is ${badge.holiday}! Sending day-before notifications`);

      for (const userId of userIds) {
        // Skip if user already earned this badge
        if (userBadgeMap.get(userId)?.has(badge.type)) continue;
        // Skip if already notified today
        if (alreadyNotified.has(`${userId}:${badge.type}`)) continue;

        notifications.push({
          user_id: userId,
          type: 'badge_available',
          title: `${badge.emoji} Special Badge Tomorrow!`,
          body: `Tomorrow is ${badge.holiday}! Upload a doodle to earn the exclusive "${badge.name}" badge.`,
          link: '/prompt',
          metadata: { badge_type: badge.type, notification_timing: 'day_before' },
        });
      }
    }

    // Day of notification (same day reminder)
    if (daysUntil === 0) {
      console.log(`[BADGE CRON] Today is ${badge.holiday}! Sending day-of notifications`);

      for (const userId of userIds) {
        // Skip if user already earned this badge
        if (userBadgeMap.get(userId)?.has(badge.type)) continue;
        // Skip if already notified today
        if (alreadyNotified.has(`${userId}:${badge.type}`)) continue;

        notifications.push({
          user_id: userId,
          type: 'badge_available',
          title: `${badge.emoji} Today Only!`,
          body: `It's ${badge.holiday}! Upload a doodle today to earn the "${badge.name}" badge before midnight.`,
          link: '/prompt',
          metadata: { badge_type: badge.type, notification_timing: 'day_of' },
        });
      }
    }
  }

  // === MONTHLY BADGES ===
  for (const badge of MONTHLY_BADGES) {
    const daysUntilStart = daysBetween(today, badge.startDate);
    const daysUntilEnd = daysBetween(today, badge.endDate);

    // First day of month notification
    if (daysUntilStart === 0) {
      console.log(`[BADGE CRON] ${badge.month} challenge begins! Sending kick-off notifications`);

      for (const userId of userIds) {
        // Skip if user already earned this badge
        if (userBadgeMap.get(userId)?.has(badge.type)) continue;
        // Skip if already notified today
        if (alreadyNotified.has(`${userId}:${badge.type}`)) continue;

        notifications.push({
          user_id: userId,
          type: 'badge_available',
          title: `📅 ${badge.month} Challenge Begins!`,
          body: `The Dedicated Doodler challenge for ${badge.month} has started! Complete 15 doodles this month to earn this epic badge.`,
          link: '/prompt',
          metadata: { badge_type: badge.type, notification_timing: 'month_start' },
        });
      }
    }

    // Last week reminder (7 days left)
    if (daysUntilEnd === 7) {
      console.log(`[BADGE CRON] One week left in ${badge.month}! Sending reminder notifications`);

      for (const userId of userIds) {
        // Skip if user already earned this badge
        if (userBadgeMap.get(userId)?.has(badge.type)) continue;
        // Skip if already notified today
        if (alreadyNotified.has(`${userId}:${badge.type}`)) continue;

        notifications.push({
          user_id: userId,
          type: 'badge_available',
          title: `⏰ One Week Left!`,
          body: `Only 7 days left to earn the ${badge.month} Dedicated Doodler badge! Keep doodling!`,
          link: '/prompt',
          metadata: { badge_type: badge.type, notification_timing: 'week_remaining' },
        });
      }
    }
  }

  // Insert all notifications in batch
  if (notifications.length > 0) {
    console.log(`[BADGE CRON] Inserting ${notifications.length} notifications`);

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('[BADGE CRON] Failed to insert notifications:', insertError);
      return res.status(500).json({ error: 'Failed to insert notifications', details: insertError.message });
    }
  }

  console.log(`[BADGE CRON] Complete. Sent ${notifications.length} notifications.`);

  return res.status(200).json({
    success: true,
    date: today,
    notificationsSent: notifications.length,
    summary: {
      holidayBadges: HOLIDAY_BADGES.filter(b => daysBetween(today, b.date) <= 1 && daysBetween(today, b.date) >= 0).map(b => b.type),
      monthlyBadges: MONTHLY_BADGES.filter(b => {
        const daysUntilStart = daysBetween(today, b.startDate);
        const daysUntilEnd = daysBetween(today, b.endDate);
        return daysUntilStart === 0 || daysUntilEnd === 7;
      }).map(b => b.type),
    },
  });
}
