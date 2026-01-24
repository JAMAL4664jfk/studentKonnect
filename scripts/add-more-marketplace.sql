-- Add 20 more diverse marketplace listings with images and realistic ZAR prices

-- Textbooks and Academic Materials
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured") VALUES
(1, 'Engineering Mathematics Textbook Set', 'Complete set of engineering math textbooks for 1st and 2nd year. Excellent condition with minimal highlighting.', 'books', 'like-new', 1800.00, 'ZAR', '["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800"]', 'Stellenbosch', true, false),

(2, 'Medical Anatomy Atlas - Gray''s', 'Latest edition of Gray''s Anatomy. Perfect for medical students. Some notes in margins.', 'books', 'good', 2500.00, 'ZAR', '["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800"]', 'Cape Town', true, true),

(1, 'Business Studies Textbook Bundle', '5 textbooks for BCom students: Accounting, Economics, Stats, Business Law, and Marketing.', 'books', 'good', 3200.00, 'ZAR', '["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800"]', 'Johannesburg', true, false),

(2, 'Programming Books - Python & Java', 'Learn Python the Hard Way + Java Programming for Beginners. Great condition.', 'books', 'like-new', 950.00, 'ZAR', '["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"]', 'Pretoria', true, false);

-- Electronics
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured") VALUES
(1, 'iPad Air 2022 - 64GB WiFi', 'Perfect for note-taking and reading. Includes Apple Pencil and case. 1 year old, excellent condition.', 'electronics', 'like-new', 8500.00, 'ZAR', '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1585790050230-5dd28404f869?w=800"]', 'Stellenbosch', true, true),

(2, 'HP Laptop - i5, 8GB RAM, 256GB SSD', 'Great student laptop. Fast and reliable. Perfect for assignments and research. Charger included.', 'electronics', 'good', 6800.00, 'ZAR', '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]', 'Cape Town', true, true),

(1, 'Scientific Calculator - Casio FX-991', 'Essential for engineering and science students. Like new, barely used.', 'electronics', 'like-new', 450.00, 'ZAR', '["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800"]', 'Johannesburg', true, false),

(2, 'Noise-Cancelling Headphones - Sony', 'Perfect for studying in noisy environments. Great battery life. Minor wear on ear pads.', 'electronics', 'good', 2200.00, 'ZAR', '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"]', 'Pretoria', true, false),

(1, 'Portable Bluetooth Speaker', 'JBL Flip 5. Great sound quality. Perfect for dorm rooms or outdoor study sessions.', 'electronics', 'like-new', 1350.00, 'ZAR', '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"]', 'Stellenbosch', true, false),

(2, 'Samsung Galaxy Tab S6 Lite', 'Includes S Pen. Perfect for digital note-taking. 64GB storage. Protective case included.', 'electronics', 'good', 4500.00, 'ZAR', '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', 'Cape Town', true, true);

-- Furniture
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured") VALUES
(1, 'Study Desk with Drawers - White', 'Spacious study desk with 3 drawers. Perfect for student room. Sturdy and in great condition.', 'furniture', 'good', 1200.00, 'ZAR', '["https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800"]', 'Stellenbosch', true, false),

(2, 'Bookshelf - 5 Tier Wooden', 'Tall bookshelf perfect for textbooks and storage. Easy to assemble. Solid wood construction.', 'furniture', 'good', 850.00, 'ZAR', '["https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800"]', 'Cape Town', true, false),

(1, 'Single Bed with Mattress', 'Comfortable single bed with good quality mattress. Perfect for student accommodation.', 'furniture', 'good', 2500.00, 'ZAR', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"]', 'Johannesburg', true, false),

(2, 'Mini Fridge - Bar Fridge', 'Compact fridge perfect for dorm rooms. Energy efficient. Keeps drinks and snacks cold.', 'furniture', 'like-new', 1800.00, 'ZAR', '["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800"]', 'Pretoria', true, false),

(1, 'Desk Lamp - LED Adjustable', 'Bright LED desk lamp with adjustable arm. Perfect for late-night study sessions. USB charging port.', 'furniture', 'new', 380.00, 'ZAR', '["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"]', 'Stellenbosch', true, false);

-- Clothing and Sports
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured") VALUES
(1, 'University Hoodie - Size M', 'Official university merchandise. Warm and comfortable. Barely worn.', 'clothing', 'like-new', 420.00, 'ZAR', '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"]', 'Stellenbosch', true, false),

(2, 'Running Shoes - Nike Size 9', 'Great for jogging or gym. Comfortable and supportive. Light wear on soles.', 'sports', 'good', 950.00, 'ZAR', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"]', 'Cape Town', true, false),

(1, 'Gym Bag - Adidas Duffel', 'Spacious gym bag with multiple compartments. Perfect for sports or weekend trips.', 'sports', 'like-new', 550.00, 'ZAR', '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]', 'Johannesburg', true, false),

(2, 'Yoga Mat with Carrying Strap', 'Thick, non-slip yoga mat. Great for yoga, pilates, or home workouts. Easy to carry.', 'sports', 'like-new', 320.00, 'ZAR', '["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"]', 'Pretoria', true, false);

-- Services
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured") VALUES
(1, 'Math Tutoring - Calculus & Stats', 'Experienced tutor offering help with calculus, statistics, and linear algebra. R250/hour.', 'services', 'new', 250.00, 'ZAR', '["https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800"]', 'Stellenbosch', true, true),

(2, 'Essay Editing & Proofreading', 'Professional editing services for essays, theses, and assignments. Quick turnaround.', 'services', 'new', 180.00, 'ZAR', '["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"]', 'Cape Town', true, false);

-- Verify insertions
SELECT COUNT(*) as total_marketplace_items FROM "marketplaceItems";
SELECT category, COUNT(*) as count FROM "marketplaceItems" GROUP BY category ORDER BY count DESC;
SELECT location, COUNT(*) as count FROM "marketplaceItems" WHERE location IS NOT NULL GROUP BY location ORDER BY count DESC;
