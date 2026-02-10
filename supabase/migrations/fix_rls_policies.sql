-- Fix Row Level Security (RLS) Policies for all tables
-- This migration ensures users can insert, update, delete, and select their own data

-- ============================================================================
-- MARKETPLACE ITEMS RLS POLICIES
-- ============================================================================

-- Enable RLS on marketplaceItems if not already enabled
ALTER TABLE "marketplaceItems" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can insert their own marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can update their own marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can delete their own marketplace items" ON "marketplaceItems";

-- Create new policies
CREATE POLICY "Users can view all marketplace items"
ON "marketplaceItems"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own marketplace items"
ON "marketplaceItems"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace items"
ON "marketplaceItems"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace items"
ON "marketplaceItems"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- ACCOMMODATION LISTINGS RLS POLICIES
-- ============================================================================

-- Enable RLS on accommodation_listings if not already enabled
ALTER TABLE accommodation_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all accommodation listings" ON accommodation_listings;
DROP POLICY IF EXISTS "Users can insert their own accommodation listings" ON accommodation_listings;
DROP POLICY IF EXISTS "Users can update their own accommodation listings" ON accommodation_listings;
DROP POLICY IF EXISTS "Users can delete their own accommodation listings" ON accommodation_listings;

-- Create new policies
CREATE POLICY "Users can view all accommodation listings"
ON accommodation_listings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own accommodation listings"
ON accommodation_listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accommodation listings"
ON accommodation_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accommodation listings"
ON accommodation_listings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PODCASTS RLS POLICIES
-- ============================================================================

ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can insert their own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can update their own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can delete their own podcasts" ON podcasts;

CREATE POLICY "Users can view all podcasts"
ON podcasts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own podcasts"
ON podcasts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcasts"
ON podcasts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcasts"
ON podcasts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PODCAST COMMENTS RLS POLICIES
-- ============================================================================

ALTER TABLE podcast_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all podcast comments" ON podcast_comments;
DROP POLICY IF EXISTS "Users can insert their own podcast comments" ON podcast_comments;
DROP POLICY IF EXISTS "Users can update their own podcast comments" ON podcast_comments;
DROP POLICY IF EXISTS "Users can delete their own podcast comments" ON podcast_comments;

CREATE POLICY "Users can view all podcast comments"
ON podcast_comments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own podcast comments"
ON podcast_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcast comments"
ON podcast_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcast comments"
ON podcast_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- PODCAST COMMENT LIKES RLS POLICIES
-- ============================================================================

ALTER TABLE podcast_comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all comment likes" ON podcast_comment_likes;
DROP POLICY IF EXISTS "Users can insert their own comment likes" ON podcast_comment_likes;
DROP POLICY IF EXISTS "Users can delete their own comment likes" ON podcast_comment_likes;

CREATE POLICY "Users can view all comment likes"
ON podcast_comment_likes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own comment likes"
ON podcast_comment_likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes"
ON podcast_comment_likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- CHATS RLS POLICIES
-- ============================================================================

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can insert chats they participate in" ON chats;

CREATE POLICY "Users can view their own chats"
ON chats
FOR SELECT
TO authenticated
USING (
  auth.uid() = user1_id OR 
  auth.uid() = user2_id
);

CREATE POLICY "Users can insert chats they participate in"
ON chats
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user1_id OR 
  auth.uid() = user2_id
);

-- ============================================================================
-- MESSAGES RLS POLICIES
-- ============================================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

CREATE POLICY "Users can view messages in their chats"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in their chats"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages"
ON messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- ============================================================================
-- COMMENTS
 RLS POLICIES (for general comments table if exists)
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view all comments" ON comments;
    DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
    
    CREATE POLICY "Users can view all comments"
    ON comments
    FOR SELECT
    TO authenticated
    USING (true);
    
    CREATE POLICY "Users can insert their own comments"
    ON comments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own comments"
    ON comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own comments"
    ON comments
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON "marketplaceItems" TO authenticated;
GRANT ALL ON accommodation_listings TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON podcasts TO authenticated;
GRANT ALL ON podcast_comments TO authenticated;
GRANT ALL ON podcast_comment_likes TO authenticated;
GRANT ALL ON chats TO authenticated;
GRANT ALL ON messages TO authenticated;
