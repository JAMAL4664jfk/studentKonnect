-- Enhanced Groups Schema

-- Add more fields to chat_groups table
ALTER TABLE chat_groups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE chat_groups ADD COLUMN IF NOT EXISTS category VARCHAR(50); -- 'study', 'social', 'sports', 'academic', 'other'
ALTER TABLE chat_groups ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE chat_groups ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 100;
ALTER TABLE chat_groups ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);
ALTER TABLE chat_groups ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE chat_groups ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array of tags for discovery

-- Add join requests table for private groups
CREATE TABLE IF NOT EXISTS group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  message TEXT, -- Optional message from user
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_join_requests_group ON group_join_requests(group_id);
CREATE INDEX idx_group_join_requests_user ON group_join_requests(user_id);
CREATE INDEX idx_group_join_requests_status ON group_join_requests(status);

-- Connection Requests Table
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

CREATE INDEX idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX idx_connection_requests_receiver ON connection_requests(receiver_id);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);

-- Connections Table (accepted connections)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

CREATE INDEX idx_connections_user1 ON connections(user1_id);
CREATE INDEX idx_connections_user2 ON connections(user2_id);

-- Function to get group member count
CREATE OR REPLACE FUNCTION get_group_member_count(group_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO member_count
  FROM chat_group_members
  WHERE group_id = group_uuid;
  
  RETURN member_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is group member
CREATE OR REPLACE FUNCTION is_group_member(group_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_member BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM chat_group_members
    WHERE group_id = group_uuid AND user_id = user_uuid
  ) INTO is_member;
  
  RETURN is_member;
END;
$$ LANGUAGE plpgsql;

-- Function to check if users are connected
CREATE OR REPLACE FUNCTION are_users_connected(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  are_connected BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM connections
    WHERE (user1_id = LEAST(user1_uuid, user2_uuid) AND user2_id = GREATEST(user1_uuid, user2_uuid))
  ) INTO are_connected;
  
  RETURN are_connected;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create connection when request is accepted
CREATE OR REPLACE FUNCTION create_connection_on_accept() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO connections (user1_id, user2_id)
    VALUES (LEAST(NEW.sender_id, NEW.receiver_id), GREATEST(NEW.sender_id, NEW.receiver_id))
    ON CONFLICT DO NOTHING;
    
    -- Create notification for sender
    PERFORM create_notification(
      NEW.sender_id,
      'connection',
      'Connection Accepted',
      (SELECT full_name FROM users WHERE id = NEW.receiver_id) || ' accepted your connection request',
      jsonb_build_object('user_id', NEW.receiver_id),
      '/profile?userId=' || NEW.receiver_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_connection_on_accept ON connection_requests;
CREATE TRIGGER trigger_create_connection_on_accept
  AFTER UPDATE ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_connection_on_accept();

-- Trigger to notify when user joins group
CREATE OR REPLACE FUNCTION notify_group_join() RETURNS TRIGGER AS $$
DECLARE
  v_group_name VARCHAR;
  v_user_name VARCHAR;
BEGIN
  SELECT name INTO v_group_name FROM chat_groups WHERE id = NEW.group_id;
  SELECT full_name INTO v_user_name FROM users WHERE id = NEW.user_id;
  
  -- Notify group admins
  INSERT INTO notifications (user_id, type, title, message, data, action_url)
  SELECT 
    cgm.user_id,
    'group',
    'New Member Joined',
    v_user_name || ' joined ' || v_group_name,
    jsonb_build_object('group_id', NEW.group_id, 'user_id', NEW.user_id),
    '/group-detail?groupId=' || NEW.group_id
  FROM chat_group_members cgm
  WHERE cgm.group_id = NEW.group_id AND cgm.role = 'admin' AND cgm.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_group_join ON chat_group_members;
CREATE TRIGGER trigger_notify_group_join
  AFTER INSERT ON chat_group_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_group_join();
