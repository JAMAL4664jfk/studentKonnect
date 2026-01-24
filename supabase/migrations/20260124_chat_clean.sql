-- Clean Chat System Migration
-- This will DROP existing tables and recreate them with correct structure

-- ============================================
-- STEP 1: DROP OLD TABLES (CASCADE)
-- ============================================

DROP TABLE IF EXISTS status_views CASCADE;
DROP TABLE IF EXISTS user_statuses CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS group_messages CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS chat_groups CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- STEP 2: CREATE ALL TABLES WITH CORRECT STRUCTURE
-- ============================================

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  institution_name TEXT,
  course_program TEXT,
  year_of_study TEXT,
  bio TEXT,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Connections table (friend connections)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'accepted',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Conversations table (1-on-1 chats)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(participant1_id, participant2_id),
  CHECK (participant1_id < participant2_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chat groups table
CREATE TABLE chat_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  max_members INTEGER DEFAULT 500,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Group messages table
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  reply_to_id UUID REFERENCES group_messages(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Call logs table
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL,
  call_status TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User statuses table
CREATE TABLE user_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL
);

-- Status views table
CREATE TABLE status_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_id UUID NOT NULL REFERENCES user_statuses(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(status_id, viewer_id)
);

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================

CREATE INDEX idx_connections_user1 ON connections(user1_id);
CREATE INDEX idx_connections_user2 ON connections(user2_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_messages_group ON group_messages(group_id);
CREATE INDEX idx_group_messages_created_at ON group_messages(created_at DESC);
CREATE INDEX idx_call_logs_caller ON call_logs(caller_id);
CREATE INDEX idx_call_logs_receiver ON call_logs(receiver_id);
CREATE INDEX idx_call_logs_started_at ON call_logs(started_at DESC);
CREATE INDEX idx_user_statuses_user ON user_statuses(user_id);
CREATE INDEX idx_user_statuses_expires_at ON user_statuses(expires_at);

-- ============================================
-- STEP 4: CREATE TRIGGERS
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

-- Trigger to update conversation last message
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

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, institution_name, course_program, year_of_study)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'institution_name',
    NEW.raw_user_meta_data->>'course_program',
    NEW.raw_user_meta_data->>'year_of_study'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    institution_name = COALESCE(EXCLUDED.institution_name, profiles.institution_name),
    course_program = COALESCE(EXCLUDED.course_program, profiles.course_program),
    year_of_study = COALESCE(EXCLUDED.year_of_study, profiles.year_of_study);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- ============================================
-- STEP 5: ENABLE RLS
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
-- STEP 6: CREATE RLS POLICIES
-- ============================================

-- Profiles
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- Connections
CREATE POLICY "Users can view connections" ON connections FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create connections" ON connections FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can update connections" ON connections FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can delete connections" ON connections FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Conversations
CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Users can update conversations" ON conversations FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Messages
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (auth.uid() = sender_id);

-- Chat groups
CREATE POLICY "Users can view groups" ON chat_groups FOR SELECT USING (
  is_public = true OR EXISTS (
    SELECT 1 FROM group_members WHERE group_members.group_id = chat_groups.id AND group_members.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create groups" ON chat_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update groups" ON chat_groups FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM group_members WHERE group_members.group_id = chat_groups.id AND group_members.user_id = auth.uid() AND group_members.role = 'admin'
  )
);

-- Group members
CREATE POLICY "Users can view group members" ON group_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_groups WHERE chat_groups.id = group_members.group_id AND (
      chat_groups.is_public = true OR EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = chat_groups.id AND gm.user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- Group messages
CREATE POLICY "Members can view messages" ON group_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = group_messages.group_id AND group_members.user_id = auth.uid())
);
CREATE POLICY "Members can send messages" ON group_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = group_messages.group_id AND group_members.user_id = auth.uid())
);
CREATE POLICY "Users can update own messages" ON group_messages FOR UPDATE USING (auth.uid() = sender_id);

-- Call logs
CREATE POLICY "Users can view their calls" ON call_logs FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create calls" ON call_logs FOR INSERT WITH CHECK (auth.uid() = caller_id);
CREATE POLICY "Users can update calls" ON call_logs FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- User statuses
CREATE POLICY "Users can view connected statuses" ON user_statuses FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM connections WHERE (connections.user1_id = auth.uid() AND connections.user2_id = user_statuses.user_id) OR (connections.user2_id = auth.uid() AND connections.user1_id = user_statuses.user_id)
  )
);
CREATE POLICY "Users can create statuses" ON user_statuses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete statuses" ON user_statuses FOR DELETE USING (auth.uid() = user_id);

-- Status views
CREATE POLICY "Users can view status views" ON status_views FOR SELECT USING (
  viewer_id = auth.uid() OR EXISTS (SELECT 1 FROM user_statuses WHERE user_statuses.id = status_views.status_id AND user_statuses.user_id = auth.uid())
);
CREATE POLICY "Users can record views" ON status_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- ============================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID AS $$
DECLARE
  conversation_uuid UUID;
  ordered_user1 UUID;
  ordered_user2 UUID;
BEGIN
  IF user1_uuid < user2_uuid THEN
    ordered_user1 := user1_uuid;
    ordered_user2 := user2_uuid;
  ELSE
    ordered_user1 := user2_uuid;
    ordered_user2 := user1_uuid;
  END IF;

  SELECT id INTO conversation_uuid FROM conversations WHERE participant1_id = ordered_user1 AND participant2_id = ordered_user2;

  IF conversation_uuid IS NULL THEN
    INSERT INTO conversations (participant1_id, participant2_id) VALUES (ordered_user1, ordered_user2) RETURNING id INTO conversation_uuid;
  END IF;

  RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_messages_as_read(conv_id UUID, user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages SET is_read = true WHERE conversation_id = conv_id AND sender_id != user_uuid AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 8: CREATE PROFILES FOR EXISTING USERS
-- ============================================

INSERT INTO profiles (id, full_name, institution_name, course_program, year_of_study)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  raw_user_meta_data->>'institution_name',
  raw_user_meta_data->>'course_program',
  raw_user_meta_data->>'year_of_study'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
