-- Additional Podcast Episodes and Comments Seed Data
-- Run this after the initial podcast schema and seed data

-- Insert more diverse podcast episodes
-- First, create a default user if it doesn't exist (for demo purposes)
INSERT INTO profiles (id, email, full_name, institution, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'podcast.admin@studentkonnect.co.za',
  'StudentKonnect Podcasts',
  'StudentKonnect',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert podcast episodes
INSERT INTO podcasts (
  title,
  description,
  category,
  host_name,
  duration,
  media_type,
  audio_url,
  video_url,
  thumbnail_url,
  release_date,
  featured,
  views_count,
  likes_count,
  comments_count,
  favorites_count,
  user_id
) VALUES
-- Campus Life Episodes
(
  'Surviving Your First Week at University',
  'Essential tips and advice for first-year students navigating their first week on campus. From finding your classes to making friends, we cover it all.',
  'Campus Life',
  'Thabo Mthembu',
  1245,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
  NOW() - INTERVAL '5 days',
  true,
  4200,
  892,
  156,
  234,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Balancing Part-Time Work and Studies',
  'Real talk about managing a part-time job while keeping up with your academic responsibilities. Hear from students who are doing it successfully.',
  'Campus Life',
  'Naledi Khumalo',
  1580,
  'audio',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  NULL,
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
  NOW() - INTERVAL '8 days',
  false,
  3100,
  654,
  98,
  178,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Campus Safety Tips Every Student Should Know',
  'Important safety advice for staying safe on and off campus. Includes emergency contacts, safe transportation options, and awareness tips.',
  'Campus Life',
  'Sipho Ndlovu',
  920,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
  NOW() - INTERVAL '12 days',
  false,
  2800,
  567,
  89,
  145,
  '00000000-0000-0000-0000-000000000001'
),

-- Career Development Episodes
(
  'Building Your Personal Brand on LinkedIn',
  'Step-by-step guide to creating a professional LinkedIn profile that attracts recruiters and opportunities. Includes real examples and templates.',
  'Career',
  'Lerato Mokoena',
  1680,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800',
  NOW() - INTERVAL '3 days',
  true,
  5100,
  1023,
  187,
  312,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Networking 101: Making Connections That Matter',
  'Learn the art of professional networking from industry experts. Discover how to approach people, maintain relationships, and leverage your network.',
  'Career',
  'Mandla Dlamini',
  1420,
  'audio',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  NULL,
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
  NOW() - INTERVAL '6 days',
  false,
  3800,
  789,
  134,
  201,
  '00000000-0000-0000-0000-000000000001'
),
(
  'From Graduate to Professional: Your First 90 Days',
  'What to expect in your first three months at a new job. Tips for making a great impression and setting yourself up for success.',
  'Career',
  'Zanele Sithole',
  1290,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
  NOW() - INTERVAL '10 days',
  false,
  2900,
  612,
  102,
  167,
  '00000000-0000-0000-0000-000000000001'
),

-- Technology Episodes
(
  'Introduction to Python Programming',
  'Beginner-friendly introduction to Python. Learn basic syntax, data types, and write your first program. Perfect for complete beginners.',
  'Technology',
  'Tshepo Molefe',
  2100,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
  NOW() - INTERVAL '2 days',
  true,
  6200,
  1234,
  203,
  389,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Web Development Roadmap 2026',
  'Complete guide to becoming a web developer in 2026. What to learn, in what order, and the best resources to use.',
  'Technology',
  'Palesa Nkosi',
  1850,
  'audio',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  NULL,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  NOW() - INTERVAL '7 days',
  false,
  4100,
  876,
  145,
  267,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Mobile App Development with React Native',
  'Build your first mobile app using React Native. We create a simple to-do app from scratch and deploy it to your phone.',
  'Technology',
  'Bongani Zulu',
  2400,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  NOW() - INTERVAL '4 days',
  true,
  5400,
  1098,
  178,
  334,
  '00000000-0000-0000-0000-000000000001'
),

-- Mental Health & Wellness Episodes
(
  'Managing Exam Anxiety: Practical Strategies',
  'Evidence-based techniques for dealing with exam stress and anxiety. Includes breathing exercises, study tips, and mindset shifts.',
  'Mental Health',
  'Dr. Nomsa Radebe',
  1120,
  'audio',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  NULL,
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
  NOW() - INTERVAL '9 days',
  false,
  3600,
  723,
  112,
  189,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Building Resilience in Challenging Times',
  'Learn how to bounce back from setbacks and build mental toughness. Features interviews with students who overcame major challenges.',
  'Mental Health',
  'Thandi Mahlangu',
  1380,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
  NOW() - INTERVAL '11 days',
  false,
  3200,
  678,
  95,
  156,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Sleep, Nutrition, and Academic Performance',
  'The science behind how sleep and nutrition affect your grades. Practical tips for eating well and sleeping better on a student budget.',
  'Mental Health',
  'Dr. Sizwe Buthelezi',
  1560,
  'audio',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  NULL,
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
  NOW() - INTERVAL '14 days',
  false,
  2700,
  589,
  87,
  134,
  '00000000-0000-0000-0000-000000000001'
),

-- Education & Study Tips Episodes
(
  'The Pomodoro Technique: Study Smarter, Not Harder',
  'Master the Pomodoro Technique for focused study sessions. Includes a live demonstration and customization tips for different subjects.',
  'Education',
  'Mpho Tshabalala',
  980,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
  NOW() - INTERVAL '1 day',
  true,
  7100,
  1456,
  234,
  445,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Note-Taking Methods That Actually Work',
  'Compare different note-taking systems: Cornell, mind mapping, outline method, and more. Find what works best for your learning style.',
  'Education',
  'Lindiwe Cele',
  1340,
  'audio',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  NULL,
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
  NOW() - INTERVAL '5 days',
  false,
  4300,
  891,
  156,
  278,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Understanding NSFAS: Everything You Need to Know',
  'Complete guide to NSFAS funding. Application process, requirements, allowances, and how to maintain your funding.',
  'Education',
  'Sello Mohlala',
  1680,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  NOW() - INTERVAL '13 days',
  false,
  5800,
  1167,
  189,
  312,
  '00000000-0000-0000-0000-000000000001'
),

-- Entrepreneurship Episodes
(
  'Starting a Side Hustle While Studying',
  'Real stories from student entrepreneurs. Learn how they started their businesses, managed time, and made their first sales.',
  'Entrepreneurship',
  'Kagiso Moloi',
  1720,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
  NOW() - INTERVAL '3 days',
  true,
  4900,
  1012,
  167,
  289,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Digital Marketing Basics for Beginners',
  'Learn how to market your business or services online. Covers social media, content creation, and basic SEO strategies.',
  'Entrepreneurship',
  'Refilwe Maseko',
  1580,
  'audio',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  NULL,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  NOW() - INTERVAL '8 days',
  false,
  3700,
  756,
  123,
  198,
  '00000000-0000-0000-0000-000000000001'
),

-- Finance & Money Management Episodes
(
  'Student Budgeting 101',
  'Create and stick to a realistic student budget. Track expenses, save money, and avoid debt. Includes free budget templates.',
  'Finance',
  'Thabiso Mnguni',
  1240,
  'video',
  NULL,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800',
  NOW() - INTERVAL '6 days',
  false,
  3900,
  812,
  134,
  223,
  '00000000-0000-0000-0000-000000000001'
),
(
  'Understanding Credit and Building Your Credit Score',
  'Everything students need to know about credit. How credit scores work, why they matter, and how to build good credit early.',
  'Finance',
  'Nompumelelo Dube',
  1450,
  'audio',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  NULL,
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
  NOW() - INTERVAL '15 days',
  false,
  3300,
  689,
  98,
  167,
  '00000000-0000-0000-0000-000000000001'
);

-- Get the IDs of the newly inserted episodes for adding comments
-- Note: In a real scenario, you'd need to query these IDs. For this script, we'll use a subquery approach.

-- Add diverse comments to episodes
-- Comments for "Surviving Your First Week at University"
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '11111111-1111-1111-1111-111111111111', 'This was so helpful! I start next week and was super nervous. Thank you!', 23, NOW() - INTERVAL '4 days'
FROM podcasts WHERE title = 'Surviving Your First Week at University';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'Wish I had this before my first week 😅 Great advice though!', 15, NOW() - INTERVAL '4 days'
FROM podcasts WHERE title = 'Surviving Your First Week at University';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '33333333-3333-3333-3333-333333333333', 'The part about finding your classes was spot on. I got lost so many times!', 31, NOW() - INTERVAL '3 days'
FROM podcasts WHERE title = 'Surviving Your First Week at University';

-- Reply to the third comment
INSERT INTO podcast_comments (podcast_id, user_id, parent_id, content, likes_count, created_at)
SELECT 
  p.id, 
  '44444444-4444-4444-4444-444444444444',
  c.id,
  'Same here! I ended up in the wrong building twice on my first day 😂',
  8,
  NOW() - INTERVAL '3 days'
FROM podcasts p
JOIN podcast_comments c ON c.podcast_id = p.id
WHERE p.title = 'Surviving Your First Week at University' 
AND c.content LIKE '%finding your classes%';

-- Comments for "Introduction to Python Programming"
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '55555555-5555-5555-5555-555555555555', 'Best Python tutorial I''ve seen! Clear explanations and great examples.', 67, NOW() - INTERVAL '2 days'
FROM podcasts WHERE title = 'Introduction to Python Programming';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '66666666-6666-6666-6666-666666666666', 'Can you do a follow-up on object-oriented programming?', 42, NOW() - INTERVAL '1 day'
FROM podcasts WHERE title = 'Introduction to Python Programming';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '77777777-7777-7777-7777-777777777777', 'I finally understand loops! Thank you so much 🙏', 28, NOW() - INTERVAL '1 day'
FROM podcasts WHERE title = 'Introduction to Python Programming';

-- Comments for "Building Your Personal Brand on LinkedIn"
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '88888888-8888-8888-8888-888888888888', 'Updated my LinkedIn profile using these tips and already got 2 recruiter messages!', 89, NOW() - INTERVAL '2 days'
FROM podcasts WHERE title = 'Building Your Personal Brand on LinkedIn';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '99999999-9999-9999-9999-999999999999', 'The section on writing a compelling headline was gold. Changed mine immediately.', 45, NOW() - INTERVAL '2 days'
FROM podcasts WHERE title = 'Building Your Personal Brand on LinkedIn';

-- Comments for "The Pomodoro Technique"
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Game changer! My productivity has doubled since I started using this technique.', 134, NOW() - INTERVAL '1 day'
FROM podcasts WHERE title = 'The Pomodoro Technique: Study Smarter, Not Harder';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Do you recommend any apps for tracking Pomodoro sessions?', 56, NOW() - INTERVAL '1 day'
FROM podcasts WHERE title = 'The Pomodoro Technique: Study Smarter, Not Harder';

INSERT INTO podcast_comments (podcast_id, user_id, parent_id, content, likes_count, created_at)
SELECT 
  p.id,
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  c.id,
  'I use Focus To-Do and it''s amazing! Free and has great features.',
  23,
  NOW() - INTERVAL '20 hours'
FROM podcasts p
JOIN podcast_comments c ON c.podcast_id = p.id
WHERE p.title = 'The Pomodoro Technique: Study Smarter, Not Harder'
AND c.content LIKE '%apps for tracking%';

-- Comments for "Managing Exam Anxiety"
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'The breathing exercises really helped me during my last exam. Thank you!', 67, NOW() - INTERVAL '8 days'
FROM podcasts WHERE title = 'Managing Exam Anxiety: Practical Strategies';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Sharing this with all my friends. Everyone needs to hear this before exams.', 45, NOW() - INTERVAL '7 days'
FROM podcasts WHERE title = 'Managing Exam Anxiety: Practical Strategies';

-- Comments for "Starting a Side Hustle While Studying"
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Inspired me to finally start my tutoring business! Already have 3 clients.', 78, NOW() - INTERVAL '2 days'
FROM podcasts WHERE title = 'Starting a Side Hustle While Studying';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '10101010-1010-1010-1010-101010101010', 'The time management tips were crucial. You can definitely do both if you plan well.', 52, NOW() - INTERVAL '2 days'
FROM podcasts WHERE title = 'Starting a Side Hustle While Studying';

-- Comments for "Understanding NSFAS"
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '20202020-2020-2020-2020-202020202020', 'This cleared up so much confusion! NSFAS website is so complicated.', 98, NOW() - INTERVAL '12 days'
FROM podcasts WHERE title = 'Understanding NSFAS: Everything You Need to Know';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '30303030-3030-3030-3030-303030303030', 'Can you do an episode on NSFAS appeals? My funding was rejected 😢', 34, NOW() - INTERVAL '11 days'
FROM podcasts WHERE title = 'Understanding NSFAS: Everything You Need to Know';

INSERT INTO podcast_comments (podcast_id, user_id, parent_id, content, likes_count, created_at)
SELECT 
  p.id,
  '40404040-4040-4040-4040-404040404040',
  c.id,
  'Check your academic performance and make sure all documents are submitted. Good luck!',
  12,
  NOW() - INTERVAL '11 days'
FROM podcasts p
JOIN podcast_comments c ON c.podcast_id = p.id
WHERE p.title = 'Understanding NSFAS: Everything You Need to Know'
AND c.content LIKE '%appeals%';

-- Comments for "Student Budgeting 101"
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '50505050-5050-5050-5050-505050505050', 'Started tracking my expenses and I''m shocked at how much I was wasting on takeout!', 87, NOW() - INTERVAL '5 days'
FROM podcasts WHERE title = 'Student Budgeting 101';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '60606060-6060-6060-6060-606060606060', 'The 50/30/20 rule is simple and actually works. Highly recommend!', 56, NOW() - INTERVAL '5 days'
FROM podcasts WHERE title = 'Student Budgeting 101';

-- Add some general appreciation comments
INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '70707070-7070-7070-7070-707070707070', 'Keep making these! Your content is helping so many students.', 45, NOW() - INTERVAL '3 days'
FROM podcasts WHERE title = 'Mobile App Development with React Native';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '80808080-8080-8080-8080-808080808080', 'Subscribed! Can''t wait for more episodes.', 34, NOW() - INTERVAL '4 days'
FROM podcasts WHERE title = 'Web Development Roadmap 2026';

INSERT INTO podcast_comments (podcast_id, user_id, content, likes_count, created_at)
SELECT id, '90909090-9090-9090-9090-909090909090', 'This podcast is a lifesaver for students. Thank you for making this content!', 67, NOW() - INTERVAL '6 days'
FROM podcasts WHERE title = 'Balancing Part-Time Work and Studies';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added 20 new podcast episodes with comments!';
  RAISE NOTICE 'Episodes cover: Campus Life, Career, Technology, Mental Health, Education, Entrepreneurship, and Finance';
  RAISE NOTICE 'Added 30+ comments with replies across various episodes';
END $$;
