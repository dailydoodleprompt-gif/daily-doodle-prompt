# Database Schema Documentation

Complete documentation of the Supabase PostgreSQL database schema for Daily Doodle Prompt.

---

## Overview

**Database:** PostgreSQL (via Supabase)
**Version:** 15.x
**Authentication:** Supabase Auth
**Storage:** Supabase Storage (doodles bucket)

---

## Tables

### profiles

User profile information and settings.

**Purpose:** Extends Supabase auth.users with app-specific data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | - | Primary key, references auth.users(id) |
| email | text | YES | - | User email (synced from auth.users) |
| username | text | YES | - | Display username (3-20 chars, validated) |
| avatar_type | text | YES | 'initial' | Avatar display type: 'initial', 'icon', 'upload' |
| avatar_icon | text | YES | null | Icon name if avatar_type = 'icon' |
| current_title | text | YES | null | Currently selected badge title to display |
| is_premium | boolean | NO | false | Premium subscription status |
| is_admin | boolean | NO | false | Admin privileges |
| stripe_customer_id | text | YES | null | Stripe customer ID for payments |
| viewed_badges | text[] | YES | '{}' | Array of badge IDs user has viewed |
| created_at | timestamptz | NO | now() | Account creation timestamp |
| updated_at | timestamptz | NO | now() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX on stripe_customer_id
- INDEX on username (for search/lookups)

**RLS Policies:**
- Users can view all profiles (public data)
- Users can update only their own profile
- Users cannot set is_premium, is_admin, or stripe_* fields via client

---

### doodles

User-uploaded artwork for daily prompts.

