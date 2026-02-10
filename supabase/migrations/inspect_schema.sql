-- Run this query to inspect your table schemas
-- This will show you the actual column names

-- Check marketplaceItems columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketplaceItems'
ORDER BY ordinal_position;

-- Check accommodations columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'accommodations'
ORDER BY ordinal_position;

-- Check podcasts columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'podcasts'
ORDER BY ordinal_position;

-- Check podcast_comments columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'podcast_comments'
ORDER BY ordinal_position;

-- Check profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check chats columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chats'
ORDER BY ordinal_position;

-- Check messages columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;
