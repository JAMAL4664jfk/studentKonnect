-- Fix podcast_comments foreign key relationship with profiles table

-- First, check if the foreign key constraint exists and drop it if needed
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

-- Add the correct foreign key constraint
ALTER TABLE podcast_comments
ADD CONSTRAINT podcast_comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Verify the relationship
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='podcast_comments';
