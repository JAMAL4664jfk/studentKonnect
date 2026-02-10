-- Create all necessary foreign key relationships for Student Konnect database
-- This ensures referential integrity across all tables

-- ============================================================================
-- PROFILES TABLE (Base table - no foreign keys needed)
-- ============================================================================
-- profiles.id is referenced by many other tables
-- No foreign keys needed here as it's the base user table

-- ============================================================================
-- MARKETPLACE ITEMS
-- ============================================================================

-- Add foreign key for marketplaceItems.user_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'marketplaceItems_user_id_fkey' 
        AND table_name = 'marketplaceItems'
    ) THEN
        ALTER TABLE "marketplaceItems"
        ADD CONSTRAINT "marketplaceItems_user_id_fkey" 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_marketplaceItems_user_id ON "marketplaceItems"(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplaceItems_category ON "marketplaceItems"(category);
CREATE INDEX IF NOT EXISTS idx_marketplaceItems_created_at ON "marketplaceItems"(created_at DESC);

-- ============================================================================
-- ACCOMMODATION LISTINGS
-- ============================================================================

-- Add foreign key for accommodations.userId -> profiles.id
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
CREATE INDEX IF NOT EXISTS idx_accommodations_propertyType ON accommodations("propertyType");
CREATE INDEX IF NOT EXISTS idx_accommodations_price ON accommodations(price);
CREATE INDEX IF NOT EXISTS idx_accommodations_createdAt ON accommodations("createdAt" DESC);

-- Also check for accommodation_listings table (alternative name)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accommodation_listings') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'accommodation_listings_user_id_fkey' 
            AND table_name = 'accommodation_listings'
        ) THEN
            ALTER TABLE accommodation_listings
            ADD CONSTRAINT accommodation_listings_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_accommodation_listings_user_id ON accommodation_listings(user_id);
        CREATE INDEX IF NOT EXISTS idx_accommodation_listings_city ON accommodation_listings(city);
    END IF;
END $$;

-- ============================================================================
-- PODCASTS
-- ============================================================================

-- Add foreign key for podcasts.user_id -> profiles.id
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

