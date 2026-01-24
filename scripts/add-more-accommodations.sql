-- Add 20 more diverse accommodation listings with images and realistic ZAR prices

-- Stellenbosch accommodations (near university)
INSERT INTO accommodations ("userId", title, description, address, city, country, price, currency, "propertyType", bedrooms, bathrooms, amenities, images, "availableFrom", "isAvailable") VALUES
(1, 'Cozy Studio in Stellenbosch Central', 'Bright studio apartment perfect for students. Walking distance to campus, shops, and restaurants. Includes WiFi, kitchen, and parking.', '12 Dorp Street', 'Stellenbosch', 'South Africa', 9500.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Kitchen", "Parking", "Furnished", "Security"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]', NOW(), true),

(1, 'Spacious 2-Bedroom Near Maties', 'Beautiful apartment with mountain views. Close to Stellenbosch University. Modern finishes, secure parking, and fiber internet.', '45 Victoria Street', 'Stellenbosch', 'South Africa', 16800.00, 'ZAR', 'apartment', 2, 1, '["WiFi", "Mountain View", "Parking", "Furnished", "Security", "Garden"]', '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', NOW(), true),

(2, 'Student Room in Shared House - Die Boord', 'Affordable room in friendly student house. Shared kitchen and lounge. 10 min walk to campus. All utilities included.', '23 Merriman Avenue', 'Stellenbosch', 'South Africa', 5200.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Laundry", "Garden", "Parking"]', '["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"]', NOW(), true),

(2, 'Modern Bachelor Pad - Technopark', 'Brand new bachelor apartment in secure complex. Gym, pool, and 24/7 security. Perfect for postgrad students.', '8 Techno Avenue', 'Stellenbosch', 'South Africa', 8900.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Gym", "Pool", "Security", "Parking", "Air Conditioning"]', '["https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800", "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800"]', NOW(), true),

(1, 'Luxury 3-Bed Townhouse - Paradyskloof', 'Stunning townhouse with views. Perfect for sharing. 3 bedrooms, 2.5 bathrooms, double garage, and private garden.', '156 Paradyskloof Road', 'Stellenbosch', 'South Africa', 24000.00, 'ZAR', 'house', 3, 2, '["WiFi", "Mountain View", "Garden", "Parking", "Furnished", "Security", "Pet Friendly"]', '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]', NOW(), true);

-- Cape Town accommodations (UCT, UWC areas)
INSERT INTO accommodations ("userId", title, description, address, city, country, price, currency, "propertyType", bedrooms, bathrooms, amenities, images, "availableFrom", "isAvailable") VALUES
(1, 'Sea View Studio - Rondebosch', 'Compact studio with partial sea views. Close to UCT. Secure building with laundry facilities.', '78 Main Road', 'Cape Town', 'South Africa', 10500.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Sea View", "Security", "Laundry", "Parking"]', '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]', NOW(), true),

(2, 'Affordable Room Near UWC', 'Clean room in shared student accommodation. Walking distance to UWC. Includes WiFi and utilities.', '34 Robert Sobukwe Road', 'Cape Town', 'South Africa', 4800.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Security", "Study Area"]', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"]', NOW(), true),

(1, '2-Bed Apartment - Observatory', 'Trendy apartment in vibrant Observatory. Close to UCT shuttle route. Restaurants and cafes nearby.', '12 Lower Main Road', 'Cape Town', 'South Africa', 15600.00, 'ZAR', 'apartment', 2, 1, '["WiFi", "Furnished", "Security", "Balcony", "Parking"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800"]', NOW(), true),

(2, 'Luxury Student Digs - Claremont', 'Premium student accommodation with all amenities. Study rooms, gym, pool, and 24/7 security.', '45 Protea Road', 'Cape Town', 'South Africa', 12800.00, 'ZAR', 'dormitory', 1, 1, '["WiFi", "Gym", "Pool", "Security", "Study Room", "Laundry", "Cleaning Service"]', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"]', NOW(), true),

(1, 'Charming Cottage - Newlands', 'Private cottage in quiet area. Perfect for postgrad or mature student. Garden and parking included.', '89 Kildare Road', 'Cape Town', 'South Africa', 13500.00, 'ZAR', 'house', 2, 1, '["WiFi", "Garden", "Parking", "Pet Friendly", "Furnished", "Quiet Area"]', '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"]', NOW(), true);

-- Johannesburg accommodations (Wits, UJ areas)
INSERT INTO accommodations ("userId", title, description, address, city, country, price, currency, "propertyType", bedrooms, bathrooms, amenities, images, "availableFrom", "isAvailable") VALUES
(1, 'Modern Studio - Braamfontein', 'Walking distance to Wits University. Secure building with 24/7 security. Fiber internet included.', '23 Jorissen Street', 'Johannesburg', 'South Africa', 8500.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Security", "Furnished", "Parking", "Study Desk"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', NOW(), true),

(2, 'Shared Room - Melville', 'Budget-friendly shared accommodation. Vibrant student area with cafes and nightlife. 15 min to Wits.', '67 7th Street', 'Johannesburg', 'South Africa', 3800.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Laundry", "Study Area"]', '["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"]', NOW(), true),

(1, '3-Bed Apartment - Parktown', 'Spacious apartment perfect for sharing. Close to Wits Medical School. Secure complex with gym.', '12 Empire Road', 'Johannesburg', 'South Africa', 19500.00, 'ZAR', 'apartment', 3, 2, '["WiFi", "Gym", "Security", "Parking", "Balcony", "City View"]', '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', NOW(), true),

(2, 'Student Res - Auckland Park', 'Purpose-built student residence near UJ. All-inclusive rent with meals, WiFi, and cleaning.', '45 University Road', 'Johannesburg', 'South Africa', 11200.00, 'ZAR', 'dormitory', 1, 1, '["WiFi", "Meals Included", "Security", "Study Room", "Gym", "Laundry", "Cleaning Service"]', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"]', NOW(), true),

(1, 'Bachelor Flat - Greenside', 'Cozy bachelor in trendy Greenside. Close to UJ and Wits. Parking and prepaid electricity.', '34 Gleneagles Road', 'Johannesburg', 'South Africa', 7800.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Parking", "Security", "Kitchen", "Furnished"]', '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]', NOW(), true);

-- Pretoria accommodations (UP, TUT areas)
INSERT INTO accommodations ("userId", title, description, address, city, country, price, currency, "propertyType", bedrooms, bathrooms, amenities, images, "availableFrom", "isAvailable") VALUES
(1, 'Room Near Tuks - Hatfield', 'Walking distance to UP main campus. Shared house with 4 other students. Safe and friendly environment.', '78 Hilda Street', 'Pretoria', 'South Africa', 5500.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Security", "Parking", "Study Area"]', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"]', NOW(), true),

(2, '2-Bed Apartment - Lynnwood', 'Modern apartment in upmarket area. Close to UP and shopping centers. Fiber and DSTV included.', '23 Lynnwood Road', 'Pretoria', 'South Africa', 14500.00, 'ZAR', 'apartment', 2, 1, '["WiFi", "DSTV", "Security", "Parking", "Pool", "Gym"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800"]', NOW(), true),

(1, 'Student Digs - Sunnyside', 'Affordable accommodation near TUT. Secure building with study facilities and common areas.', '156 Esselen Street', 'Pretoria', 'South Africa', 6200.00, 'ZAR', 'dormitory', 1, 1, '["WiFi", "Security", "Study Room", "Laundry", "Common Kitchen"]', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"]', NOW(), true),

(2, 'Luxury Townhouse - Menlyn', 'High-end townhouse for sharing. 3 bedrooms, 2.5 bathrooms. Gym, pool, and 24/7 security.', '45 Atterbury Road', 'Pretoria', 'South Africa', 22000.00, 'ZAR', 'house', 3, 2, '["WiFi", "Gym", "Pool", "Security", "Parking", "Garden", "Air Conditioning"]', '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]', NOW(), true),

(1, 'Bachelor Studio - Brooklyn', 'Neat studio in popular student area. Close to UP and restaurants. Prepaid utilities.', '89 Brooklyn Road', 'Pretoria', 'South Africa', 7500.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Kitchen", "Parking", "Security", "Furnished"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', NOW(), true);

-- Verify insertions
SELECT COUNT(*) as total_accommodations FROM accommodations;
SELECT city, COUNT(*) as count FROM accommodations GROUP BY city ORDER BY count DESC;
