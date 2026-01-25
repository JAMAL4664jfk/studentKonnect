-- Connect to Lecturer Database Schema
-- System for lecturer profiles, connection requests, and messaging

-- 1. Lecturer Profiles Table
CREATE TABLE IF NOT EXISTS lecturer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(50), -- Prof, Dr, Mr, Mrs, etc.
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  faculty VARCHAR(100) NOT NULL,
  department VARCHAR(200) NOT NULL,
  subjects TEXT[] NOT NULL, -- Array of subjects taught
  office_location VARCHAR(200),
  availability TEXT, -- e.g., "Mon-Fri, 9AM-5PM"
  bio TEXT,
  photo_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- 2. Connection Requests Table
CREATE TABLE IF NOT EXISTS lecturer_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES lecturer_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  message TEXT, -- Optional message from student when requesting connection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, lecturer_id)
);

-- 3. Lecturer Messages Table
CREATE TABLE IF NOT EXISTS lecturer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES lecturer_connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Lecturer Ratings Table
CREATE TABLE IF NOT EXISTS lecturer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES lecturer_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lecturer_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lecturer_profiles_faculty ON lecturer_profiles(faculty);
CREATE INDEX IF NOT EXISTS idx_lecturer_profiles_department ON lecturer_profiles(department);
CREATE INDEX IF NOT EXISTS idx_lecturer_profiles_active ON lecturer_profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lecturer_profiles_rating ON lecturer_profiles(rating DESC);

CREATE INDEX IF NOT EXISTS idx_lecturer_connections_student ON lecturer_connections(student_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_connections_lecturer ON lecturer_connections(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_connections_status ON lecturer_connections(status);

CREATE INDEX IF NOT EXISTS idx_lecturer_messages_connection ON lecturer_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_messages_sender ON lecturer_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_messages_created ON lecturer_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lecturer_ratings_lecturer ON lecturer_ratings(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_ratings_student ON lecturer_ratings(student_id);

-- Function to update lecturer rating
CREATE OR REPLACE FUNCTION update_lecturer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lecturer_profiles
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM lecturer_ratings WHERE lecturer_id = NEW.lecturer_id),
    total_ratings = (SELECT COUNT(*) FROM lecturer_ratings WHERE lecturer_id = NEW.lecturer_id)
  WHERE id = NEW.lecturer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating on new review
DROP TRIGGER IF EXISTS trigger_update_lecturer_rating ON lecturer_ratings;
CREATE TRIGGER trigger_update_lecturer_rating
AFTER INSERT OR UPDATE ON lecturer_ratings
FOR EACH ROW
EXECUTE FUNCTION update_lecturer_rating();

-- Function to update connection timestamp on new message
CREATE OR REPLACE FUNCTION update_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lecturer_connections
  SET updated_at = NEW.created_at
  WHERE id = NEW.connection_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update connection on new message
DROP TRIGGER IF EXISTS trigger_update_connection_timestamp ON lecturer_messages;
CREATE TRIGGER trigger_update_connection_timestamp
AFTER INSERT ON lecturer_messages
FOR EACH ROW
EXECUTE FUNCTION update_connection_timestamp();

-- Enable Row Level Security
ALTER TABLE lecturer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lecturer_profiles
CREATE POLICY "Anyone can view active lecturer profiles"
ON lecturer_profiles FOR SELECT
USING (is_active = true);

CREATE POLICY "Lecturers can insert their own profile"
ON lecturer_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lecturers can update their own profile"
ON lecturer_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Lecturers can delete their own profile"
ON lecturer_profiles FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for lecturer_connections
CREATE POLICY "Students can view their own connections"
ON lecturer_connections FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Lecturers can view their connections"
ON lecturer_connections FOR SELECT
USING (lecturer_id IN (
  SELECT id FROM lecturer_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Students can create connection requests"
ON lecturer_connections FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Lecturers can update connection status"
ON lecturer_connections FOR UPDATE
USING (lecturer_id IN (
  SELECT id FROM lecturer_profiles WHERE user_id = auth.uid()
));

-- RLS Policies for lecturer_messages
CREATE POLICY "Users can view messages in their connections"
ON lecturer_messages FOR SELECT
USING (
  connection_id IN (
    SELECT id FROM lecturer_connections
    WHERE student_id = auth.uid()
    OR lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their connections"
ON lecturer_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND connection_id IN (
    SELECT id FROM lecturer_connections
    WHERE (student_id = auth.uid() OR lecturer_id IN (SELECT id FROM lecturer_profiles WHERE user_id = auth.uid()))
    AND status = 'accepted'
  )
);

-- RLS Policies for lecturer_ratings
CREATE POLICY "Anyone can view ratings"
ON lecturer_ratings FOR SELECT
USING (true);

CREATE POLICY "Students can rate lecturers"
ON lecturer_ratings FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own ratings"
ON lecturer_ratings FOR UPDATE
USING (student_id = auth.uid());
