-- ============================================
-- NOTIFICATIONS TABLE
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'like_received',
    'follower_gained',
    'prompt_idea_reviewed',
    'badge_earned',
    'badge_available',
    'streak_reminder',
    'support_reply',
    'ticket_closed',
    'system_announcement',
    'admin_alert'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System/triggers can insert notifications for any user
-- This is handled by service role key in API
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Admins can view all notifications (for debugging)
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================
-- FUNCTION: Create notification (called from triggers/API)
-- ============================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_link, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Notify on new like (anonymous - no user details)
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_like() RETURNS TRIGGER AS $$
DECLARE
  v_doodle_owner_id UUID;
  v_prompt_title TEXT;
  v_doodle_count INT;
BEGIN
  -- Get the doodle owner (not the liker)
  SELECT user_id, prompt_title INTO v_doodle_owner_id, v_prompt_title
  FROM doodles WHERE id = NEW.doodle_id;

  -- Don't notify if user liked their own doodle
  IF v_doodle_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Check how many unread like notifications user has in last hour
  -- (to prevent spam from many rapid likes)
  SELECT COUNT(*) INTO v_doodle_count
  FROM notifications
  WHERE user_id = v_doodle_owner_id
    AND type = 'like_received'
    AND read_at IS NULL
    AND created_at > now() - interval '1 hour';

  -- Only create notification if less than 10 unread in last hour
  IF v_doodle_count < 10 THEN
    PERFORM create_notification(
      v_doodle_owner_id,
      'like_received',
      'Someone liked your doodle!',
      'Your doodle for "' || COALESCE(v_prompt_title, 'a prompt') || '" received a like.',
      '/profile',
      jsonb_build_object('doodle_id', NEW.doodle_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_like_notify ON likes;
CREATE TRIGGER on_like_notify
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

-- ============================================
-- TRIGGER: Notify on new follower (anonymous - no user details)
-- ============================================
CREATE OR REPLACE FUNCTION notify_on_follow() RETURNS TRIGGER AS $$
DECLARE
  v_follow_count INT;
BEGIN
  -- Don't notify if somehow following self (shouldn't happen)
  IF NEW.follower_id = NEW.following_id THEN
    RETURN NEW;
  END IF;

  -- Check how many unread follower notifications user has in last hour
  SELECT COUNT(*) INTO v_follow_count
  FROM notifications
  WHERE user_id = NEW.following_id
    AND type = 'follower_gained'
    AND read_at IS NULL
    AND created_at > now() - interval '1 hour';

  -- Only create notification if less than 5 unread in last hour
  IF v_follow_count < 5 THEN
    PERFORM create_notification(
      NEW.following_id,
      'follower_gained',
      'You have a new follower!',
      'Someone started following your doodles. Keep creating!',
      '/profile',
      '{}'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_follow_notify ON follows;
CREATE TRIGGER on_follow_notify
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- ============================================
-- CLEANUP: Delete old read notifications (older than 30 days)
-- This can be run periodically via Supabase cron or manually
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_notifications() RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE read_at IS NOT NULL
    AND read_at < now() - interval '30 days';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify table was created
SELECT 'notifications table created successfully' AS status;
