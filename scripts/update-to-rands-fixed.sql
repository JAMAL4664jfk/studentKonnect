-- Update all accommodation prices to use ZAR (Rands) and add images
-- Note: Prices converted from USD to ZAR (approx 18:1 ratio)
-- Using "updatedAt" (camelCase) instead of "updated_at"

-- Update accommodations with Rands and images
UPDATE accommodations SET 
  price = 21600.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]',
  "updatedAt" = NOW()
WHERE title = 'Modern Studio Near Campus';

UPDATE accommodations SET 
  price = 14400.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]',
  "updatedAt" = NOW()
WHERE title = 'Shared Apartment';

UPDATE accommodations SET 
  price = 11700.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"]',
  "updatedAt" = NOW()
WHERE title = 'Private Room in Student House';

-- Update marketplace items with Rands and images
UPDATE "marketplaceItems" SET 
  price = 2160.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800"]',
  "updatedAt" = NOW()
WHERE title = 'Calculus & Physics Textbooks';

UPDATE "marketplaceItems" SET 
  price = 13500.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"]',
  "updatedAt" = NOW()
WHERE title = 'MacBook Air M1 - Like New';

UPDATE "marketplaceItems" SET 
  price = 810.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800"]',
  "updatedAt" = NOW()
WHERE title = 'Wooden Study Desk Chair';

UPDATE "marketplaceItems" SET 
  price = 1440.00,
  currency = 'ZAR',
  images = '["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800"]',
  "updatedAt" = NOW()
WHERE title = 'Modern Desk Chair - Ergonomic';

-- Verify updates
SELECT id, title, price, currency, images FROM accommodations;
SELECT id, title, price, currency, images FROM "marketplaceItems";
