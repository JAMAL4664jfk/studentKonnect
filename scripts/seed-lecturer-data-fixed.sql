-- Seed Data for Connect to Lecturer Feature
-- Fixed to match actual profiles table schema

DO $$
BEGIN
  -- Create 10 sample lecturer users and their profiles
  
  -- 1. Prof. Sarah Nkosi
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000101',
    'Prof. Sarah Nkosi',
    'https://i.pravatar.cc/150?img=1',
    'University of Cape Town',
    'Computer Science',
    'Professor of Computer Science with 15 years of experience in AI and machine learning.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000101',
    'Prof.', 'Sarah Nkosi', 'sarah.nkosi@uct.ac.za', '+27 21 123 4567',
    'engineering', 'Computer Science',
    ARRAY['Data Structures', 'Algorithms', 'Artificial Intelligence', 'Machine Learning'],
    'Engineering Building, Room 301', 'Mon-Fri, 9AM-5PM',
    'Professor of Computer Science with 15 years of experience in AI and machine learning. Passionate about helping students understand complex algorithms.',
    'https://i.pravatar.cc/150?img=1', 4.8, 156, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 2. Dr. Thabo Mokoena
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000102',
    'Dr. Thabo Mokoena',
    'https://i.pravatar.cc/150?img=13',
    'University of Cape Town',
    'Electrical Engineering',
    'Electrical Engineering specialist focusing on renewable energy systems.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000102',
    'Dr.', 'Thabo Mokoena', 'thabo.mokoena@uct.ac.za', '+27 21 123 4568',
    'engineering', 'Electrical Engineering',
    ARRAY['Circuit Theory', 'Power Systems', 'Control Systems'],
    'Engineering Building, Room 205', 'Tue-Thu, 10AM-4PM',
    'Electrical Engineering specialist focusing on renewable energy systems and smart grids.',
    'https://i.pravatar.cc/150?img=13', 4.6, 89, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 3. Dr. Michael van der Merwe
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000103',
    'Dr. Michael van der Merwe',
    'https://i.pravatar.cc/150?img=12',
    'Stellenbosch University',
    'Physics',
    'Physics lecturer with expertise in quantum mechanics.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000103',
    'Dr.', 'Michael van der Merwe', 'michael.vdm@sun.ac.za', '+27 21 808 4569',
    'science', 'Physics',
    ARRAY['Quantum Mechanics', 'Thermodynamics', 'Classical Mechanics'],
    'Science Building, Room 402', 'Tue-Thu, 10AM-4PM',
    'Physics lecturer with expertise in quantum mechanics. Available for consultation on research projects.',
    'https://i.pravatar.cc/150?img=12', 4.9, 203, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 4. Prof. Lindiwe Dube
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000104',
    'Prof. Lindiwe Dube',
    'https://i.pravatar.cc/150?img=9',
    'University of Witwatersrand',
    'Chemistry',
    'Chemistry professor specializing in organic synthesis.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000104',
    'Prof.', 'Lindiwe Dube', 'lindiwe.dube@wits.ac.za', '+27 11 717 4570',
    'science', 'Chemistry',
    ARRAY['Organic Chemistry', 'Analytical Chemistry', 'Biochemistry'],
    'Science Building, Room 315', 'Mon-Wed-Fri, 11AM-3PM',
    'Chemistry professor specializing in organic synthesis and medicinal chemistry.',
    'https://i.pravatar.cc/150?img=9', 4.7, 134, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 5. Dr. Thandiwe Dlamini
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000105',
    'Dr. Thandiwe Dlamini',
    'https://i.pravatar.cc/150?img=5',
    'University of Pretoria',
    'Accounting',
    'Chartered Accountant with 10 years industry experience.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000105',
    'Dr.', 'Thandiwe Dlamini', 'thandiwe.dlamini@up.ac.za', '+27 12 420 4571',
    'commerce', 'Accounting',
    ARRAY['Financial Accounting', 'Auditing', 'Taxation', 'Management Accounting'],
    'Commerce Building, Room 201', 'Mon-Wed, 8AM-2PM',
    'Chartered Accountant with 10 years industry experience. Specializing in financial reporting and auditing.',
    'https://i.pravatar.cc/150?img=5', 4.7, 178, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 6. Prof. David Chen
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000106',
    'Prof. David Chen',
    'https://i.pravatar.cc/150?img=14',
    'University of Cape Town',
    'Economics',
    'Economics professor with research focus on development economics.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000106',
    'Prof.', 'David Chen', 'david.chen@uct.ac.za', '+27 21 123 4572',
    'commerce', 'Economics',
    ARRAY['Microeconomics', 'Macroeconomics', 'Econometrics'],
    'Commerce Building, Room 305', 'Tue-Thu, 9AM-5PM',
    'Economics professor with research focus on development economics and policy analysis.',
    'https://i.pravatar.cc/150?img=14', 4.8, 192, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 7. Prof. James Smith
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000107',
    'Prof. James Smith',
    'https://i.pravatar.cc/150?img=15',
    'Rhodes University',
    'Psychology',
    'Clinical psychologist and researcher specializing in CBT.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000107',
    'Prof.', 'James Smith', 'james.smith@ru.ac.za', '+27 46 603 4573',
    'humanities', 'Psychology',
    ARRAY['Cognitive Psychology', 'Research Methods', 'Developmental Psychology'],
    'Humanities Building, Room 408', 'Mon-Fri, 11AM-3PM',
    'Clinical psychologist and researcher specializing in cognitive behavioral therapy and mental health.',
    'https://i.pravatar.cc/150?img=15', 4.6, 145, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 8. Dr. Fatima Hassan
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000108',
    'Dr. Fatima Hassan',
    'https://i.pravatar.cc/150?img=10',
    'University of Johannesburg',
    'Sociology',
    'Sociologist researching urban development in South Africa.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000108',
    'Dr.', 'Fatima Hassan', 'fatima.hassan@uj.ac.za', '+27 11 559 4574',
    'humanities', 'Sociology',
    ARRAY['Social Theory', 'Research Methodology', 'Urban Sociology'],
    'Humanities Building, Room 302', 'Mon-Wed-Fri, 10AM-2PM',
    'Sociologist researching urban development and social inequality in South African cities.',
    'https://i.pravatar.cc/150?img=10', 4.5, 98, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 9. Dr. Sipho Ndlovu
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000109',
    'Dr. Sipho Ndlovu',
    'https://i.pravatar.cc/150?img=11',
    'University of KwaZulu-Natal',
    'Medicine',
    'Medical doctor with 20 years clinical experience.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000109',
    'Dr.', 'Sipho Ndlovu', 'sipho.ndlovu@ukzn.ac.za', '+27 31 260 4575',
    'health', 'Medicine',
    ARRAY['Anatomy', 'Physiology', 'Pathology'],
    'Medical School, Room 501', 'Tue-Thu, 8AM-12PM',
    'Medical doctor and lecturer with 20 years clinical experience. Specializing in internal medicine.',
    'https://i.pravatar.cc/150?img=11', 4.9, 267, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- 10. Prof. Nomsa Khumalo
  INSERT INTO profiles (id, full_name, avatar_url, institution_name, course_program, bio, created_at)
  VALUES (
    '00000000-0000-0000-0000-000000000110',
    'Prof. Nomsa Khumalo',
    'https://i.pravatar.cc/150?img=47',
    'University of Cape Town',
    'Nursing',
    'Registered nurse with expertise in community health.',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO lecturer_profiles (
    user_id, title, full_name, email, phone, faculty, department, subjects,
    office_location, availability, bio, photo_url, rating, total_ratings, is_active, is_verified
  ) VALUES (
    '00000000-0000-0000-0000-000000000110',
    'Prof.', 'Nomsa Khumalo', 'nomsa.khumalo@uct.ac.za', '+27 21 123 4576',
    'health', 'Nursing',
    ARRAY['Clinical Nursing', 'Community Health', 'Nursing Ethics'],
    'Nursing Building, Room 203', 'Mon-Wed-Fri, 9AM-3PM',
    'Registered nurse and educator with expertise in community health and primary healthcare.',
    'https://i.pravatar.cc/150?img=47', 4.8, 189, true, true
  ) ON CONFLICT (user_id) DO NOTHING;

END $$;
