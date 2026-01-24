-- Comprehensive accommodation listings with verified Unsplash images
-- 25 diverse listings across major South African student cities

-- Stellenbosch Area (8 listings)
INSERT INTO accommodations ("userId", title, description, address, city, country, price, currency, "propertyType", bedrooms, bathrooms, amenities, images, "availableFrom", "isAvailable") VALUES
(1, 'Modern Loft Studio - Stellenbosch Central', 'Stylish loft studio with high ceilings and natural light. 5 min walk to campus. Includes WiFi, kitchen, and secure parking. Perfect for single student.', '15 Bird Street', 'Stellenbosch', 'South Africa', 9800.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Kitchen", "Parking", "Furnished", "Security", "High Ceilings"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]', NOW(), true),

(1, 'Spacious 2-Bed with Mountain Views', 'Beautiful apartment overlooking Stellenbosch mountains. Modern kitchen, fiber internet, and secure parking. Close to Maties campus.', '45 Victoria Street', 'Stellenbosch', 'South Africa', 17200.00, 'ZAR', 'apartment', 2, 2, '["WiFi", "Mountain View", "Parking", "Furnished", "Security", "Garden", "Balcony"]', '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]', NOW(), true),

(2, 'Affordable Room - Die Boord Area', 'Clean room in friendly student house. Shared kitchen and lounge. 10 min walk to campus. All utilities included in rent.', '23 Merriman Avenue', 'Stellenbosch', 'South Africa', 5400.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Laundry", "Garden", "Parking", "Study Area"]', '["https://images.unsplash.com/photo-1540518614846-7eded433c457", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"]', NOW(), true),

(1, 'Luxury Bachelor - Technopark', 'Brand new bachelor in secure complex. Gym, pool, 24/7 security. Perfect for postgrad students. Modern finishes throughout.', '8 Techno Avenue', 'Stellenbosch', 'South Africa', 9200.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Gym", "Pool", "Security", "Parking", "Air Conditioning", "Modern"]', '["https://images.unsplash.com/photo-1502672023488-70e25813eb80", "https://images.unsplash.com/photo-1536376072261-38c75010e6c9"]', NOW(), true),

(2, '3-Bed Townhouse - Paradyskloof', 'Stunning townhouse with mountain views. Perfect for sharing. 3 bedrooms, 2.5 bathrooms, double garage, private garden.', '156 Paradyskloof Road', 'Stellenbosch', 'South Africa', 24500.00, 'ZAR', 'house', 3, 2, '["WiFi", "Mountain View", "Garden", "Parking", "Furnished", "Security", "Pet Friendly", "Braai Area"]', '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"]', NOW(), true),

(1, 'Cozy Garden Cottage', 'Private cottage with garden entrance. Quiet area perfect for studying. Walking distance to shops and campus.', '67 Andringa Street', 'Stellenbosch', 'South Africa', 8500.00, 'ZAR', 'house', 1, 1, '["WiFi", "Garden", "Parking", "Furnished", "Quiet", "Pet Friendly"]', '["https://images.unsplash.com/photo-1568605114967-8130f3a36994", "https://images.unsplash.com/photo-1570129477492-45c003edd2be"]', NOW(), true),

(2, 'Student Apartment - Crozier Street', 'Affordable 2-bed apartment. Perfect for sharing. Close to university and town center. Secure building.', '34 Crozier Street', 'Stellenbosch', 'South Africa', 13800.00, 'ZAR', 'apartment', 2, 1, '["WiFi", "Furnished", "Security", "Parking", "Kitchen"]', '["https://images.unsplash.com/photo-1493809842364-78817add7ffb", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]', NOW(), true),

(1, 'Penthouse Studio - Stellenbosch', 'Top floor studio with panoramic views. Modern finishes, open plan living. Gym and pool in complex.', '12 Banghoek Road', 'Stellenbosch', 'South Africa', 11500.00, 'ZAR', 'studio', 1, 1, '["WiFi", "City View", "Gym", "Pool", "Security", "Parking", "Modern", "Balcony"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688", "https://images.unsplash.com/photo-1560448204-603b3fc33ddc"]', NOW(), true);

-- Cape Town Area (9 listings)
INSERT INTO accommodations ("userId", title, description, address, city, country, price, currency, "propertyType", bedrooms, bathrooms, amenities, images, "availableFrom", "isAvailable") VALUES
(1, 'Sea Point Studio - Ocean Views', 'Stunning studio with ocean views. Walking distance to promenade. Secure building with gym.', '78 Beach Road', 'Cape Town', 'South Africa', 12500.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Sea View", "Security", "Gym", "Parking", "Modern"]', '["https://images.unsplash.com/photo-1493809842364-78817add7ffb", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]', NOW(), true),

(2, 'Budget Room Near UWC', 'Clean, affordable room in shared student house. Walking distance to UWC. Includes WiFi and all utilities.', '34 Robert Sobukwe Road', 'Cape Town', 'South Africa', 4900.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Security", "Study Area", "Laundry"]', '["https://images.unsplash.com/photo-1540518614846-7eded433c457", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"]', NOW(), true),

(1, 'Observatory 2-Bed Apartment', 'Trendy apartment in vibrant Observatory. Close to UCT shuttle. Restaurants and cafes at your doorstep.', '12 Lower Main Road', 'Cape Town', 'South Africa', 16200.00, 'ZAR', 'apartment', 2, 1, '["WiFi", "Furnished", "Security", "Balcony", "Parking", "Trendy Area"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1560448204-603b3fc33ddc"]', NOW(), true),

(2, 'Premium Student Res - Claremont', 'All-inclusive student accommodation. Study rooms, gym, pool, 24/7 security. Meals available.', '45 Protea Road', 'Cape Town', 'South Africa', 13200.00, 'ZAR', 'dormitory', 1, 1, '["WiFi", "Gym", "Pool", "Security", "Study Room", "Laundry", "Cleaning Service", "Meals Available"]', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"]', NOW(), true),

(1, 'Newlands Garden Cottage', 'Charming cottage in quiet Newlands. Perfect for postgrad or mature student. Private garden and parking.', '89 Kildare Road', 'Cape Town', 'South Africa', 14000.00, 'ZAR', 'house', 2, 1, '["WiFi", "Garden", "Parking", "Pet Friendly", "Furnished", "Quiet Area", "Braai"]', '["https://images.unsplash.com/photo-1568605114967-8130f3a36994", "https://images.unsplash.com/photo-1570129477492-45c003edd2be"]', NOW(), true),

(2, 'Rondebosch Bachelor Flat', 'Neat bachelor close to UCT. Secure building with laundry facilities. Prepaid electricity.', '23 Main Road', 'Cape Town', 'South Africa', 8800.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Security", "Laundry", "Parking", "Kitchen", "Furnished"]', '["https://images.unsplash.com/photo-1502672023488-70e25813eb80", "https://images.unsplash.com/photo-1493809842364-78817add7ffb"]', NOW(), true),

(1, 'Mowbray Shared House - 4 Rooms', 'Large house with 4 bedrooms. Shared kitchen and lounge. Close to UCT and Groote Schuur Hospital.', '56 Station Road', 'Cape Town', 'South Africa', 6200.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Garden", "Parking", "Study Area", "Laundry"]', '["https://images.unsplash.com/photo-1540518614846-7eded433c457", "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"]', NOW(), true),

(2, 'Camps Bay Luxury Apartment', 'Upmarket 2-bed apartment with sea views. Perfect for sharing. Pool, gym, and 24/7 security.', '12 Victoria Road', 'Cape Town', 'South Africa', 28000.00, 'ZAR', 'apartment', 2, 2, '["WiFi", "Sea View", "Pool", "Gym", "Security", "Parking", "Luxury", "Balcony"]', '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]', NOW(), true),

(1, 'Woodstock Creative Loft', 'Industrial loft in trendy Woodstock. High ceilings, exposed brick. Close to CPUT and city center.', '45 Albert Road', 'Cape Town', 'South Africa', 10500.00, 'ZAR', 'studio', 1, 1, '["WiFi", "High Ceilings", "Parking", "Security", "Trendy Area", "Modern"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688", "https://images.unsplash.com/photo-1536376072261-38c75010e6c9"]', NOW(), true);

-- Johannesburg Area (5 listings)
INSERT INTO accommodations ("userId", title, description, address, city, country, price, currency, "propertyType", bedrooms, bathrooms, amenities, images, "availableFrom", "isAvailable") VALUES
(1, 'Braamfontein Modern Studio', 'Walking distance to Wits University. Secure building with fiber internet. Perfect for serious students.', '23 Jorissen Street', 'Johannesburg', 'South Africa', 8800.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Security", "Furnished", "Parking", "Study Desk", "Modern"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688", "https://images.unsplash.com/photo-1502672023488-70e25813eb80"]', NOW(), true),

(2, 'Melville Shared Room', 'Budget-friendly shared accommodation. Vibrant area with cafes and nightlife. 15 min to Wits.', '67 7th Street', 'Johannesburg', 'South Africa', 3900.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Laundry", "Study Area", "Trendy Area"]', '["https://images.unsplash.com/photo-1540518614846-7eded433c457", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"]', NOW(), true),

(1, 'Parktown 3-Bed Apartment', 'Spacious apartment perfect for sharing. Close to Wits Medical School. Gym and pool in complex.', '12 Empire Road', 'Johannesburg', 'South Africa', 20000.00, 'ZAR', 'apartment', 3, 2, '["WiFi", "Gym", "Security", "Parking", "Balcony", "City View", "Pool"]', '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]', NOW(), true),

(2, 'UJ Student Residence - Auckland Park', 'Purpose-built student res near UJ. All-inclusive with meals, WiFi, and cleaning service.', '45 University Road', 'Johannesburg', 'South Africa', 11500.00, 'ZAR', 'dormitory', 1, 1, '["WiFi", "Meals Included", "Security", "Study Room", "Gym", "Laundry", "Cleaning Service"]', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"]', NOW(), true),

(1, 'Greenside Bachelor Flat', 'Cozy bachelor in trendy Greenside. Close to both UJ and Wits. Parking and prepaid electricity.', '34 Gleneagles Road', 'Johannesburg', 'South Africa', 8100.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Parking", "Security", "Kitchen", "Furnished", "Trendy Area"]', '["https://images.unsplash.com/photo-1493809842364-78817add7ffb", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]', NOW(), true);

-- Pretoria Area (3 listings)
INSERT INTO accommodations ("userId", title, description, address, city, country, price, currency, "propertyType", bedrooms, bathrooms, amenities, images, "availableFrom", "isAvailable") VALUES
(1, 'Hatfield Room Near Tuks', 'Walking distance to UP main campus. Shared house with 4 students. Safe and friendly environment.', '78 Hilda Street', 'Pretoria', 'South Africa', 5700.00, 'ZAR', 'room', 1, 1, '["WiFi", "Shared Kitchen", "Security", "Parking", "Study Area", "Laundry"]', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", "https://images.unsplash.com/photo-1540518614846-7eded433c457"]', NOW(), true),

(2, 'Lynnwood Modern 2-Bed', 'Upmarket apartment close to UP. Fiber internet, DSTV, gym, and pool. Secure complex.', '23 Lynnwood Road', 'Pretoria', 'South Africa', 15000.00, 'ZAR', 'apartment', 2, 1, '["WiFi", "DSTV", "Security", "Parking", "Pool", "Gym", "Modern"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1560448204-603b3fc33ddc"]', NOW(), true),

(1, 'Brooklyn Bachelor Studio', 'Neat studio in popular student area. Close to UP and restaurants. Prepaid utilities included.', '89 Brooklyn Road', 'Pretoria', 'South Africa', 7800.00, 'ZAR', 'studio', 1, 1, '["WiFi", "Kitchen", "Parking", "Security", "Furnished", "Trendy Area"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688", "https://images.unsplash.com/photo-1502672023488-70e25813eb80"]', NOW(), true);

-- Summary query
SELECT 
  city, 
  "propertyType", 
  COUNT(*) as count,
  ROUND(AVG(price::numeric), 2) as avg_price
FROM accommodations 
GROUP BY city, "propertyType"
ORDER BY city, "propertyType";
