-- Comprehensive marketplace listings with verified Unsplash images
-- 25 diverse items across all categories

-- Textbooks and Academic Materials (6 items)
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured", views) VALUES
(1, 'Engineering Mathematics Complete Set', 'Full set of engineering math textbooks for 1st and 2nd year. Excellent condition with minimal highlighting. Includes solutions manual.', 'books', 'like-new', 1850.00, 'ZAR', '["https://images.unsplash.com/photo-1495446815901-a7297e633e8d"]', 'Stellenbosch', true, false, 15),

(2, 'Medical Anatomy - Gray''s Atlas', 'Latest edition of Gray''s Anatomy. Essential for medical students. Some notes in margins but very clean.', 'books', 'good', 2600.00, 'ZAR', '["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"]', 'Cape Town', true, true, 42),

(1, 'Business Studies Bundle - BCom', '5 textbooks: Accounting, Economics, Statistics, Business Law, and Marketing. Perfect for BCom students.', 'books', 'good', 3300.00, 'ZAR', '["https://images.unsplash.com/photo-1481627834876-b7833e8f5570"]', 'Johannesburg', true, false, 28),

(2, 'Programming Books - Python & Java', 'Learn Python the Hard Way + Java Programming for Beginners. Great condition, barely used.', 'books', 'like-new', 980.00, 'ZAR', '["https://images.unsplash.com/photo-1532012197267-da84d127e765"]', 'Pretoria', true, false, 19),

(1, 'Law Textbooks - 2nd Year Set', 'Complete set of 2nd year LLB textbooks. Constitutional Law, Criminal Law, and more. Excellent condition.', 'books', 'like-new', 4200.00, 'ZAR', '["https://images.unsplash.com/photo-1505664194779-8beaceb93744"]', 'Stellenbosch', true, true, 31),

(2, 'Chemistry Lab Manual & Textbook', 'Organic Chemistry textbook with lab manual. Perfect for science students. Minimal wear.', 'books', 'good', 1450.00, 'ZAR', '["https://images.unsplash.com/photo-1532094349884-543bc11b234d"]', 'Cape Town', true, false, 12);

-- Electronics (8 items)
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured", views) VALUES
(1, 'iPad Air 2022 - 64GB with Pencil', 'Perfect for note-taking and reading. Includes Apple Pencil and protective case. 1 year old, excellent condition.', 'electronics', 'like-new', 8800.00, 'ZAR', '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0", "https://images.unsplash.com/photo-1585790050230-5dd28404f869"]', 'Stellenbosch', true, true, 67),

(2, 'HP Laptop - i5, 8GB RAM, 256GB SSD', 'Great student laptop. Fast and reliable for assignments and research. Charger and mouse included.', 'electronics', 'good', 7200.00, 'ZAR', '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"]', 'Cape Town', true, true, 89),

(1, 'Casio Scientific Calculator FX-991', 'Essential for engineering and science students. Like new, barely used. Original packaging included.', 'electronics', 'like-new', 470.00, 'ZAR', '["https://images.unsplash.com/photo-1611532736597-de2d4265fba3"]', 'Johannesburg', true, false, 23),

(2, 'Sony Noise-Cancelling Headphones', 'WH-1000XM4. Perfect for studying in noisy environments. Great battery life. Minor wear on ear pads.', 'electronics', 'good', 2400.00, 'ZAR', '["https://images.unsplash.com/photo-1546435770-a3e426bf472b"]', 'Pretoria', true, false, 45),

(1, 'JBL Portable Bluetooth Speaker', 'JBL Flip 5. Great sound quality. Perfect for dorm rooms or outdoor study sessions. Waterproof.', 'electronics', 'like-new', 1400.00, 'ZAR', '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1"]', 'Stellenbosch', true, false, 18),

(2, 'Samsung Galaxy Tab S6 Lite + S Pen', 'Perfect for digital note-taking. 64GB storage. Protective case and screen protector included.', 'electronics', 'good', 4700.00, 'ZAR', '["https://images.unsplash.com/photo-1561154464-82e9adf32764"]', 'Cape Town', true, true, 52),

(1, 'Dell Monitor 24" Full HD', 'Perfect second screen for studying. 1080p resolution. HDMI and VGA cables included.', 'electronics', 'good', 1850.00, 'ZAR', '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"]', 'Johannesburg', true, false, 34),

(2, 'Wireless Mouse and Keyboard Combo', 'Logitech wireless set. Perfect for laptop users. Long battery life. Barely used.', 'electronics', 'like-new', 550.00, 'ZAR', '["https://images.unsplash.com/photo-1587829741301-dc798b83add3"]', 'Pretoria', true, false, 16);

