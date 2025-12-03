import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import {
  getTodayEST,
  getMillisecondsUntilMidnightEST,
  getESTDateCacheKey,
} from '@/lib/timezone';

// ============================================================================
// Google Sheets CSV Export Types
// ============================================================================

/**
 * Normalized prompt object used by the application
 */
export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publish_date: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse CSV text into an array of Prompt objects
 */
function parseCSV(csvText: string): Prompt[] {
  const lines = csvText.trim().split('\n');

  // Skip header row
  if (lines.length < 2) {
    return [];
  }

  const prompts: Prompt[] = [];

  // Parse each data row (skip header at index 0)
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);

    // Expected columns: id, prompt, description, category, tags
    if (row.length >= 5 && row[0] && row[1]) {
      const [id, prompt, description, category, tags] = row;

      prompts.push({
        id: id.trim(),
        title: prompt.trim() || 'Untitled Prompt',
        description: description?.trim() || '',
        category: category?.trim() || '',
        tags: tags
          ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          : [],
        publish_date: id.trim(), // id is the date in YYYY-MM-DD format
      });
    }
  }

  return prompts;
}

/**
 * Parse a single CSV row, handling quoted fields with commas
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      // Check for escaped quote ("")
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Push the last field
  result.push(current);

  return result;
}

// ============================================================================
// Google Sheets CSV Export URL
// ============================================================================

// Spreadsheet ID: 1tWJQOUhUfENl-xBd-TOQEv0BmaRb5USG
// Sheet GID: 1177623891
const SPREADSHEET_ID = '1tWJQOUhUfENl-xBd-TOQEv0BmaRb5USG';
const SHEET_GID = '1177623891';

/**
 * Generate CSV export URL with cache-busting parameter.
 * The cache buster changes at EST midnight to ensure fresh data.
 */
function getCSVExportURL(): string {
  const baseUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
  // Add cache buster that changes daily at EST midnight
  const cacheBuster = getESTDateCacheKey();
  return `${baseUrl}&_cb=${cacheBuster}`;
}

// ============================================================================
// useOpenSheetPrompts Hook
// ============================================================================

/**
 * Hook to fetch and parse prompt data from Google Sheets CSV export.
 *
 * This hook fetches data directly from the Google Sheets CSV export endpoint,
 * which provides direct CSV data from the spreadsheet.
 * No API key required for publicly shared sheets.
 *
 * @param enabled - Whether the query should run. Defaults to true.
 * @returns TanStack Query result with parsed Prompt array
 *
 * @example
 * ```ts
 * const { data: prompts, isLoading, error } = useOpenSheetPrompts();
 * ```
 */
export function useOpenSheetPrompts(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const lastDateRef = useRef<string>(getTodayEST());
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to invalidate cache and refetch
  const invalidateAndRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['opensheet-prompts'] });
  }, [queryClient]);

  // Set up midnight rollover detection
  useEffect(() => {
    // Schedule cache invalidation at EST midnight
    const scheduleMidnightRefresh = () => {
      const msUntilMidnight = getMillisecondsUntilMidnightEST();

      midnightTimerRef.current = setTimeout(() => {
        // Update the date reference
        lastDateRef.current = getTodayEST();
        // Invalidate cache to force refetch
        invalidateAndRefetch();
        // Schedule the next midnight refresh
        scheduleMidnightRefresh();
      }, msUntilMidnight);
    };

    scheduleMidnightRefresh();

    // Also check for date changes on visibility change (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentDate = getTodayEST();
        if (currentDate !== lastDateRef.current) {
          lastDateRef.current = currentDate;
          invalidateAndRefetch();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (midnightTimerRef.current) {
        clearTimeout(midnightTimerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [invalidateAndRefetch]);

  // Include EST date in query key to ensure cache invalidation at midnight
  const estDate = getTodayEST();

  return useQuery({
    queryKey: ['opensheet-prompts', estDate],
    queryFn: async (): Promise<Prompt[]> => {
      const url = getCSVExportURL();
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();

      if (!csvText || csvText.trim().length === 0) {
        throw new Error('Empty response from Google Sheets');
      }

      // Parse CSV into prompts
      const prompts = parseCSV(csvText);

      if (prompts.length === 0) {
        throw new Error('No valid prompts found in spreadsheet');
      }

      return prompts;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter stale time for fresher data
    gcTime: 10 * 60 * 1000,   // 10 minutes - shorter cache time
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true,   // Refetch when network reconnects
  });
}
