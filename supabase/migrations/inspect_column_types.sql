-- Inspect column types for marketplaceItems and accommodations
-- Run this in Supabase SQL Editor to see actual column types

-- Check marketplaceItems columns
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'marketplaceItems'
ORDER BY ordinal_position;

-- Check accommodations columns
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'accommodations'
ORDER BY ordinal_position;

-- Check profiles.id type for reference
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'id';
