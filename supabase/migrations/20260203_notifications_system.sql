-- Central Notifications System
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'marketplace', 'accommodation', 'hookup', 'chat', 'group', 'connection', 'wellness', 'event'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data specific to notification type
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500), -- Deep link to relevant screen
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Message Edit History
CREATE TABLE IF NOT EXISTS message_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_message_edit_history_message_id ON message_edit_history(message_id);

-- Add is_edited column to messages table if not exists
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Group Members Table Enhancement
ALTER TABLE chat_group_members ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'member'; -- 'admin', 'moderator', 'member'
ALTER TABLE chat_group_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_data JSONB DEFAULT NULL,
  p_action_url VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_action_url)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification on new message
CREATE OR REPLACE FUNCTION notify_new_message() RETURNS TRIGGER AS $$
DECLARE
  v_receiver_id UUID;
  v_sender_name VARCHAR;
BEGIN
  -- Get receiver ID
  SELECT CASE 
    WHEN participant1_id = NEW.sender_id THEN participant2_id 
    ELSE participant1_id 
  END INTO v_receiver_id
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Get sender name
  SELECT full_name INTO v_sender_name
  FROM users
  WHERE id = NEW.sender_id;
  
  -- Create notification
  PERFORM create_notification(
    v_receiver_id,
    'chat',
    'New Message',
    v_sender_name || ': ' || LEFT(NEW.content, 50),
    jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id),
    '/chat-detail?conversationId=' || NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger to create notification on connection request
CREATE OR REPLACE FUNCTION notify_connection_request() RETURNS TRIGGER AS $$
DECLARE
  v_sender_name VARCHAR;
BEGIN
  SELECT full_name INTO v_sender_name
  FROM users
  WHERE id = NEW.sender_id;
  
  PERFORM create_notification(
    NEW.receiver_id,
    'connection',
    'New Connection Request',
    v_sender_name || ' wants to connect with you',
    jsonb_build_object('request_id', NEW.id, 'sender_id', NEW.sender_id),
    '/connection-requests'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_connection_request ON connection_requests;
CREATE TRIGGER trigger_notify_connection_request
  AFTER INSERT ON connection_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_connection_request();
