-- ============================================================================
-- CORRECTED MASTER MIGRATION: Fix All Critical Issues
-- ============================================================================
-- This migration fixes all critical database issues with CORRECT column names
-- Run this instead of 00_master_fix_all_issues.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD POPIA CONSENT FIELDS
-- ============================================================================

-- Add POPIA consent fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS popia_consent BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS popia_consent_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN profiles.popia_consent IS 'User consent to POPIA (Protection of Personal Information Act) terms. NULL = not asked, TRUE = accepted, FALSE = declined';
COMMENT ON COLUMN profiles.popia_consent_date IS 'Timestamp when user provided POPIA consent';

CREATE INDEX IF NOT EXISTS idx_profiles_popia_consent ON profiles(popia_consent);

-- ============================================================================
-- STEP 2: CREATE ALL FOREIGN KEY RELATIONSHIPS
-- ============================================================================

-- MARKETPLACE ITEMS (uses userId in camelCase)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'marketplaceItems_userId_fkey' 
        AND table_name = 'marketplaceItems'
    ) THEN
        ALTER TABLE "marketplaceItems"
        ADD CONSTRAINT "marketplaceItems_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_marketplaceItems_userId" ON "marketplaceItems"("userId");
CREATE INDEX IF NOT EXISTS idx_marketplaceItems_category ON "marketplaceItems"(category);

-- ACCOMMODATIONS (uses userId in camelCase)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'accommodations_userId_fkey' 
        AND table_name = 'accommodations'
    ) THEN
        ALTER TABLE accommodations
        ADD CONSTRAINT accommodations_userId_fkey 
        FOREIGN KEY ("userId") 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_accommodations_userId ON accommodations("userId");
CREATE INDEX IF NOT EXISTS idx_accommodations_city ON accommodations(city);

-- PODCASTS (uses user_id in snake_case)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'podcasts_user_id_fkey' 
        AND table_name = 'podcasts'
    ) THEN
        ALTER TABLE podcasts
        ADD CONSTRAINT podcasts_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts(user_id);

-- PODCAST COMMENTS (THIS FIXES THE ERROR YOU'RE SEEING - uses user_id in snake_case)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'podcast_comments_user_id_fkey' 
        AND table_name = 'podcast_comments'
    ) THEN
        ALTER TABLE podcast_comments
        ADD CONSTRAINT podcast_comments_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'podcast_comments_podcast_id_fkey' 
        AND table_name = 'podcast_comments'
    ) THEN
        ALTER TABLE podcast_comments
        ADD CONSTRAINT podcast_comments_podcast_id_fkey 
        FOREIGN KEY (podcast_id) 
        REFERENCES podcasts(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_podcast_comments_user_id ON podcast_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_podcast_id ON podcast_comments(podcast_id);

-- PODCAST SERIES (if exists - uses user_id in snake_case)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcast_series') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'podcast_series_user_id_fkey' 
            AND table_name = 'podcast_series'
        ) THEN
            ALTER TABLE podcast_series
            ADD CONSTRAINT podcast_series_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_podcast_series_user_id ON podcast_series(user_id);
    END IF;
END $$;

