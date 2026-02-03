-- Chat Improvements Schema

-- Add fields to messages table for editing
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Deleted chats table (soft delete)
CREATE TABLE IF NOT EXISTS deleted_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chat_partner_id)
);

CREATE INDEX idx_deleted_chats_user ON deleted_chats(user_id);
CREATE INDEX idx_deleted_chats_partner ON deleted_chats(chat_partner_id);

-- Message edit history
CREATE TABLE IF NOT EXISTS message_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_message_edit_history_message ON message_edit_history(message_id);

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_blocked BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = user1_uuid AND blocked_id = user2_uuid)
       OR (blocker_id = user2_uuid AND blocked_id = user1_uuid)
  ) INTO is_blocked;
  
  RETURN is_blocked;
END;
$$ LANGUAGE plpgsql;

-- Function to check if chat is deleted for user
CREATE OR REPLACE FUNCTION is_chat_deleted_for_user(user_uuid UUID, partner_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_deleted BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM deleted_chats
    WHERE user_id = user_uuid AND chat_partner_id = partner_uuid
  ) INTO is_deleted;
  
  RETURN is_deleted;
END;
$$ LANGUAGE plpgsql;

-- Trigger to save message edit history
CREATE OR REPLACE FUNCTION save_message_edit_history() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content != NEW.content THEN
    INSERT INTO message_edit_history (message_id, previous_content, edited_at)
    VALUES (OLD.id, OLD.content, NOW());
    
    NEW.edited_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_save_message_edit_history ON messages;
CREATE TRIGGER trigger_save_message_edit_history
  BEFORE UPDATE ON messages
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION save_message_edit_history();

-- Trigger to notify when user is blocked
CREATE OR REPLACE FUNCTION notify_user_blocked() RETURNS TRIGGER AS $$
BEGIN
  -- Notify the blocker
  PERFORM create_notification(
    NEW.blocker_id,
    'chat',
    'User Blocked',
    'You have blocked ' || (SELECT full_name FROM users WHERE id = NEW.blocked_id),
    jsonb_build_object('blocked_user_id', NEW.blocked_id),
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_user_blocked ON blocked_users;
CREATE TRIGGER trigger_notify_user_blocked
  AFTER INSERT ON blocked_users
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_blocked();
