-- Update existing lecturers with diverse, realistic profiles and images

-- Clear existing lecturer data
DELETE FROM lecturer_bookings;
UPDATE profiles SET is_lecturer = false WHERE is_lecturer = true;

-- Insert diverse lecturers with realistic images from various ethnicities
INSERT INTO profiles (id, email, role, faculty, department, specialization, office_location, consultation_hours, bio, avatar_url, is_lecturer, full_name)
VALUES
  -- African/Black lecturers
  (uuid_generate_v4(), 'thabo.molefe@university.ac.za', 'lecturer', 'Engineering', 'Electrical Engineering', 'Power Systems & Renewable Energy', 'Engineering Building, Office 302', 'Mon-Wed 10:00-12:00', 'Electrical engineer specializing in renewable energy solutions for African communities.', 'https://randomuser.me/api/portraits/men/32.jpg', true, 'Dr. Thabo Molefe'),
  
  (uuid_generate_v4(), 'nomsa.khumalo@university.ac.za', 'lecturer', 'Business', 'Business Management', 'Entrepreneurship & SME Development', 'Business School, Room 205', 'Tue-Thu 14:00-16:00', 'Business strategist with focus on African entrepreneurship and small business growth.', 'https://randomuser.me/api/portraits/women/44.jpg', true, 'Prof. Nomsa Khumalo'),
  
  (uuid_generate_v4(), 'kwame.osei@university.ac.za', 'lecturer', 'Science', 'Computer Science', 'Artificial Intelligence & Machine Learning', 'IT Building, Lab 401', 'Mon-Fri 09:00-11:00', 'AI researcher developing machine learning solutions for healthcare in Africa.', 'https://randomuser.me/api/portraits/men/85.jpg', true, 'Dr. Kwame Osei'),
  
  (uuid_generate_v4(), 'zanele.dlamini@university.ac.za', 'lecturer', 'Health Sciences', 'Nursing', 'Community Health & Primary Care', 'Medical Campus, Building B, Office 108', 'Wed-Fri 13:00-15:00', 'Nursing specialist focused on community health and rural healthcare delivery.', 'https://randomuser.me/api/portraits/women/65.jpg', true, 'Dr. Zanele Dlamini'),
  
  -- Indian/South Asian lecturers
  (uuid_generate_v4(), 'priya.naidoo@university.ac.za', 'lecturer', 'Science', 'Chemistry', 'Organic Chemistry & Pharmaceuticals', 'Science Complex, Lab 203', 'Tue-Thu 10:00-12:00', 'Chemist researching pharmaceutical compounds for tropical diseases.', 'https://randomuser.me/api/portraits/women/72.jpg', true, 'Prof. Priya Naidoo'),
  
  (uuid_generate_v4(), 'raj.patel@university.ac.za', 'lecturer', 'Engineering', 'Civil Engineering', 'Structural Design & Infrastructure', 'Engineering Building, Office 405', 'Mon-Wed 14:00-16:00', 'Civil engineer specializing in sustainable infrastructure for developing regions.', 'https://randomuser.me/api/portraits/men/71.jpg', true, 'Dr. Raj Patel'),
  
  -- Coloured/Mixed Race lecturers
  (uuid_generate_v4(), 'michelle.adams@university.ac.za', 'lecturer', 'Arts & Humanities', 'Psychology', 'Clinical Psychology & Mental Health', 'Humanities Building, Office 301', 'Tue-Fri 11:00-13:00', 'Clinical psychologist specializing in trauma and youth mental health.', 'https://randomuser.me/api/portraits/women/23.jpg', true, 'Dr. Michelle Adams'),
  
  (uuid_generate_v4(), 'ryan.williams@university.ac.za', 'lecturer', 'Education', 'Educational Psychology', 'Learning Development & Special Education', 'Education Building, Room 102', 'Mon-Thu 09:00-11:00', 'Educational psychologist focused on inclusive education and learning disabilities.', 'https://randomuser.me/api/portraits/men/42.jpg', true, 'Prof. Ryan Williams'),
  
  -- White lecturers
  (uuid_generate_v4(), 'sarah.johnson@university.ac.za', 'lecturer', 'Law', 'Constitutional Law', 'Human Rights & Constitutional Law', 'Law Faculty, Office 501', 'Wed-Fri 10:00-12:00', 'Constitutional lawyer specializing in human rights and social justice.', 'https://randomuser.me/api/portraits/women/17.jpg', true, 'Prof. Sarah Johnson'),
  
  (uuid_generate_v4(), 'david.smith@university.ac.za', 'lecturer', 'Agriculture', 'Agricultural Science', 'Crop Science & Food Security', 'Agriculture Building, Office 204', 'Mon-Wed 13:00-15:00', 'Agricultural scientist researching drought-resistant crops for food security.', 'https://randomuser.me/api/portraits/men/52.jpg', true, 'Dr. David Smith'),
  
  -- Asian (East Asian) lecturers
  (uuid_generate_v4(), 'mei.chen@university.ac.za', 'lecturer', 'Business', 'Economics', 'International Trade & Development Economics', 'Business School, Room 308', 'Tue-Thu 10:00-12:00', 'Economist specializing in African-Asian trade relations and economic development.', 'https://randomuser.me/api/portraits/women/68.jpg', true, 'Dr. Mei Chen'),
  
  (uuid_generate_v4(), 'hiroshi.tanaka@university.ac.za', 'lecturer', 'Engineering', 'Mechanical Engineering', 'Robotics & Manufacturing Technology', 'Engineering Building, Lab 502', 'Mon-Fri 14:00-16:00', 'Robotics engineer developing automation solutions for manufacturing.', 'https://randomuser.me/api/portraits/men/88.jpg', true, 'Prof. Hiroshi Tanaka'),
  
  -- Middle Eastern lecturers
  (uuid_generate_v4(), 'fatima.hassan@university.ac.za', 'lecturer', 'Science', 'Biology', 'Molecular Biology & Genetics', 'Science Complex, Lab 305', 'Wed-Fri 09:00-11:00', 'Molecular biologist researching genetic diseases prevalent in African populations.', 'https://randomuser.me/api/portraits/women/89.jpg', true, 'Dr. Fatima Hassan'),
  
  (uuid_generate_v4(), 'omar.abdullah@university.ac.za', 'lecturer', 'Arts & Humanities', 'Sociology', 'Urban Sociology & Social Change', 'Humanities Building, Office 205', 'Tue-Thu 13:00-15:00', 'Sociologist studying urbanization and social transformation in African cities.', 'https://randomuser.me/api/portraits/men/78.jpg', true, 'Prof. Omar Abdullah'),
  
  -- Additional diverse lecturers
  (uuid_generate_v4(), 'lindiwe.mthembu@university.ac.za', 'lecturer', 'Health Sciences', 'Medicine', 'Internal Medicine & Infectious Diseases', 'Medical Campus, Building A, Office 402', 'Mon-Wed 11:00-13:00', 'Medical doctor specializing in infectious diseases and public health.', 'https://randomuser.me/api/portraits/women/47.jpg', true, 'Dr. Lindiwe Mthembu'),
  
  (uuid_generate_v4(), 'carlos.fernandez@university.ac.za', 'lecturer', 'Arts & Humanities', 'Languages', 'Linguistics & Language Education', 'Humanities Building, Office 108', 'Tue-Fri 10:00-12:00', 'Linguist specializing in multilingual education and language preservation.', 'https://randomuser.me/api/portraits/men/63.jpg', true, 'Dr. Carlos Fernandez')

ON CONFLICT (email) DO NOTHING;
