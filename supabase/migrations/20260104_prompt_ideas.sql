-- ============================================
-- PROMPT IDEAS TABLE
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Create prompt_ideas table
CREATE TABLE IF NOT EXISTS prompt_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  reviewed_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prompt_ideas_user_id ON prompt_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_ideas_status ON prompt_ideas(status);
CREATE INDEX IF NOT EXISTS idx_prompt_ideas_created_at ON prompt_ideas(created_at DESC);

-- RLS for prompt_ideas
ALTER TABLE prompt_ideas ENABLE ROW LEVEL SECURITY;

-- Users can view their own ideas
CREATE POLICY "Users can view own prompt ideas" ON prompt_ideas
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own ideas
CREATE POLICY "Users can insert own prompt ideas" ON prompt_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all ideas (using profiles.is_admin check)
CREATE POLICY "Admins can view all prompt ideas" ON prompt_ideas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can update any idea (for review)
CREATE POLICY "Admins can update prompt ideas" ON prompt_ideas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS update_prompt_ideas_updated_at ON prompt_ideas;
CREATE TRIGGER update_prompt_ideas_updated_at
  BEFORE UPDATE ON prompt_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
SELECT 'prompt_ideas table created successfully' AS status;
