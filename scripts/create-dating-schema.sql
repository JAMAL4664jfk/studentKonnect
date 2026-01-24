-- Dating Feature Database Schema
-- Complete system for dating profiles, matches, swipes, and preferences

-- 1. Dating Profiles Table
CREATE TABLE IF NOT EXISTS dating_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  gender VARCHAR(20) NOT NULL,
  bio TEXT,
  interests TEXT[], -- Array of interests
  looking_for VARCHAR(50), -- 'friendship', 'dating', 'relationship', 'networking'
  photos TEXT[], -- Array of photo URLs
  location VARCHAR(100),
  institution VARCHAR(200),
  faculty VARCHAR(100),
  year_of_study INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Dating Preferences Table
CREATE TABLE IF NOT EXISTS dating_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dating_profile_id UUID NOT NULL REFERENCES dating_profiles(id) ON DELETE CASCADE,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 30,
  preferred_gender TEXT[], -- Array: ['male', 'female', 'non-binary', 'any']
  max_distance INTEGER DEFAULT 50, -- in kilometers
  show_me_on_platform BOOLEAN DEFAULT true,
  interests_match_required BOOLEAN DEFAULT false,
  same_institution_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dating_profile_id)
);

-- 3. Swipes Table (track all swipes)
CREATE TABLE IF NOT EXISTS dating_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES dating_profiles(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES dating_profiles(id) ON DELETE CASCADE,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right', 'super')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- 4. Matches Table (when both users swipe right)
CREATE TABLE IF NOT EXISTS dating_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile1_id UUID NOT NULL REFERENCES dating_profiles(id) ON DELETE CASCADE,
  profile2_id UUID NOT NULL REFERENCES dating_profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE,
  CHECK (profile1_id < profile2_id), -- Ensure consistent ordering
  UNIQUE(profile1_id, profile2_id)
);

-- 5. Match Messages Table
CREATE TABLE IF NOT EXISTS dating_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES dating_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES dating_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dating_profiles_user_id ON dating_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_active ON dating_profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_dating_profiles_location ON dating_profiles(location);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_institution ON dating_profiles(institution);

CREATE INDEX IF NOT EXISTS idx_dating_swipes_swiper ON dating_swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_dating_swipes_swiped ON dating_swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_dating_swipes_direction ON dating_swipes(direction);

CREATE INDEX IF NOT EXISTS idx_dating_matches_profile1 ON dating_matches(profile1_id);
CREATE INDEX IF NOT EXISTS idx_dating_matches_profile2 ON dating_matches(profile2_id);
CREATE INDEX IF NOT EXISTS idx_dating_matches_active ON dating_matches(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_dating_messages_match ON dating_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_dating_messages_sender ON dating_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dating_messages_created ON dating_messages(created_at DESC);

-- Function to create a match when both users swipe right
CREATE OR REPLACE FUNCTION create_match_on_mutual_swipe()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a right swipe
  IF NEW.direction = 'right' OR NEW.direction = 'super' THEN
    -- Check if the other person also swiped right
    IF EXISTS (
      SELECT 1 FROM dating_swipes
      WHERE swiper_id = NEW.swiped_id
      AND swiped_id = NEW.swiper_id
      AND direction IN ('right', 'super')
    ) THEN
      -- Create a match (with consistent ordering)
      INSERT INTO dating_matches (profile1_id, profile2_id, matched_at)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id),
        NOW()
      )
      ON CONFLICT (profile1_id, profile2_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create matches
DROP TRIGGER IF EXISTS trigger_create_match ON dating_swipes;
CREATE TRIGGER trigger_create_match
AFTER INSERT ON dating_swipes
FOR EACH ROW
EXECUTE FUNCTION create_match_on_mutual_swipe();

-- Function to update last_message_at in matches
CREATE OR REPLACE FUNCTION update_match_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dating_matches
  SET last_message_at = NEW.created_at
  WHERE id = NEW.match_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update match timestamp on new message
DROP TRIGGER IF EXISTS trigger_update_match_timestamp ON dating_messages;
CREATE TRIGGER trigger_update_match_timestamp
AFTER INSERT ON dating_messages
FOR EACH ROW
EXECUTE FUNCTION update_match_last_message();

-- Enable Row Level Security
ALTER TABLE dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dating_profiles
CREATE POLICY "Anyone can view active dating profiles"
ON dating_profiles FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can insert their own dating profile"
ON dating_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dating profile"
ON dating_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dating profile"
ON dating_profiles FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for dating_preferences
CREATE POLICY "Users can manage their own preferences"
ON dating_preferences FOR ALL
USING (dating_profile_id IN (
  SELECT id FROM dating_profiles WHERE user_id = auth.uid()
));

-- RLS Policies for dating_swipes
CREATE POLICY "Users can view their own swipes"
ON dating_swipes FOR SELECT
USING (swiper_id IN (
  SELECT id FROM dating_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create swipes"
ON dating_swipes FOR INSERT
WITH CHECK (swiper_id IN (
  SELECT id FROM dating_profiles WHERE user_id = auth.uid()
));

-- RLS Policies for dating_matches
CREATE POLICY "Users can view their own matches"
ON dating_matches FOR SELECT
USING (
  profile1_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
  OR profile2_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for dating_messages
CREATE POLICY "Users can view messages in their matches"
ON dating_messages FOR SELECT
USING (
  match_id IN (
    SELECT id FROM dating_matches
    WHERE profile1_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
    OR profile2_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their matches"
ON dating_messages FOR INSERT
WITH CHECK (
  sender_id IN (SELECT id FROM dating_profiles WHERE user_id = auth.uid())
  AND match_id IN (
    SELECT id FROM dating_matches
    WHERE profile1_id = sender_id OR profile2_id = sender_id
  )
);
