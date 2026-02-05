-- Add relevant thumbnail images to podcast episodes
-- Using Unsplash images for relevant topics

UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400' WHERE title ILIKE '%tech%' OR title ILIKE '%technology%' OR category = 'Tech & Innovation';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400' WHERE title ILIKE '%student%' OR title ILIKE '%campus%' OR category = 'Student Life';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400' WHERE title ILIKE '%study%' OR title ILIKE '%exam%' OR title ILIKE '%academic%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400' WHERE title ILIKE '%career%' OR title ILIKE '%job%' OR title ILIKE '%interview%' OR category = 'Career Advice';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400' WHERE title ILIKE '%health%' OR title ILIKE '%wellness%' OR title ILIKE '%mental%' OR category = 'Health & Wellness';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400' WHERE title ILIKE '%music%' OR title ILIKE '%concert%' OR category = 'Music';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400' WHERE title ILIKE '%business%' OR title ILIKE '%entrepreneur%' OR title ILIKE '%startup%' OR category = 'Business & Entrepreneurship';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400' WHERE title ILIKE '%team%' OR title ILIKE '%group%' OR title ILIKE '%collaboration%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400' WHERE title ILIKE '%lecture%' OR title ILIKE '%class%' OR title ILIKE '%education%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400' WHERE title ILIKE '%code%' OR title ILIKE '%programming%' OR title ILIKE '%software%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400' WHERE title ILIKE '%leadership%' OR title ILIKE '%management%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400' WHERE title ILIKE '%computer%' OR title ILIKE '%laptop%' OR title ILIKE '%digital%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400' WHERE title ILIKE '%science%' OR title ILIKE '%research%' OR title ILIKE '%lab%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400' WHERE title ILIKE '%sport%' OR title ILIKE '%fitness%' OR title ILIKE '%gym%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400' WHERE title ILIKE '%art%' OR title ILIKE '%design%' OR title ILIKE '%creative%';
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' WHERE title ILIKE '%interview%' OR title ILIKE '%talk%' OR title ILIKE '%discussion%';

-- Set default podcast thumbnail for any episodes without one
UPDATE podcast_episodes SET thumbnail_url = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400' WHERE thumbnail_url IS NULL OR thumbnail_url = '';

-- Add relevant images to accommodation listings
-- Using property images from Unsplash

-- Apartments
UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'
WHERE propertyType = 'apartment' AND (images IS NULL OR images = '' OR images = '[]');

-- Rooms
UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"]'
WHERE propertyType = 'room' AND (images IS NULL OR images = '' OR images = '[]');

-- Studios
UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800", "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800"]'
WHERE propertyType = 'studio' AND (images IS NULL OR images = '' OR images = '[]');

-- Houses
UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"]'
WHERE propertyType = 'house' AND (images IS NULL OR images = '' OR images = '[]');

-- Dormitories
UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800", "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800"]'
WHERE propertyType = 'dormitory' AND (images IS NULL OR images = '' OR images = '[]');

-- Update specific accommodations based on title keywords
UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'
WHERE title ILIKE '%modern%' AND (images IS NULL OR images = '' OR images = '[]');

UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]'
WHERE title ILIKE '%luxury%' AND (images IS NULL OR images = '' OR images = '[]');

UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800"]'
WHERE title ILIKE '%cozy%' OR title ILIKE '%comfortable%' AND (images IS NULL OR images = '' OR images = '[]');

UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"]'
WHERE title ILIKE '%spacious%' OR title ILIKE '%large%' AND (images IS NULL OR images = '' OR images = '[]');

-- Set default accommodation image for any listings without images
UPDATE accommodations SET images = '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]'
WHERE images IS NULL OR images = '' OR images = '[]';
