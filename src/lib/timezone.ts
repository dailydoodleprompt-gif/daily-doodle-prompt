/**
 * Centralized EST Timezone Utilities
 *
 * All date/time operations in the Daily Doodle app should use these utilities
 * to ensure consistent EST timezone handling across the entire application.
 *
 * The prompt system is tied to US Eastern Time (America/New_York), meaning:
 * - New prompts appear at 00:00 EST/EDT
 * - All date comparisons use EST/EDT
 * - Cache invalidation happens at EST midnight
 */

const EST_TIMEZONE = 'America/New_York';

/**
 * Get the current date in EST timezone as YYYY-MM-DD string.
 * This is the primary function for determining "today's" prompt.
 */
export function getTodayEST(): string {
  return formatDateEST(new Date());
}

/**
 * Format any Date object to YYYY-MM-DD string in EST timezone.
 */
export function formatDateEST(date: Date): string {
  // Use Intl.DateTimeFormat for reliable timezone conversion
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: EST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Get a date offset from today in EST timezone.
 * @param days - Number of days to offset (negative for past, positive for future)
 * @returns YYYY-MM-DD string in EST timezone
 */
export function getDateOffsetEST(days: number): string {
  // Get current time in EST
  const now = new Date();
  const estNow = new Date(now.toLocaleString('en-US', { timeZone: EST_TIMEZONE }));

  // Apply offset
  estNow.setDate(estNow.getDate() + days);

  // Format to YYYY-MM-DD
  const year = estNow.getFullYear();
  const month = String(estNow.getMonth() + 1).padStart(2, '0');
  const day = String(estNow.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get offset from a specific base date string.
 * @param baseDate - Base date in YYYY-MM-DD format
 * @param days - Number of days to offset
 * @returns YYYY-MM-DD string
 */
export function getDateOffsetFromBase(baseDate: string, days: number): string {
  const date = new Date(baseDate + 'T12:00:00'); // Use noon to avoid DST edge cases
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get the current hour in EST timezone (0-23).
 * Useful for cache invalidation timing.
 */
export function getCurrentHourEST(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: EST_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(now), 10);
}

/**
 * Get milliseconds until the next EST midnight.
 * Used for scheduling cache invalidation.
 */
export function getMillisecondsUntilMidnightEST(): number {
  const now = new Date();

  // Get current time in EST
  const estString = now.toLocaleString('en-US', { timeZone: EST_TIMEZONE });
  const estNow = new Date(estString);

  // Calculate midnight EST
  const midnight = new Date(estNow);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  // Calculate difference
  const msUntilMidnight = midnight.getTime() - estNow.getTime();

  // Add a small buffer (5 seconds) to ensure we're past midnight
  return msUntilMidnight + 5000;
}

/**
 * Check if two date strings are consecutive days.
 */
export function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1 + 'T12:00:00');
  const d2 = new Date(date2 + 'T12:00:00');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Check if a streak should be reset (more than 2 days missed).
 */
export function shouldResetStreak(lastViewedDate: string | null): boolean {
  if (!lastViewedDate) return false;

  const today = new Date(getTodayEST() + 'T12:00:00');
  const lastViewed = new Date(lastViewedDate + 'T12:00:00');
  const diffTime = today.getTime() - lastViewed.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 2;
}

/**
 * Get a unique cache key that changes at EST midnight.
 * This ensures all cached data is invalidated when the date changes.
 */
export function getESTDateCacheKey(): string {
  return `est-date-${getTodayEST()}`;
}

/**
 * Parse a date string to get just the date portion.
 * Handles various input formats safely.
 */
export function normalizeDateString(dateStr: string): string {
  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to parse and format
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr; // Return original if parsing fails
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format a prompt date string (YYYY-MM-DD) for display.
 *
 * CRITICAL: This function MUST be used for all prompt date display to avoid
 * timezone bugs. The issue is that `new Date("2025-12-02")` parses as UTC midnight,
 * which can shift to a different day when displayed in local timezone.
 *
 * This function parses the date components directly and creates the formatted
 * string without any timezone conversion.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param options - Formatting options
 * @returns Formatted date string that matches the original date
 */
export function formatPromptDateDisplay(
  dateStr: string,
  options: {
    weekday?: 'long' | 'short';
    month?: 'long' | 'short' | 'numeric';
    day?: 'numeric' | '2-digit';
    year?: 'numeric' | '2-digit';
  } = {}
): string {
  // Parse YYYY-MM-DD directly without timezone conversion
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    // Fallback for non-standard formats
    return dateStr;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
  const day = parseInt(match[3], 10);

  // Create date at noon local time to avoid DST issues
  const date = new Date(year, month, day, 12, 0, 0);

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const parts: string[] = [];

  // Weekday
  if (options.weekday === 'long') {
    parts.push(weekdays[date.getDay()]);
  } else if (options.weekday === 'short') {
    parts.push(shortWeekdays[date.getDay()]);
  }

  // Month
  if (options.month === 'long') {
    parts.push(months[month]);
  } else if (options.month === 'short') {
    parts.push(shortMonths[month]);
  } else if (options.month === 'numeric') {
    parts.push(String(month + 1));
  }

  // Day
  if (options.day === 'numeric') {
    parts.push(String(day));
  } else if (options.day === '2-digit') {
    parts.push(String(day).padStart(2, '0'));
  }

  // Year
  if (options.year === 'numeric') {
    parts.push(String(year));
  } else if (options.year === '2-digit') {
    parts.push(String(year).slice(-2));
  }

  // Build formatted string based on what's included
  if (options.weekday && options.month && options.day && options.year) {
    return `${parts[0]} ${parts[1]} ${parts[2]}, ${parts[3]}`;
  } else if (options.weekday && options.month && options.day) {
    return `${parts[0]} ${parts[1]} ${parts[2]}`;
  } else if (options.month && options.day && options.year) {
    return `${parts[0]} ${parts[1]}, ${parts[2]}`;
  } else if (options.month && options.day) {
    return `${parts[0]} ${parts[1]}`;
  }

  return parts.join(' ');
}

/**
 * Get a formatted display string for "today's" prompt date header.
 * Uses EST timezone to determine "today" and formats consistently.
 */
export function getTodayPromptDateDisplay(): string {
  const today = getTodayEST();
  return formatPromptDateDisplay(today, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date for "Published on" display - includes year.
 */
export function formatPublishedDate(dateStr: string): string {
  return formatPromptDateDisplay(dateStr, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date for compact display (e.g., in feeds).
 */
export function formatShortDate(dateStr: string): string {
  return formatPromptDateDisplay(dateStr, {
    month: 'short',
    day: 'numeric',
  });
}
