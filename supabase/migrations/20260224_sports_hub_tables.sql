-- Sports Hub tables migration

-- Fixture alerts: users can set alerts for upcoming fixtures
CREATE TABLE IF NOT EXISTS public.fixture_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fixture_id TEXT NOT NULL,
  fixture_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fixture_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own fixture alerts" ON public.fixture_alerts;
CREATE POLICY "Users can manage their own fixture alerts"
ON public.fixture_alerts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fitness challenge participants
CREATE TABLE IF NOT EXISTS public.fitness_challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT NOT NULL,
  challenge_title TEXT,
  progress INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.fitness_challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own challenge participation" ON public.fitness_challenge_participants;
CREATE POLICY "Users can manage their own challenge participation"
ON public.fitness_challenge_participants FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all challenge participants" ON public.fitness_challenge_participants;
CREATE POLICY "Users can view all challenge participants"
ON public.fitness_challenge_participants FOR SELECT
USING (true);

-- Esports tournament registrations
CREATE TABLE IF NOT EXISTS public.esports_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tournament_id TEXT NOT NULL,
  tournament_title TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tournament_id)
);

ALTER TABLE public.esports_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own esports registrations" ON public.esports_registrations;
CREATE POLICY "Users can manage their own esports registrations"
ON public.esports_registrations FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all esports registrations" ON public.esports_registrations;
CREATE POLICY "Users can view all esports registrations"
ON public.esports_registrations FOR SELECT
USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fixture_alerts_user_id ON public.fixture_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_participants_user_id ON public.fitness_challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_esports_registrations_user_id ON public.esports_registrations(user_id);
