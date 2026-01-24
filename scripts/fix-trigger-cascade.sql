-- Step 1: Drop the old trigger function with CASCADE to remove all dependent triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 2: Create corrected trigger function with camelCase
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Recreate all triggers with correct function
CREATE TRIGGER update_accommodations_updated_at
  BEFORE UPDATE ON accommodations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplaceitems_updated_at
  BEFORE UPDATE ON "marketplaceItems"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewardcatalog_updated_at
  BEFORE UPDATE ON "rewardCatalog"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_groups_updated_at
  BEFORE UPDATE ON chat_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at
  BEFORE UPDATE ON group_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Now update accommodations with Rands and images
UPDATE accommodations SET 
  price = 21600.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]'
WHERE title = 'Modern Studio Near Campus';

UPDATE accommodations SET 
  price = 14400.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'
WHERE title = 'Shared Apartment';

UPDATE accommodations SET 
  price = 11700.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"]'
WHERE title = 'Private Room in Student House';

-- Step 5: Update marketplace items with Rands and images
UPDATE "marketplaceItems" SET 
  price = 2160.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800"]'
WHERE title = 'Calculus & Physics Textbooks';

UPDATE "marketplaceItems" SET 
  price = 13500.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"]'
WHERE title = 'MacBook Air M1 - Like New';

UPDATE "marketplaceItems" SET 
  price = 810.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800"]'
WHERE title = 'Wooden Study Desk Chair';

UPDATE "marketplaceItems" SET 
  price = 1440.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800"]'
WHERE title = 'Modern Desk Chair - Ergonomic';

-- Step 6: Verify updates
SELECT id, title, price, currency, 
  CASE WHEN images IS NOT NULL THEN 'Has images ✓' ELSE 'No images' END as image_status
FROM accommodations
ORDER BY id;

SELECT id, title, price, currency,
  CASE WHEN images IS NOT NULL THEN 'Has images ✓' ELSE 'No images' END as image_status
FROM "marketplaceItems"
ORDER BY id;
