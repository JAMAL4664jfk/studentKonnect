-- AI Counsellor Sessions and Messages tables

-- Counsellor Sessions
CREATE TABLE IF NOT EXISTS counsellor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  counsellor_type TEXT NOT NULL CHECK (counsellor_type IN ('mental', 'financial', 'academic', 'bereavement')),
  title TEXT NOT NULL DEFAULT 'New Session',
  last_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Counsellor Messages
CREATE TABLE IF NOT EXISTS counsellor_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES counsellor_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE counsellor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE counsellor_messages ENABLE ROW LEVEL SECURITY;

-- Sessions: users can only see/manage their own sessions
CREATE POLICY "Users can manage own counsellor sessions"
  ON counsellor_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Messages: users can see messages from their own sessions
CREATE POLICY "Users can manage messages in own sessions"
  ON counsellor_messages FOR ALL
  USING (
    session_id IN (
      SELECT id FROM counsellor_sessions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM counsellor_sessions WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_counsellor_sessions_user_id ON counsellor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_counsellor_sessions_type ON counsellor_sessions(counsellor_type);
CREATE INDEX IF NOT EXISTS idx_counsellor_messages_session_id ON counsellor_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_counsellor_messages_created_at ON counsellor_messages(created_at);
