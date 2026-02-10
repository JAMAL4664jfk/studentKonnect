-- Create table for Gazoo AI conversation history
CREATE TABLE IF NOT EXISTS gazoo_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  last_message TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gazoo_conversations_user_id ON gazoo_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_gazoo_conversations_updated_at ON gazoo_conversations(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE gazoo_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gazoo_conversations
-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON gazoo_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own conversations
CREATE POLICY "Users can create own conversations"
  ON gazoo_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON gazoo_conversations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON gazoo_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE gazoo_conversations IS 'Stores Gazoo AI chat conversation history for users';
COMMENT ON COLUMN gazoo_conversations.messages IS 'JSONB array of message objects with id, role, content, and timestamp';
