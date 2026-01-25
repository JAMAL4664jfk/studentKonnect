-- Clean up invalid podcast comments and add sample comments with valid user IDs

-- Step 1: Delete all comments with invalid user_id references
DELETE FROM podcast_comments 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Step 2: Delete all comment likes for non-existent comments
DELETE FROM podcast_comment_likes
WHERE comment_id NOT IN (SELECT id FROM podcast_comments);

-- Step 3: Get a valid user ID to use for sample comments
DO $$
DECLARE
  v_user_id UUID;
  v_podcast_id UUID;
  v_comment_id UUID;
BEGIN
  -- Get first user from profiles
  SELECT id INTO v_user_id FROM profiles ORDER BY created_at LIMIT 1;
  
  -- Get first podcast
  SELECT id INTO v_podcast_id FROM podcasts ORDER BY created_at DESC LIMIT 1;
  
  -- Only proceed if we have a valid user
  IF v_user_id IS NOT NULL AND v_podcast_id IS NOT NULL THEN
    -- Add sample comments
    INSERT INTO podcast_comments (podcast_id, user_id, content, parent_id, likes_count, created_at)
    VALUES
      (v_podcast_id, v_user_id, 'Great episode! Really enjoyed the insights shared here.', NULL, 5, NOW() - INTERVAL '2 days'),
      (v_podcast_id, v_user_id, 'This was so helpful, thank you for sharing!', NULL, 3, NOW() - INTERVAL '1 day'),
      (v_podcast_id, v_user_id, 'Looking forward to the next episode!', NULL, 2, NOW() - INTERVAL '12 hours');
    
    -- Add a reply to the first comment
    INSERT INTO podcast_comments (podcast_id, user_id, content, parent_id, likes_count, created_at)
    SELECT v_podcast_id, v_user_id, 'Thanks for watching! More content coming soon.', id, 1, NOW() - INTERVAL '1 day'
    FROM podcast_comments 
    WHERE podcast_id = v_podcast_id AND parent_id IS NULL 
    LIMIT 1;
    
    RAISE NOTICE 'Sample comments added successfully';
  ELSE
    RAISE NOTICE 'No valid user or podcast found. Please create a user profile first.';
  END IF;
END $$;

-- Step 4: Update comment counts
UPDATE podcasts p
SET comments_count = (
  SELECT COUNT(*) 
  FROM podcast_comments c 
  WHERE c.podcast_id = p.id
);

-- Verify
SELECT 
  p.title,
  p.comments_count,
  COUNT(c.id) as actual_comments
FROM podcasts p
LEFT JOIN podcast_comments c ON c.podcast_id = p.id
GROUP BY p.id, p.title, p.comments_count
LIMIT 5;
