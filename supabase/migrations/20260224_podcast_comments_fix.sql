-- Ensure podcast_comments table exists with correct schema
CREATE TABLE IF NOT EXISTS public.podcast_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.podcast_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign keys if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'podcast_comments_user_id_fkey' 
    AND table_name = 'podcast_comments'
  ) THEN
    ALTER TABLE public.podcast_comments
    ADD CONSTRAINT podcast_comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'podcast_comments_podcast_id_fkey' 
    AND table_name = 'podcast_comments'
  ) THEN
    ALTER TABLE public.podcast_comments
    ADD CONSTRAINT podcast_comments_podcast_id_fkey 
    FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure podcast_ratings table exists
CREATE TABLE IF NOT EXISTS public.podcast_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(podcast_id, user_id)
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'podcast_ratings_user_id_fkey' 
    AND table_name = 'podcast_ratings'
  ) THEN
    ALTER TABLE public.podcast_ratings
    ADD CONSTRAINT podcast_ratings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'podcast_ratings_podcast_id_fkey' 
    AND table_name = 'podcast_ratings'
  ) THEN
    ALTER TABLE public.podcast_ratings
    ADD CONSTRAINT podcast_ratings_podcast_id_fkey 
    FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.podcast_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for podcast_comments
DROP POLICY IF EXISTS "Anyone can view podcast comments" ON public.podcast_comments;
CREATE POLICY "Anyone can view podcast comments" ON public.podcast_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert podcast comments" ON public.podcast_comments;
CREATE POLICY "Authenticated users can insert podcast comments" ON public.podcast_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own podcast comments" ON public.podcast_comments;
CREATE POLICY "Users can update own podcast comments" ON public.podcast_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own podcast comments" ON public.podcast_comments;
CREATE POLICY "Users can delete own podcast comments" ON public.podcast_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for podcast_ratings
DROP POLICY IF EXISTS "Anyone can view podcast ratings" ON public.podcast_ratings;
CREATE POLICY "Anyone can view podcast ratings" ON public.podcast_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert podcast ratings" ON public.podcast_ratings;
CREATE POLICY "Authenticated users can insert podcast ratings" ON public.podcast_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own podcast ratings" ON public.podcast_ratings;
CREATE POLICY "Users can update own podcast ratings" ON public.podcast_ratings FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_podcast_comments_podcast_id ON public.podcast_comments(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_user_id ON public.podcast_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_parent_id ON public.podcast_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_podcast_ratings_podcast_id ON public.podcast_ratings(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_ratings_user_id ON public.podcast_ratings(user_id);

-- Ensure podcasts storage bucket policies allow authenticated uploads
-- (Run this in Supabase dashboard if storage bucket "podcasts" doesn't exist)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('podcasts', 'podcasts', true) ON CONFLICT DO NOTHING;
