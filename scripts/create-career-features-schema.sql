-- Create bursaries table
CREATE TABLE IF NOT EXISTS bursaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_logo TEXT,
  amount TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  benefits TEXT[] NOT NULL,
  deadline DATE NOT NULL,
  description TEXT NOT NULL,
  application_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bursary_applications table
CREATE TABLE IF NOT EXISTS bursary_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bursary_id UUID NOT NULL REFERENCES bursaries(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bursary_id)
);

-- Create job_profiles table for recruiter viewing
CREATE TABLE IF NOT EXISTS job_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  education JSONB DEFAULT '[]', -- Array of {degree, institution, year}
  experience JSONB DEFAULT '[]', -- Array of {title, company, duration, description}
  cv_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  available_for_work BOOLEAN DEFAULT true,
  preferred_job_types TEXT[] DEFAULT '{}', -- internships, jobs, learnerships
  preferred_locations TEXT[] DEFAULT '{}',
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auto_apply_preferences table
CREATE TABLE IF NOT EXISTS auto_apply_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false,
  job_types TEXT[] DEFAULT '{}', -- internships, jobs, learnerships
  locations TEXT[] DEFAULT '{}',
  min_salary INTEGER,
  keywords TEXT[] DEFAULT '{}',
  auto_apply_limit INTEGER DEFAULT 10, -- Max applications per day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auto_applications table to track auto-applied jobs
CREATE TABLE IF NOT EXISTS auto_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Enable Row Level Security
ALTER TABLE bursaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bursary_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_apply_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_applications ENABLE ROW LEVEL SECURITY;

-- Bursaries policies (public read, admin write)
CREATE POLICY "Anyone can view bursaries"
  ON bursaries
  FOR SELECT
  USING (true);

-- Bursary applications policies
CREATE POLICY "Users can view own bursary applications"
  ON bursary_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bursary applications"
  ON bursary_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bursary applications"
  ON bursary_applications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Job profiles policies
CREATE POLICY "Recruiters can view all job profiles"
  ON job_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can view own job profile"
  ON job_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job profile"
  ON job_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job profile"
  ON job_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job profile"
  ON job_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-apply preferences policies
CREATE POLICY "Users can view own auto-apply preferences"
  ON auto_apply_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto-apply preferences"
  ON auto_apply_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto-apply preferences"
  ON auto_apply_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto applications policies
CREATE POLICY "Users can view own auto applications"
  ON auto_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto applications"
  ON auto_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bursary_applications_user_id ON bursary_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_bursary_applications_bursary_id ON bursary_applications(bursary_id);
CREATE INDEX IF NOT EXISTS idx_job_profiles_user_id ON job_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_job_profiles_available ON job_profiles(available_for_work);
CREATE INDEX IF NOT EXISTS idx_auto_apply_preferences_user_id ON auto_apply_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_apply_preferences_enabled ON auto_apply_preferences(enabled);
CREATE INDEX IF NOT EXISTS idx_auto_applications_user_id ON auto_applications(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_career_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_bursaries_updated_at
  BEFORE UPDATE ON bursaries
  FOR EACH ROW
  EXECUTE FUNCTION update_career_updated_at();

CREATE TRIGGER update_job_profiles_updated_at
  BEFORE UPDATE ON job_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_career_updated_at();

CREATE TRIGGER update_auto_apply_preferences_updated_at
  BEFORE UPDATE ON auto_apply_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_career_updated_at();

-- Insert sample bursaries
INSERT INTO bursaries (title, provider, provider_logo, amount, field_of_study, requirements, benefits, deadline, description) VALUES
('Engineering Excellence Bursary', 'TechCorp Foundation', 'https://ui-avatars.com/api/?name=TechCorp&background=3b82f6&color=fff&size=128', 'R80,000/year', 'Engineering', ARRAY['Currently enrolled in Engineering degree', 'Minimum 65% average', 'South African citizen', 'Financial need'], ARRAY['Full tuition coverage', 'Monthly stipend R3,000', 'Vacation work opportunities', 'Mentorship program'], '2024-12-31', 'Comprehensive bursary for engineering students covering tuition, books, and living expenses. Includes vacation work and potential employment after graduation.'),

('Business Leadership Bursary', 'Future Leaders SA', 'https://ui-avatars.com/api/?name=Future+Leaders&background=10b981&color=fff&size=128', 'R60,000/year', 'Business & Commerce', ARRAY['BCom or related degree', 'Leadership experience', 'Minimum 60% average', 'Community involvement'], ARRAY['Tuition coverage', 'Leadership development program', 'Networking events', 'Internship placement'], '2024-11-30', 'Develop your business acumen with our comprehensive bursary program. Includes leadership training, mentorship, and guaranteed internship placement.'),

('Science Innovation Bursary', 'Research Institute ZA', 'https://ui-avatars.com/api/?name=Research+Institute&background=8b5cf6&color=fff&size=128', 'R70,000/year', 'Science & Technology', ARRAY['BSc in Science or Technology', 'Research interest', 'Minimum 70% average', 'South African resident'], ARRAY['Full tuition and accommodation', 'Research opportunities', 'Conference attendance', 'Postgraduate support'], '2025-01-15', 'Join cutting-edge research projects while completing your degree. Full financial support plus research experience and conference opportunities.'),

('Healthcare Heroes Bursary', 'HealthPlus Foundation', 'https://ui-avatars.com/api/?name=HealthPlus&background=ef4444&color=fff&size=128', 'R90,000/year', 'Health Sciences', ARRAY['Medicine, Nursing, or Allied Health degree', 'Passion for healthcare', 'Minimum 65% average', 'Commitment to rural service'], ARRAY['Full tuition and accommodation', 'Medical equipment allowance', 'Clinical placement', 'Employment guarantee'], '2024-10-31', 'Comprehensive support for future healthcare professionals. Includes clinical placements, equipment, and guaranteed employment in underserved areas.'),

('IT & Digital Skills Bursary', 'Digital Future Fund', 'https://ui-avatars.com/api/?name=Digital+Future&background=f59e0b&color=fff&size=128', 'R50,000/year', 'Information Technology', ARRAY['IT, Computer Science, or related field', 'Coding portfolio', 'Minimum 60% average', 'Innovation mindset'], ARRAY['Tuition coverage', 'Laptop and software', 'Industry certifications', 'Internship opportunities'], '2024-12-15', 'Accelerate your tech career with comprehensive support including hardware, software, certifications, and real-world experience.');

-- Grant permissions
GRANT ALL ON bursaries TO authenticated;
GRANT ALL ON bursary_applications TO authenticated;
GRANT ALL ON job_profiles TO authenticated;
GRANT ALL ON auto_apply_preferences TO authenticated;
GRANT ALL ON auto_applications TO authenticated;
GRANT ALL ON bursaries TO service_role;
GRANT ALL ON bursary_applications TO service_role;
GRANT ALL ON job_profiles TO service_role;
GRANT ALL ON auto_apply_preferences TO service_role;
GRANT ALL ON auto_applications TO service_role;
