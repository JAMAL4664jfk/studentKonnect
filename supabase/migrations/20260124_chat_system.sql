-- Chat System Migration
-- Creates all tables needed for chat, groups, calls, and status features

-- ============================================
-- PROFILES TABLE (User profiles for chat)
-- ============================================
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "full_name" TEXT,
  "avatar_url" TEXT,
  "institution_name" TEXT,
  "course_program" TEXT,
  "year_of_study" TEXT,
  "bio" TEXT,
  "status" TEXT DEFAULT 'offline', -- online, offline, away, busy
  "last_seen" TIMESTAMP DEFAULT NOW(),
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- CONNECTIONS TABLE (Friend connections)
-- ============================================
CREATE TABLE IF NOT EXISTS "connections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user1_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "user2_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "status" TEXT DEFAULT 'pending', -- pending, accepted, blocked
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- ============================================
-- CONVERSATIONS TABLE (1-on-1 chats)
-- ============================================
CREATE TABLE IF NOT EXISTS "conversations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "participant1_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "participant2_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "last_message" TEXT,
  "last_message_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(participant1_id, participant2_id),
  CHECK (participant1_id < participant2_id) -- Ensure consistent ordering
);

-- ============================================
-- MESSAGES TABLE (Chat messages)
-- ============================================
CREATE TABLE IF NOT EXISTS "messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  "sender_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "message_type" TEXT DEFAULT 'text', -- text, image, video, audio, file, location
  "media_url" TEXT,
  "reply_to_id" UUID REFERENCES messages(id) ON DELETE SET NULL,
  "is_read" BOOLEAN DEFAULT FALSE,
  "is_deleted" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- CHAT GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "chat_groups" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "avatar_url" TEXT,
  "created_by" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "is_public" BOOLEAN DEFAULT FALSE,
  "max_members" INTEGER DEFAULT 500,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- GROUP MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "group_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "role" TEXT DEFAULT 'member', -- admin, moderator, member
  "joined_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "last_read_at" TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- GROUP MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "group_messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  "sender_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "message_type" TEXT DEFAULT 'text', -- text, image, video, audio, file, announcement
  "media_url" TEXT,
  "reply_to_id" UUID REFERENCES group_messages(id) ON DELETE SET NULL,
  "is_deleted" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- CALL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "call_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "caller_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "receiver_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "call_type" TEXT NOT NULL, -- voice, video
  "call_status" TEXT NOT NULL, -- missed, answered, declined, cancelled
  "duration" INTEGER DEFAULT 0, -- in seconds
  "started_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "ended_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- USER STATUSES TABLE (WhatsApp-style status)
-- ============================================
CREATE TABLE IF NOT EXISTS "user_statuses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "content" TEXT,
  "media_url" TEXT,
  "media_type" TEXT, -- image, video, text
  "views_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "expires_at" TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL
);

-- ============================================
-- STATUS VIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "status_views" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "status_id" UUID NOT NULL REFERENCES user_statuses(id) ON DELETE CASCADE,
  "viewer_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "viewed_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(status_id, viewer_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_connections_user1 ON connections(user1_id);
CREATE INDEX IF NOT EXISTS idx_connections_user2 ON connections(user2_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_caller ON call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_receiver ON call_logs(receiver_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_statuses_user ON user_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statuses_expires_at ON user_statuses(expires_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_groups_updated_at BEFORE UPDATE ON chat_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at BEFORE UPDATE ON group_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER TO UPDATE CONVERSATION LAST MESSAGE
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- ============================================
-- TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, institution_name, course_program, year_of_study)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'institution_name',
    NEW.raw_user_meta_data->>'course_program',
    NEW.raw_user_meta_data->>'year_of_study'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- RLS POLICIES - CONNECTIONS
-- ============================================
CREATE POLICY "Users can view their connections" ON connections
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their connections" ON connections
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their connections" ON connections
  FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- RLS POLICIES - CONVERSATIONS
-- ============================================
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update their conversations" ON conversations
  FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- ============================================
-- RLS POLICIES - MESSAGES
-- ============================================
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = sender_id);

-- ============================================
-- RLS POLICIES - CHAT GROUPS
-- ============================================
CREATE POLICY "Users can view public groups" ON chat_groups
  FOR SELECT USING (is_public = true OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = chat_groups.id
    AND group_members.user_id = auth.uid()
  ));

CREATE POLICY "Users can create groups" ON chat_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update groups" ON chat_groups
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = chat_groups.id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  ));

-- ============================================
-- RLS POLICIES - GROUP MEMBERS
-- ============================================
CREATE POLICY "Users can view group members" ON group_members
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM chat_groups
    WHERE chat_groups.id = group_members.group_id
    AND (chat_groups.is_public = true OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = chat_groups.id
      AND gm.user_id = auth.uid()
    ))
  ));

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - GROUP MESSAGES
-- ============================================
CREATE POLICY "Group members can view messages" ON group_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  ));

CREATE POLICY "Group members can send messages" ON group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own group messages" ON group_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- ============================================
-- RLS POLICIES - CALL LOGS
-- ============================================
CREATE POLICY "Users can view their call logs" ON call_logs
  FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create call logs" ON call_logs
  FOR INSERT WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their call logs" ON call_logs
  FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- ============================================
-- RLS POLICIES - USER STATUSES
-- ============================================
CREATE POLICY "Users can view statuses from connections" ON user_statuses
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM connections
      WHERE (connections.user1_id = auth.uid() AND connections.user2_id = user_statuses.user_id)
      OR (connections.user2_id = auth.uid() AND connections.user1_id = user_statuses.user_id)
    )
  );

CREATE POLICY "Users can create their own statuses" ON user_statuses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statuses" ON user_statuses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - STATUS VIEWS
-- ============================================
CREATE POLICY "Users can view status views" ON status_views
  FOR SELECT USING (
    viewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_statuses
      WHERE user_statuses.id = status_views.status_id
      AND user_statuses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can record status views" ON status_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- ============================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID AS $$
DECLARE
  conversation_uuid UUID;
  ordered_user1 UUID;
  ordered_user2 UUID;
BEGIN
  -- Ensure consistent ordering
  IF user1_uuid < user2_uuid THEN
    ordered_user1 := user1_uuid;
    ordered_user2 := user2_uuid;
  ELSE
    ordered_user1 := user2_uuid;
    ordered_user2 := user1_uuid;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conversation_uuid
  FROM conversations
  WHERE participant1_id = ordered_user1 AND participant2_id = ordered_user2;

  -- Create if doesn't exist
  IF conversation_uuid IS NULL THEN
    INSERT INTO conversations (participant1_id, participant2_id)
    VALUES (ordered_user1, ordered_user2)
    RETURNING id INTO conversation_uuid;
  END IF;

  RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conv_id UUID, user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET is_read = true
  WHERE conversation_id = conv_id
  AND sender_id != user_uuid
  AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid UUID)
RETURNS TABLE(conversation_id UUID, unread_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT m.conversation_id, COUNT(*)
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE (c.participant1_id = user_uuid OR c.participant2_id = user_uuid)
  AND m.sender_id != user_uuid
  AND m.is_read = false
  GROUP BY m.conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
