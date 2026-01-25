-- User Discovery and Chat System Database Schema

-- 1. User Connections Table (for friend requests and connections)
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- 2. Direct Messages Table
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (sender_id != receiver_id)
);

-- 3. User Online Status Table
CREATE TABLE IF NOT EXISTS user_online_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Message Reactions Table (optional - for emoji reactions)
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction VARCHAR(10) NOT NULL, -- emoji like ❤️, 👍, 😂, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_addressee ON user_connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_online_status_is_online ON user_online_status(is_online);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direct_messages_updated_at
  BEFORE UPDATE ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_online_status_updated_at
  BEFORE UPDATE ON user_online_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_online_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- User Connections Policies
CREATE POLICY "Users can view their own connections"
ON user_connections FOR SELECT
USING (
  requester_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  OR addressee_id IN (SELECT id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create connection requests"
ON user_connections FOR INSERT
WITH CHECK (
  requester_id IN (SELECT id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their own connections"
ON user_connections FOR UPDATE
USING (
  requester_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  OR addressee_id IN (SELECT id FROM profiles WHERE id = auth.uid())
);

-- Direct Messages Policies
CREATE POLICY "Users can view their own messages"
ON direct_messages FOR SELECT
USING (
  sender_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  OR receiver_id IN (SELECT id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can send messages"
ON direct_messages FOR INSERT
WITH CHECK (
  sender_id IN (SELECT id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update their sent messages"
ON direct_messages FOR UPDATE
USING (
  sender_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  OR receiver_id IN (SELECT id FROM profiles WHERE id = auth.uid())
);

-- Online Status Policies
CREATE POLICY "Everyone can view online status"
ON user_online_status FOR SELECT
USING (true);

CREATE POLICY "Users can update their own status"
ON user_online_status FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own status"
ON user_online_status FOR UPDATE
USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Message Reactions Policies
CREATE POLICY "Users can view reactions"
ON message_reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add reactions"
ON message_reactions FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can remove their reactions"
ON message_reactions FOR DELETE
USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Function to get conversation list with last message
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
  other_user_id UUID,
  other_user_name TEXT,
  other_user_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  is_online BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH conversations AS (
    SELECT DISTINCT
      CASE 
        WHEN dm.sender_id = p_user_id THEN dm.receiver_id
        ELSE dm.sender_id
      END as user_id
    FROM direct_messages dm
    WHERE dm.sender_id = p_user_id OR dm.receiver_id = p_user_id
  ),
  last_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN dm.sender_id = p_user_id THEN dm.receiver_id
        ELSE dm.sender_id
      END
    )
      CASE 
        WHEN dm.sender_id = p_user_id THEN dm.receiver_id
        ELSE dm.sender_id
      END as user_id,
      dm.content,
      dm.created_at
    FROM direct_messages dm
    WHERE dm.sender_id = p_user_id OR dm.receiver_id = p_user_id
    ORDER BY
      CASE 
        WHEN dm.sender_id = p_user_id THEN dm.receiver_id
        ELSE dm.sender_id
      END,
      dm.created_at DESC
  )
  SELECT
    c.user_id,
    p.full_name,
    p.avatar_url,
    lm.content,
    lm.created_at,
    (
      SELECT COUNT(*)
      FROM direct_messages dm
      WHERE dm.sender_id = c.user_id 
      AND dm.receiver_id = p_user_id 
      AND dm.is_read = false
    )::BIGINT as unread_count,
    COALESCE(uos.is_online, false) as is_online
  FROM conversations c
  JOIN profiles p ON p.id = c.user_id
  LEFT JOIN last_messages lm ON lm.user_id = c.user_id
  LEFT JOIN user_online_status uos ON uos.user_id = c.user_id
  ORDER BY lm.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