**Purpose:** Store doodle uploads with metadata and social features.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | Foreign key to profiles(id) |
| user_username | text | YES | - | Cached username for display |
| user_avatar_type | text | YES | - | Cached avatar type |
| user_avatar_icon | text | YES | - | Cached avatar icon |
| prompt_id | text | NO | - | Date string (YYYY-MM-DD) |
| prompt_title | text | NO | - | Prompt text/title |
| image_url | text | NO | - | Supabase Storage URL |
| caption | text | YES | - | User-provided caption |
| is_public | boolean | NO | true | Public visibility |
| likes_count | integer | NO | 0 | Number of likes (denormalized) |
| created_at | timestamptz | NO | now() | Upload timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX on user_id (for user's doodles query)
- INDEX on prompt_id (for prompt gallery query)
- INDEX on created_at (for feed chronological order)
- INDEX on is_public (for public doodles filter)

**RLS Policies:**
- Anyone can view public doodles (is_public = true)
- Users can view their own doodles (public or private)
- Only owner or admin can delete doodles
- Only owner can update their own doodles

**Foreign Keys:**
- user_id → profiles(id) ON DELETE CASCADE

---

### user_badges

Badges earned by users (achievement system).

**Purpose:** Track which badges each user has earned.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | NO | - | Foreign key to profiles(id) |
| badge_id | text | NO | - | Badge identifier (e.g., 'creative_spark') |
| earned_at | timestamptz | NO | now() | When badge was earned |

**Indexes:**
- PRIMARY KEY (user_id, badge_id)
- INDEX on user_id (for user's badges query)
- INDEX on earned_at (for recent badges)

**RLS Policies:**
- Users can view all user_badges (for leaderboards, etc.)
- Users can insert their own badges (via app logic)
- Users cannot delete badges

**Foreign Keys:**
- user_id → profiles(id) ON DELETE CASCADE

**Badge IDs:**
- creative_spark - First login
- early_bird - Upload by 6 AM
- night_owl - Upload after 10 PM
- streak_3 - 3-day streak
- streak_7 - 7-day streak
- streak_14 - 14-day streak
- streak_30 - 30-day streak
- streak_60 - 60-day streak
- streak_90 - 90-day streak
- streak_180 - 180-day streak
- streak_365 - 365-day streak
- premium_patron - Premium purchase
- first_upload - First doodle upload
- prolific_5 - 5 uploads
- prolific_10 - 10 uploads
- prolific_25 - 25 uploads
- prolific_50 - 50 uploads
- prolific_100 - 100 uploads
- somebody_likes_me - First like received
- popular_10 - 10 total likes
- popular_50 - 50 total likes
- popular_100 - 100 total likes
- social_butterfly - First follow

---

### streaks

Daily activity streak tracking.

**Purpose:** Gamification - track consecutive days of uploads.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | NO | - | Primary key, foreign key to profiles(id) |
| current_streak | integer | NO | 0 | Current consecutive days |
| longest_streak | integer | NO | 0 | All-time longest streak |
| last_active | date | YES | null | Last activity date (YYYY-MM-DD) |

**Indexes:**
- PRIMARY KEY (user_id)
- INDEX on current_streak (for leaderboards)
- INDEX on longest_streak (for leaderboards)

**RLS Policies:**
- Users can view all streaks
- Users can update only their own streak

**Foreign Keys:**
- user_id → profiles(id) ON DELETE CASCADE

**Logic:**
- Streak increments if activity on consecutive days
- Streak resets to 0 if gap > 1 day
- Longest streak is historical max

---

### bookmarks

User-saved prompts.

**Purpose:** Allow users to save favorite prompts for later.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | NO | - | Foreign key to profiles(id) |
| prompt_id | text | NO | - | Date string (YYYY-MM-DD) |
| created_at | timestamptz | NO | now() | When bookmarked |

**Indexes:**
- PRIMARY KEY (user_id, prompt_id)
- INDEX on user_id (for user's bookmarks query)
- INDEX on created_at (for chronological order)

**RLS Policies:**
- Users can view only their own bookmarks
- Users can insert/delete their own bookmarks

**Foreign Keys:**
- user_id → profiles(id) ON DELETE CASCADE

---

### follows

User following relationships (social graph).

**Purpose:** Track who follows whom for feed personalization.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| follower_id | uuid | NO | - | User doing the following |
| following_id | uuid | NO | - | User being followed |
| created_at | timestamptz | NO | now() | When follow occurred |

**Indexes:**
- PRIMARY KEY (follower_id, following_id)
- INDEX on follower_id (for "users I follow" query)
- INDEX on following_id (for "my followers" query)

**RLS Policies:**
- Users can view all follows (for public follower counts)
- Users can insert/delete their own follows
- Users cannot follow themselves (CHECK constraint)

**Foreign Keys:**
- follower_id → profiles(id) ON DELETE CASCADE
- following_id → profiles(id) ON DELETE CASCADE

**Constraints:**
- CHECK (follower_id != following_id) - No self-follows

---

### likes

Doodle likes (social engagement).

**Purpose:** Track which users liked which doodles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | NO | - | User who liked |
| doodle_id | uuid | NO | - | Doodle being liked |
| created_at | timestamptz | NO | now() | When liked |

**Indexes:**
- PRIMARY KEY (user_id, doodle_id)
- INDEX on doodle_id (for like count queries)
- INDEX on user_id (for "doodles I liked" query)

**RLS Policies:**
- Users can view all likes
- Users can insert/delete their own likes

**Foreign Keys:**
- user_id → profiles(id) ON DELETE CASCADE
- doodle_id → doodles(id) ON DELETE CASCADE

**Triggers:**
- On INSERT: Increment doodles.likes_count
- On DELETE: Decrement doodles.likes_count

---

## Storage Buckets

### doodles

**Purpose:** Store user-uploaded doodle images.

**Configuration:**
- Public: Yes (public read access)
- File Size Limit: 10MB (before compression)
- Allowed MIME Types: image/jpeg, image/png
- Path Structure: `{userId}/{filename}.jpg`

**RLS Policies:**
- Public SELECT (anyone can view public images)
- Authenticated INSERT to own folder
- Authenticated UPDATE/DELETE own files only
- Admins can DELETE any file

**Example Path:**
```
1bf19b30-9b37-4ba2-957e-a1badccb5d89/doodle_2024-01-15_abc123.jpg
```

---

## Database Functions

### update_likes_count()

**Trigger Function:** Automatically update doodles.likes_count when likes are added/removed.

```sql
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE doodles SET likes_count = likes_count + 1 WHERE id = NEW.doodle_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE doodles SET likes_count = likes_count - 1 WHERE id = OLD.doodle_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();
```

---

## Indexes Summary

**Purpose of Each Index:**

1. **Primary Keys** - Uniqueness and fast lookups
2. **Foreign Keys** - Join performance
3. **user_id indexes** - User-specific queries
4. **prompt_id index** - Prompt gallery queries
5. **created_at indexes** - Chronological sorting
6. **streak indexes** - Leaderboard queries

**Index Maintenance:**
- PostgreSQL auto-maintains indexes
- VACUUM runs automatically (Supabase managed)
- Monitor slow queries in Supabase dashboard

---

## Row Level Security (RLS)

All tables have RLS enabled for security.

**Key Principles:**
1. Public data viewable by all (profiles, public doodles)
2. Private data viewable only by owner (bookmarks, private doodles)
3. Users can only modify their own data
4. Admins have elevated permissions

**Auth Context:**
- `auth.uid()` - Current authenticated user's ID
- `auth.jwt()` - Current user's JWT claims

---

## Data Retention

**Current Policy:** No automated deletion

**Future Considerations:**
- Delete inactive accounts after X years
- Archive old doodles to cold storage
- Clean up orphaned storage files

---

## Backup & Recovery

**Managed by Supabase:**
- Daily automated backups
- Point-in-time recovery (PITR)
- Download backups via Supabase dashboard

---

## Performance Considerations

**Optimizations:**
1. Denormalized likes_count (avoid COUNT(*) queries)
2. Cached user data in doodles table (reduce joins)
3. Indexes on all foreign keys
4. Indexes on frequently queried columns

**Monitoring:**
- Check slow queries in Supabase dashboard
- Monitor database size (free tier: 500MB)
- Watch for missing indexes on new queries

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │────<│   doodles   │>────│    likes    │
│             │     │             │     │             │
│ id (PK)     │     │ id (PK)     │     │ user_id(PK) │
│ email       │     │ user_id(FK) │     │ doodle_id(PK)│
│ username    │     │ prompt_id   │     │ created_at  │
│ is_premium  │     │ image_url   │     └─────────────┘
│ is_admin    │     │ likes_count │
└─────────────┘     └─────────────┘
       │
       │    ┌─────────────┐
       ├───<│ user_badges │
       │    │             │
       │    │ user_id(PK) │
       │    │ badge_id(PK)│
       │    │ earned_at   │
       │    └─────────────┘
       │
       │    ┌─────────────┐
       ├───<│  bookmarks  │
       │    │             │
       │    │ user_id(PK) │
       │    │ prompt_id(PK)│
       │    │ created_at  │
       │    └─────────────┘
       │
       │    ┌─────────────┐
       ├───<│   streaks   │
       │    │             │
       │    │ user_id(PK) │
       │    │ current_streak│
       │    │ longest_streak│
       │    └─────────────┘
       │
       │    ┌─────────────┐
       └───<│   follows   │>───┐
            │             │    │
            │follower_id(PK)│    │
            │following_id(PK)│───┘
            │ created_at  │
            └─────────────┘
```

---

Last Updated: January 2026
