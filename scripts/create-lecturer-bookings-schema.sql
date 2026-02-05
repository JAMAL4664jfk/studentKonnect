-- Create lecturer_bookings table
CREATE TABLE IF NOT EXISTS lecturer_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lecturer_bookings_lecturer ON lecturer_bookings(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_bookings_student ON lecturer_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_bookings_date ON lecturer_bookings(date);
CREATE INDEX IF NOT EXISTS idx_lecturer_bookings_status ON lecturer_bookings(status);

-- Add RLS policies
ALTER TABLE lecturer_bookings ENABLE ROW LEVEL SECURITY;

-- Students can view their own bookings
CREATE POLICY "Students can view own bookings" ON lecturer_bookings
  FOR SELECT USING (auth.uid() = student_id);

-- Students can create bookings
CREATE POLICY "Students can create bookings" ON lecturer_bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Lecturers can view bookings for themselves
CREATE POLICY "Lecturers can view their bookings" ON lecturer_bookings
  FOR SELECT USING (auth.uid() = lecturer_id);

-- Lecturers can update booking status
CREATE POLICY "Lecturers can update booking status" ON lecturer_bookings
  FOR UPDATE USING (auth.uid() = lecturer_id);

-- Add lecturer-specific fields to profiles table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('student', 'lecturer', 'admin'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='faculty') THEN
    ALTER TABLE profiles ADD COLUMN faculty TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='department') THEN
    ALTER TABLE profiles ADD COLUMN department TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='specialization') THEN
    ALTER TABLE profiles ADD COLUMN specialization TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='office_location') THEN
    ALTER TABLE profiles ADD COLUMN office_location TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='consultation_hours') THEN
    ALTER TABLE profiles ADD COLUMN consultation_hours TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- Insert sample lecturers
INSERT INTO profiles (id, full_name, email, role, faculty, department, specialization, office_location, consultation_hours, bio, avatar_url)
VALUES
  (uuid_generate_v4(), 'Dr. Sarah Johnson', 'sarah.johnson@university.ac.za', 'lecturer', 'Engineering', 'Electrical Engineering', 'Power Systems & Renewable Energy', 'Engineering Building, Room 301', 'Mon-Wed 14:00-16:00', 'Specializing in renewable energy systems and smart grids. 15+ years of experience in power systems research.', 'https://i.pravatar.cc/150?img=1'),
  (uuid_generate_v4(), 'Prof. Michael Chen', 'michael.chen@university.ac.za', 'lecturer', 'Business', 'Business Administration', 'Strategic Management & Entrepreneurship', 'Business School, Office 205', 'Tue-Thu 10:00-12:00', 'Expert in startup ecosystems and corporate strategy. Former CEO of tech startup.', 'https://i.pravatar.cc/150?img=12'),
  (uuid_generate_v4(), 'Dr. Amina Patel', 'amina.patel@university.ac.za', 'lecturer', 'Science', 'Computer Science', 'Artificial Intelligence & Machine Learning', 'Science Complex, Lab 402', 'Mon-Fri 09:00-11:00', 'AI researcher with focus on deep learning and computer vision. Published 50+ papers.', 'https://i.pravatar.cc/150?img=5'),
  (uuid_generate_v4(), 'Prof. David Williams', 'david.williams@university.ac.za', 'lecturer', 'Arts & Humanities', 'Psychology', 'Clinical Psychology & Mental Health', 'Humanities Building, Room 108', 'Wed-Fri 13:00-15:00', 'Clinical psychologist specializing in student mental health and counseling.', 'https://i.pravatar.cc/150?img=13'),
  (uuid_generate_v4(), 'Dr. Fatima Nkosi', 'fatima.nkosi@university.ac.za', 'lecturer', 'Health Sciences', 'Nursing', 'Community Health & Primary Care', 'Health Sciences Building, Office 201', 'Tue-Thu 11:00-13:00', 'Community health advocate with 20 years of nursing experience.', 'https://i.pravatar.cc/150?img=9'),
  (uuid_generate_v4(), 'Prof. James Anderson', 'james.anderson@university.ac.za', 'lecturer', 'Law', 'Constitutional Law', 'Human Rights & Constitutional Law', 'Law Faculty, Office 305', 'Mon-Wed 15:00-17:00', 'Constitutional law expert and human rights advocate. Former judge.', 'https://i.pravatar.cc/150?img=14'),
  (uuid_generate_v4(), 'Dr. Lindiwe Mthembu', 'lindiwe.mthembu@university.ac.za', 'lecturer', 'Education', 'Educational Psychology', 'Learning Disabilities & Special Education', 'Education Building, Room 102', 'Mon-Fri 08:00-10:00', 'Specialist in inclusive education and learning support strategies.', 'https://i.pravatar.cc/150?img=10'),
  (uuid_generate_v4(), 'Prof. Robert Brown', 'robert.brown@university.ac.za', 'lecturer', 'Engineering', 'Mechanical Engineering', 'Robotics & Automation', 'Engineering Building, Lab 501', 'Tue-Thu 14:00-16:00', 'Robotics engineer with expertise in industrial automation and AI-driven systems.', 'https://i.pravatar.cc/150?img=15'),
  (uuid_generate_v4(), 'Dr. Zanele Dlamini', 'zanele.dlamini@university.ac.za', 'lecturer', 'Agriculture', 'Agricultural Economics', 'Sustainable Farming & Food Security', 'Agriculture Building, Office 203', 'Wed-Fri 10:00-12:00', 'Agricultural economist focused on sustainable farming practices in Africa.', 'https://i.pravatar.cc/150?img=8'),
  (uuid_generate_v4(), 'Prof. Thomas Lee', 'thomas.lee@university.ac.za', 'lecturer', 'Science', 'Mathematics', 'Applied Mathematics & Statistics', 'Science Complex, Room 304', 'Mon-Thu 13:00-15:00', 'Mathematician specializing in statistical modeling and data analysis.', 'https://i.pravatar.cc/150?img=11')
ON CONFLICT (email) DO NOTHING;