-- Furniture (6 items)
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured", views) VALUES
(1, 'White Study Desk with Drawers', 'Spacious study desk with 3 drawers. Perfect for student room. Sturdy and in great condition.', 'furniture', 'good', 1250.00, 'ZAR', '["https://images.unsplash.com/photo-1595428774223-ef52624120d2"]', 'Stellenbosch', true, false, 29),

(2, 'Wooden Bookshelf - 5 Tier', 'Tall bookshelf perfect for textbooks and storage. Easy to assemble. Solid wood construction.', 'furniture', 'good', 880.00, 'ZAR', '["https://images.unsplash.com/photo-1594620302200-9a762244a156"]', 'Cape Town', true, false, 21),

(1, 'Single Bed with Mattress', 'Comfortable single bed with good quality mattress. Perfect for student accommodation. Clean and hygienic.', 'furniture', 'good', 2600.00, 'ZAR', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"]', 'Johannesburg', true, false, 38),

(2, 'Mini Fridge - Bar Fridge 50L', 'Compact fridge perfect for dorm rooms. Energy efficient. Keeps drinks and snacks cold. Quiet operation.', 'furniture', 'like-new', 1900.00, 'ZAR', '["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5"]', 'Pretoria', true, false, 27),

(1, 'LED Desk Lamp - Adjustable', 'Bright LED desk lamp with adjustable arm. Perfect for late-night study sessions. USB charging port included.', 'furniture', 'new', 390.00, 'ZAR', '["https://images.unsplash.com/photo-1507473885765-e6ed057f782c"]', 'Stellenbosch', true, false, 14),

(2, 'Ergonomic Office Chair', 'Comfortable office chair with lumbar support. Adjustable height and armrests. Perfect for long study sessions.', 'furniture', 'good', 1650.00, 'ZAR', '["https://images.unsplash.com/photo-1580480055273-228ff5388ef8"]', 'Cape Town', true, true, 41);

-- Clothing and Accessories (2 items)
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured", views) VALUES
(1, 'University Hoodie - Size M', 'Official university merchandise. Warm and comfortable. Barely worn, like new condition.', 'clothing', 'like-new', 450.00, 'ZAR', '["https://images.unsplash.com/photo-1556821840-3a63f95609a7"]', 'Stellenbosch', true, false, 19),

(2, 'Backpack - Laptop Compartment', 'Durable backpack with padded laptop compartment. Multiple pockets. Perfect for daily campus use.', 'clothing', 'good', 620.00, 'ZAR', '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62"]', 'Cape Town', true, false, 25);

-- Sports Equipment (3 items)
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured", views) VALUES
(1, 'Nike Running Shoes - Size 9', 'Great for jogging or gym. Comfortable and supportive. Light wear on soles but lots of life left.', 'sports', 'good', 980.00, 'ZAR', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff"]', 'Cape Town', true, false, 32),

(2, 'Adidas Gym Duffel Bag', 'Spacious gym bag with multiple compartments. Perfect for sports or weekend trips. Barely used.', 'sports', 'like-new', 580.00, 'ZAR', '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62"]', 'Johannesburg', true, false, 17),

(1, 'Yoga Mat with Carrying Strap', 'Thick, non-slip yoga mat. Great for yoga, pilates, or home workouts. Easy to carry and store.', 'sports', 'like-new', 340.00, 'ZAR', '["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f"]', 'Pretoria', true, false, 22);

-- Services (2 items)
INSERT INTO "marketplaceItems" ("userId", title, description, category, condition, price, currency, images, location, "isAvailable", "isFeatured", views) VALUES
(1, 'Math Tutoring - Calculus & Stats', 'Experienced tutor offering help with calculus, statistics, and linear algebra. R280 per hour. Flexible schedule.', 'services', 'new', 280.00, 'ZAR', '["https://images.unsplash.com/photo-1509228468518-180dd4864904"]', 'Stellenbosch', true, true, 58),

(2, 'Essay Editing & Proofreading', 'Professional editing services for essays, theses, and assignments. Quick turnaround. R200 per 1000 words.', 'services', 'new', 200.00, 'ZAR', '["https://images.unsplash.com/photo-1455390582262-044cdead277a"]', 'Cape Town', true, false, 36);

-- Summary queries
SELECT 
  category, 
  COUNT(*) as count,
  ROUND(AVG(price::numeric), 2) as avg_price,
  SUM(views) as total_views
FROM "marketplaceItems" 
GROUP BY category
ORDER BY count DESC;

SELECT 
  location, 
  COUNT(*) as count
FROM "marketplaceItems" 
WHERE location IS NOT NULL
GROUP BY location
ORDER BY count DESC;
