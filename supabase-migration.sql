-- ============================================
-- DAILY DOODLE PROMPT - SUPABASE MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Add viewed_badges to profiles table
-- ============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS viewed_badges JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- STEP 2: Create streaks table
-- ============================================

CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_viewed_date TEXT,
  streak_freeze_available BOOLEAN NOT NULL DEFAULT true,
  streak_freeze_used_this_month BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS for streaks
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak" ON streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" ON streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- STEP 3: Create badges table
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- RLS for badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 4: Create bookmarks table
-- ============================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

-- RLS for bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: Create doodles table
-- ============================================

CREATE TABLE IF NOT EXISTS doodles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  prompt_title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_doodles_user_id ON doodles(user_id);
CREATE INDEX IF NOT EXISTS idx_doodles_prompt_id ON doodles(prompt_id);
CREATE INDEX IF NOT EXISTS idx_doodles_is_public ON doodles(is_public);

-- RLS for doodles
ALTER TABLE doodles ENABLE ROW LEVEL SECURITY;

-- Users can view their own doodles
CREATE POLICY "Users can view own doodles" ON doodles
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view public doodles
CREATE POLICY "Anyone can view public doodles" ON doodles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own doodles" ON doodles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own doodles" ON doodles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own doodles" ON doodles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: Create likes table
-- ============================================

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doodle_id UUID NOT NULL REFERENCES doodles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, doodle_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_likes_doodle_id ON likes(doodle_id);

-- RLS for likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 7: Create follows table
-- ============================================

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- RLS for follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own follows" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================
-- STEP 8: Create shares table
-- ============================================

CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for shares
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares" ON shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shares" ON shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 9: Create user_stats table
-- ============================================

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consecutive_visit_days INTEGER NOT NULL DEFAULT 0,
  longest_visit_streak INTEGER NOT NULL DEFAULT 0,
  last_visit_date TEXT,
  consecutive_upload_days INTEGER NOT NULL DEFAULT 0,
  longest_upload_streak INTEGER NOT NULL DEFAULT 0,
  last_upload_date TEXT,
  total_favorites INTEGER NOT NULL DEFAULT 0,
  total_shares INTEGER NOT NULL DEFAULT 0,
  total_uploads INTEGER NOT NULL DEFAULT 0,
  total_likes_given INTEGER NOT NULL DEFAULT 0,
  total_likes_received INTEGER NOT NULL DEFAULT 0,
  has_submitted_prompt_idea BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS for user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- STEP 10: Create trigger to update likes_count
-- ============================================

-- Function to increment likes_count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE doodles SET likes_count = likes_count + 1 WHERE id = NEW.doodle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement likes_count
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE doodles SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.doodle_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on insert
DROP TRIGGER IF EXISTS trigger_increment_likes ON likes;
CREATE TRIGGER trigger_increment_likes
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_count();

-- Trigger on delete
DROP TRIGGER IF EXISTS trigger_decrement_likes ON likes;
CREATE TRIGGER trigger_decrement_likes
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_count();

-- ============================================
-- STEP 11: Create updated_at trigger function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to streaks
DROP TRIGGER IF EXISTS update_streaks_updated_at ON streaks;
CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_stats
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! All tables created with RLS policies
-- ============================================

-- Verify tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('streaks', 'badges', 'bookmarks', 'doodles', 'likes', 'follows', 'shares', 'user_stats')
ORDER BY table_name;
