/**
 * Simple profanity filter for usernames
 * Blocks common offensive words and patterns
 */

// Common offensive words (lowercase)
// This is a basic list - can be expanded as needed
const BLOCKED_WORDS = new Set([
  // Explicit profanity
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'cunt', 'dick', 'cock', 'pussy',
  'bastard', 'whore', 'slut', 'fag', 'faggot', 'nigger', 'nigga', 'retard',
  // Common variations
  'f4ck', 'sh1t', 'b1tch', 'd1ck', 'c0ck', 'fuk', 'fuq', 'azz', 'a55',
  // Offensive slurs
  'nazi', 'hitler', 'kkk',
]);

// Patterns that might indicate profanity (with letter substitutions)
const BLOCKED_PATTERNS = [
  /f+u+c+k+/i,
  /s+h+[i1]+t+/i,
  /b+[i1]+t+c+h+/i,
  /a+[s5]+[s5]+/i,
  /n+[i1]+g+/i,
  /c+u+n+t+/i,
  /d+[i1]+c+k+/i,
  /c+[o0]+c+k+/i,
  /f+a+g+/i,
  /r+e+t+a+r+d+/i,
];

/**
 * Check if a username contains profanity
 * @param username - The username to check
 * @returns true if the username contains profanity
 */
export function containsProfanity(username: string): boolean {
  const normalized = username.toLowerCase().replace(/[_\-\.]/g, '');

  // Check against blocked words
  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(word)) {
      return true;
    }
  }

  // Check against patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Validate that a username is appropriate
 * @param username - The username to validate
 * @returns Error message if invalid, null if valid
 */
export function validateUsernameContent(username: string): string | null {
  if (containsProfanity(username)) {
    return 'Username contains inappropriate content';
  }
  return null;
}