-- Add foreign key for podcasts.series_id -> podcast_series.id (if series table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcast_series') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'podcasts_series_id_fkey' 
            AND table_name = 'podcasts'
        ) THEN
            ALTER TABLE podcasts
            ADD CONSTRAINT podcasts_series_id_fkey 
            FOREIGN KEY (series_id) 
            REFERENCES podcast_series(id) 
            ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_series_id ON podcasts(series_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_category ON podcasts(category);
CREATE INDEX IF NOT EXISTS idx_podcasts_release_date ON podcasts(release_date DESC);

-- ============================================================================
-- PODCAST SERIES
-- ============================================================================

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

-- ============================================================================
-- PODCAST COMMENTS
-- ============================================================================

-- Add foreign key for podcast_comments.user_id -> profiles.id
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

-- Add foreign key for podcast_comments.podcast_id -> podcasts.id
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

-- Add foreign key for podcast_comments.parent_id -> podcast_comments.id (self-reference for replies)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'podcast_comments_parent_id_fkey' 
        AND table_name = 'podcast_comments'
    ) THEN
        ALTER TABLE podcast_comments
        ADD CONSTRAINT podcast_comments_parent_id_fkey 
        FOREIGN KEY (parent_id) 
        REFERENCES podcast_comments(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_podcast_comments_user_id ON podcast_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_podcast_id ON podcast_comments(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_parent_id ON podcast_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_created_at ON podcast_comments(created_at DESC);

-- ============================================================================
-- PODCAST COMMENT LIKES
-- ============================================================================

DO $$ 
BEGIN
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
END $$;

DO $$ 
BEGIN
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
END $$;

CREATE INDEX IF NOT EXISTS idx_podcast_comment_likes_user_id ON podcast_comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comment_likes_comment_id ON podcast_comment_likes(comment_id);

-- ============================================================================
-- CHATS
-- ============================================================================

DO $$ 
BEGIN
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
END $$;

DO $$ 
BEGIN
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
END $$;

CREATE INDEX IF NOT EXISTS idx_chats_user1_id ON chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_chats_user2_id ON chats(user2_id);
CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON chats(last_message_at DESC);

-- ============================================================================
-- MESSAGES
-- ============================================================================

DO $$ 
BEGIN
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
END $$;

DO $$ 
BEGIN
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
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- DATING/HOOKUP TABLES
-- ============================================================================

-- Dating profiles
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dating_profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'dating_profiles_user_id_fkey' 
            AND table_name = 'dating_profiles'
        ) THEN
            ALTER TABLE dating_profiles
            ADD CONSTRAINT dating_profiles_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_dating_profiles_user_id ON dating_profiles(user_id);
    END IF;
END $$;

-- Dating likes/swipes
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dating_likes') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'dating_likes_user_id_fkey' 
            AND table_name = 'dating_likes'
        ) THEN
            ALTER TABLE dating_likes
            ADD CONSTRAINT dating_likes_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'dating_likes_liked_user_id_fkey' 
            AND table_name = 'dating_likes'
        ) THEN
            ALTER TABLE dating_likes
            ADD CONSTRAINT dating_likes_liked_user_id_fkey 
            FOREIGN KEY (liked_user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_dating_likes_user_id ON dating_likes(user_id);
        CREATE INDEX IF NOT EXISTS idx_dating_likes_liked_user_id ON dating_likes(liked_user_id);
    END IF;
END $$;

-- Dating matches
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dating_matches') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'dating_matches_user1_id_fkey' 
            AND table_name = 'dating_matches'
        ) THEN
            ALTER TABLE dating_matches
            ADD CONSTRAINT dating_matches_user1_id_fkey 
            FOREIGN KEY (user1_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'dating_matches_user2_id_fkey' 
            AND table_name = 'dating_matches'
        ) THEN
            ALTER TABLE dating_matches
            ADD CONSTRAINT dating_matches_user2_id_fkey 
            FOREIGN KEY (user2_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_dating_matches_user1_id ON dating_matches(user1_id);
        CREATE INDEX IF NOT EXISTS idx_dating_matches_user2_id ON dating_matches(user2_id);
    END IF;
END $$;

-- ============================================================================
-- COMMENTS TABLE (Generic comments if exists)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'comments_user_id_fkey' 
            AND table_name = 'comments'
        ) THEN
            ALTER TABLE comments
            ADD CONSTRAINT comments_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
        CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
    END IF;
END $$;

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'notifications_user_id_fkey' 
            AND table_name = 'notifications'
        ) THEN
            ALTER TABLE notifications
            ADD CONSTRAINT notifications_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- This migration creates foreign key relationships for:
-- 1. marketplaceItems -> profiles (user_id)
-- 2. accommodations -> profiles (userId)
-- 3. podcasts -> profiles (user_id)
-- 4. podcasts -> podcast_series (series_id)
-- 5. podcast_series -> profiles (user_id)
-- 6. podcast_comments -> profiles (user_id)
-- 7. podcast_comments -> podcasts (podcast_id)
-- 8. podcast_comments -> podcast_comments (parent_id, self-reference)
-- 9. podcast_comment_likes -> profiles (user_id)
-- 10. podcast_comment_likes -> podcast_comments (comment_id)
-- 11. chats -> profiles (user1_id, user2_id)
-- 12. messages -> chats (chat_id)
-- 13. messages -> profiles (sender_id)
-- 14. dating_profiles -> profiles (user_id)
-- 15. dating_likes -> profiles (user_id, liked_user_id)
-- 16. dating_matches -> profiles (user1_id, user2_id)
-- 17. comments -> profiles (user_id)
-- 18. notifications -> profiles (user_id)

-- All foreign keys use ON DELETE CASCADE to maintain referential integrity
-- Indexes are created for all foreign key columns to improve query performance
