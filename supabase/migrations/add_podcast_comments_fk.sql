-- Add foreign key constraint for podcast_comments.user_id to profiles.id
-- This ensures referential integrity and enables proper joins

-- First, check if the foreign key already exists and drop it if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'podcast_comments_user_id_fkey' 
        AND table_name = 'podcast_comments'
    ) THEN
        ALTER TABLE podcast_comments DROP CONSTRAINT podcast_comments_user_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE podcast_comments
ADD CONSTRAINT podcast_comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add comment to explain the relationship
COMMENT ON CONSTRAINT podcast_comments_user_id_fkey ON podcast_comments IS 'Foreign key relationship to profiles table. Comments are deleted when user is deleted (CASCADE).';

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_podcast_comments_user_id ON podcast_comments(user_id);

-- Also add foreign key for podcast_id if it doesn't exist
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

-- Create index on podcast_id for better query performance
CREATE INDEX IF NOT EXISTS idx_podcast_comments_podcast_id ON podcast_comments(podcast_id);

-- Add index on parent_id for nested comments/replies
CREATE INDEX IF NOT EXISTS idx_podcast_comments_parent_id ON podcast_comments(parent_id);