-- PODCAST COMMENT LIKES (if exists - uses user_id in snake_case)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcast_comment_likes') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'podcast_comment_likes_user_id_fkey' 
            AND table_name = 'podcast_comment_likes'
        ) THEN
            ALTER TABLE podcast_comment_likes
            ADD CONSTRAINT podcast_comment_likes_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'podcast_comment_likes_comment_id_fkey' 
            AND table_name = 'podcast_comment_likes'
        ) THEN
            ALTER TABLE podcast_comment_likes
            ADD CONSTRAINT podcast_comment_likes_comment_id_fkey 
            FOREIGN KEY (comment_id) 
            REFERENCES podcast_comments(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_podcast_comment_likes_user_id ON podcast_comment_likes(user_id);
        CREATE INDEX IF NOT EXISTS idx_podcast_comment_likes_comment_id ON podcast_comment_likes(comment_id);
    END IF;
END $$;

-- CHATS (uses user1_id, user2_id in snake_case)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'chats_user1_id_fkey' 
            AND table_name = 'chats'
        ) THEN
            ALTER TABLE chats
            ADD CONSTRAINT chats_user1_id_fkey 
            FOREIGN KEY (user1_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'chats_user2_id_fkey' 
            AND table_name = 'chats'
        ) THEN
            ALTER TABLE chats
            ADD CONSTRAINT chats_user2_id_fkey 
            FOREIGN KEY (user2_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_chats_user1_id ON chats(user1_id);
        CREATE INDEX IF NOT EXISTS idx_chats_user2_id ON chats(user2_id);
    END IF;
END $$;

-- MESSAGES (uses chat_id, sender_id in snake_case)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'messages_chat_id_fkey' 
            AND table_name = 'messages'
        ) THEN
            ALTER TABLE messages
            ADD CONSTRAINT messages_chat_id_fkey 
            FOREIGN KEY (chat_id) 
            REFERENCES chats(id) 
            ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'messages_sender_id_fkey' 
            AND table_name = 'messages'
        ) THEN
            ALTER TABLE messages
            ADD CONSTRAINT messages_sender_id_fkey 
            FOREIGN KEY (sender_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
        CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    END IF;
END $$;

-- ============================================================================
-- STEP 3: FIX RLS POLICIES
-- ============================================================================

-- MARKETPLACE ITEMS (uses userId)
ALTER TABLE "marketplaceItems" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can insert their own marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can update their own marketplace items" ON "marketplaceItems";
DROP POLICY IF EXISTS "Users can delete their own marketplace items" ON "marketplaceItems";

CREATE POLICY "Users can view all marketplace items"
ON "marketplaceItems" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own marketplace items"
ON "marketplaceItems" FOR INSERT TO authenticated
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own marketplace items"
ON "marketplaceItems" FOR UPDATE TO authenticated
USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own marketplace items"
ON "marketplaceItems" FOR DELETE TO authenticated
USING (auth.uid() = "userId");

-- ACCOMMODATIONS (uses userId)
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all accommodation listings" ON accommodations;
DROP POLICY IF EXISTS "Users can insert their own accommodation listings" ON accommodations;
DROP POLICY IF EXISTS "Users can update their own accommodation listings" ON accommodations;
DROP POLICY IF EXISTS "Users can delete their own accommodation listings" ON accommodations;

CREATE POLICY "Users can view all accommodation listings"
ON accommodations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own accommodation listings"
ON accommodations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own accommodation listings"
ON accommodations FOR UPDATE TO authenticated
USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own accommodation listings"
ON accommodations FOR DELETE TO authenticated
USING (auth.uid() = "userId");

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- PODCASTS (uses user_id)
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can insert their own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can update their own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can delete their own podcasts" ON podcasts;

CREATE POLICY "Users can view all podcasts"
ON podcasts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own podcasts"
ON podcasts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcasts"
ON podcasts FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcasts"
ON podcasts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- PODCAST COMMENTS (uses user_id)
ALTER TABLE podcast_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all podcast comments" ON podcast_comments;
DROP POLICY IF EXISTS "Users can insert their own podcast comments" ON podcast_comments;
DROP POLICY IF EXISTS "Users can update their own podcast comments" ON podcast_comments;
DROP POLICY IF EXISTS "Users can delete their own podcast comments" ON podcast_comments;

CREATE POLICY "Users can view all podcast comments"
ON podcast_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own podcast comments"
ON podcast_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcast comments"
ON podcast_comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcast comments"
ON podcast_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- CHATS (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
        ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
        DROP POLICY IF EXISTS "Users can insert chats they participate in" ON chats;
        
        CREATE POLICY "Users can view their own chats"
        ON chats FOR SELECT TO authenticated
        USING (auth.uid() = user1_id OR auth.uid() = user2_id);
        
        CREATE POLICY "Users can insert chats they participate in"
        ON chats FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
    END IF;
END $$;

-- MESSAGES (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
        DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
        DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
        
        CREATE POLICY "Users can view messages in their chats"
        ON messages FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
          )
        );
        
        CREATE POLICY "Users can insert messages in their chats"
        ON messages FOR INSERT TO authenticated
        WITH CHECK (
          auth.uid() = sender_id AND
          EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
          )
        );
        
        CREATE POLICY "Users can update their own messages"
        ON messages FOR UPDATE TO authenticated
        USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);
    END IF;
END $$;

-- ============================================================================
-- STEP 4: GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON "marketplaceItems" TO authenticated;
GRANT ALL ON accommodations TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON podcasts TO authenticated;
GRANT ALL ON podcast_comments TO authenticated;

-- Grant on optional tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
        GRANT ALL ON chats TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        GRANT ALL ON messages TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcast_series') THEN
        GRANT ALL ON podcast_series TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcast_comment_likes') THEN
        GRANT ALL ON podcast_comment_likes TO authenticated;
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration has:
-- 1. ✅ Added POPIA consent fields to profiles
-- 2. ✅ Created foreign keys with CORRECT column names:
--    - marketplaceItems.userId → profiles.id (camelCase)
--    - accommodations.userId → profiles.id (camelCase)
--    - podcasts.user_id → profiles.id (snake_case)
--    - podcast_comments.user_id → profiles.id (snake_case) ← FIXES ERROR
--    - podcast_comments.podcast_id → podcasts.id
-- 3. ✅ Fixed RLS policies for marketplace (fixes "new row violates RLS" error)
-- 4. ✅ Fixed RLS policies for accommodations (fixes "new row violates RLS" error)
-- 5. ✅ Granted necessary permissions to authenticated users
-- ============================================================================
