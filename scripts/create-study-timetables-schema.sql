-- Create study_timetables table
CREATE TABLE IF NOT EXISTS study_timetables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  day_of_week TEXT[] NOT NULL, -- Array of days: Monday, Tuesday, etc.
  start_time TEXT NOT NULL, -- Format: HH:MM (e.g., "08:00")
  end_time TEXT NOT NULL, -- Format: HH:MM (e.g., "10:00")
  location TEXT,
  notes TEXT,
  is_repeating BOOLEAN DEFAULT true,
  reminder_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_study_timetables_user_id ON study_timetables(user_id);

-- Create index on day_of_week for filtering
CREATE INDEX IF NOT EXISTS idx_study_timetables_day_of_week ON study_timetables USING GIN(day_of_week);

-- Enable Row Level Security
ALTER TABLE study_timetables ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own timetables
CREATE POLICY "Users can view own timetables"
  ON study_timetables
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own timetables
CREATE POLICY "Users can insert own timetables"
  ON study_timetables
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own timetables
CREATE POLICY "Users can update own timetables"
  ON study_timetables
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own timetables
CREATE POLICY "Users can delete own timetables"
  ON study_timetables
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_study_timetables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_study_timetables_updated_at
  BEFORE UPDATE ON study_timetables
  FOR EACH ROW
  EXECUTE FUNCTION update_study_timetables_updated_at();

-- Grant permissions
GRANT ALL ON study_timetables TO authenticated;
GRANT ALL ON study_timetables TO service_role;
