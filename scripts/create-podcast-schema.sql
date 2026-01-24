-- Enhanced Podcast Feature Database Schema
-- This script creates all necessary tables for the podcast feature with video/audio support,
-- comments, likes, favorites, and reports

-- ============================================================================
-- 1. PODCAST EPISODES TABLE (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  
  -- Media files
  audio_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  
  -- Metadata
  duration INTEGER, -- in seconds
  file_size BIGINT, -- in bytes
  media_type TEXT CHECK (media_type IN ('audio', 'video')),
  
  -- Episode info
  host_name TEXT NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  featured BOOLEAN DEFAULT FALSE,
  
  -- Series info (optional)
  series_id UUID REFERENCES podcast_series(id) ON DELETE SET NULL,
  episode_number INTEGER,
  season_number INTEGER,
  
  -- Ownership
  user_id UUID NOT NULL,
  
  -- Counts (denormalized for performance)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. PODCAST SERIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS podcast_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. PODCAST COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS podcast_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES podcast_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. PODCAST COMMENT LIKES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS podcast_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES podcast_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- ============================================================================
-- 5. PODCAST LIKES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS podcast_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(podcast_id, user_id)
);

-- ============================================================================
-- 6. PODCAST FAVORITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS podcast_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(podcast_id, user_id)
);

-- ============================================================================
-- 7. PODCAST REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS podcast_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'inappropriate_content',
    'spam',
    'misleading',
    'copyright',
    'harassment',
    'other'
  )),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. PODCAST VIEWS TABLE (for analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS podcast_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  user_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Podcasts indexes
CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_series_id ON podcasts(series_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_category ON podcasts(category);
CREATE INDEX IF NOT EXISTS idx_podcasts_featured ON podcasts(featured);
CREATE INDEX IF NOT EXISTS idx_podcasts_release_date ON podcasts(release_date DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_podcast_comments_podcast_id ON podcast_comments(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_user_id ON podcast_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_parent_id ON podcast_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_created_at ON podcast_comments(created_at DESC);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_podcast_likes_podcast_id ON podcast_likes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_likes_user_id ON podcast_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comment_likes_comment_id ON podcast_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comment_likes_user_id ON podcast_comment_likes(user_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_podcast_favorites_podcast_id ON podcast_favorites(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_favorites_user_id ON podcast_favorites(user_id);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_podcast_reports_podcast_id ON podcast_reports(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_reports_status ON podcast_reports(status);

-- Views indexes
CREATE INDEX IF NOT EXISTS idx_podcast_views_podcast_id ON podcast_views(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_views_viewed_at ON podcast_views(viewed_at DESC);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC COUNT UPDATES
-- ============================================================================

-- Function to update podcast likes count
CREATE OR REPLACE FUNCTION update_podcast_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE podcasts SET likes_count = likes_count + 1 WHERE id = NEW.podcast_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE podcasts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.podcast_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_podcast_likes_count
AFTER INSERT OR DELETE ON podcast_likes
FOR EACH ROW EXECUTE FUNCTION update_podcast_likes_count();

-- Function to update podcast comments count
CREATE OR REPLACE FUNCTION update_podcast_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE podcasts SET comments_count = comments_count + 1 WHERE id = NEW.podcast_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE podcasts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.podcast_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_podcast_comments_count
AFTER INSERT OR DELETE ON podcast_comments
FOR EACH ROW EXECUTE FUNCTION update_podcast_comments_count();

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE podcast_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE podcast_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes_count
AFTER INSERT OR DELETE ON podcast_comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Function to update podcast favorites count
CREATE OR REPLACE FUNCTION update_podcast_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE podcasts SET favorites_count = favorites_count + 1 WHERE id = NEW.podcast_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE podcasts SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = OLD.podcast_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_podcast_favorites_count
AFTER INSERT OR DELETE ON podcast_favorites
FOR EACH ROW EXECUTE FUNCTION update_podcast_favorites_count();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_views ENABLE ROW LEVEL SECURITY;

-- Podcasts policies: Everyone can read, only owner can modify
CREATE POLICY "Anyone can read podcasts" ON podcasts FOR SELECT USING (true);
CREATE POLICY "Users can create podcasts" ON podcasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own podcasts" ON podcasts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own podcasts" ON podcasts FOR DELETE USING (auth.uid() = user_id);

-- Series policies
CREATE POLICY "Anyone can read series" ON podcast_series FOR SELECT USING (true);
CREATE POLICY "Users can create series" ON podcast_series FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own series" ON podcast_series FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own series" ON podcast_series FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can read comments" ON podcast_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON podcast_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON podcast_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON podcast_comments FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Anyone can read likes" ON podcast_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON podcast_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON podcast_likes FOR DELETE USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "Anyone can read comment likes" ON podcast_comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON podcast_comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike comments" ON podcast_comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can read own favorites" ON podcast_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON podcast_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON podcast_favorites FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can read own reports" ON podcast_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can report" ON podcast_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Views policies
CREATE POLICY "Anyone can create views" ON podcast_views FOR INSERT WITH CHECK (true);
