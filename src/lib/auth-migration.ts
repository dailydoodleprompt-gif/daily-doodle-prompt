/**
 * One-time migration to clean up old auth sessions
 * This runs on app initialization to remove conflicting auth data
 */

export function migrateToSupabaseAuth(): void {
  console.log('[Auth Migration] Starting cleanup...');

  const keysToRemove = [
    // Old session keys
    'dailydoodle-session',
    'dailydoodle_session_persist',
    'dailydoodle_oauth_session',
    'creao_auth_token',
    
    // Old user storage (we're moving to Supabase for users)
    'dailydoodle_users',
    'dailydoodle_reset_tokens',
  ];

  let removedCount = 0;

  keysToRemove.forEach(key => {
    try {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        removedCount++;
        console.log(`[Auth Migration] Removed: ${key}`);
      }
    } catch (error) {
      console.warn(`[Auth Migration] Failed to remove ${key}:`, error);
    }
  });

  if (removedCount > 0) {
    console.log(`[Auth Migration] Cleaned up ${removedCount} old auth keys`);
  } else {
    console.log('[Auth Migration] No old auth keys found - already clean');
  }

  // Mark migration as complete
  try {
    localStorage.setItem('dailydoodle_auth_migration_v1', 'complete');
  } catch (error) {
    console.warn('[Auth Migration] Failed to mark migration complete:', error);
  }
}

export function shouldRunMigration(): boolean {
  try {
    return localStorage.getItem('dailydoodle_auth_migration_v1') !== 'complete';
  } catch {
    return false;
  }
}