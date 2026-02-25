-- ─── Anonymous Confessions ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS anonymous_confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '🤫',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Confession Likes ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS confession_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id UUID REFERENCES anonymous_confessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(confession_id, user_id)
);

-- ─── Confession Comments ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS confession_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id UUID REFERENCES anonymous_confessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Content Flags ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content_id, reporter_id)
);

-- ─── Notifications table (if not exists) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Confession storage bucket ────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'confession-media',
  'confession-media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- ─── RLS Policies ─────────────────────────────────────────────────────────────

ALTER TABLE anonymous_confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE confession_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE confession_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Confessions: anyone authenticated can read; user can insert/delete own
CREATE POLICY "Anyone can read confessions" ON anonymous_confessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can post confessions" ON anonymous_confessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own confessions" ON anonymous_confessions FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Anyone can read confession likes" ON confession_likes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can like confessions" ON confession_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike confessions" ON confession_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Anyone can read confession comments" ON confession_comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can post comments" ON confession_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON confession_comments FOR DELETE USING (auth.uid() = user_id);

-- Flags
CREATE POLICY "Users can submit flags" ON content_flags FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can read own flags" ON content_flags FOR SELECT USING (auth.uid() = reporter_id);

-- Notifications: users can only read their own
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── Storage policies ─────────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload confession media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'confession-media' AND auth.role() = 'authenticated');

CREATE POLICY "Public read for confession media"
ON storage.objects FOR SELECT
USING (bucket_id = 'confession-media');

CREATE POLICY "Users can delete own confession media"
ON storage.objects FOR DELETE
USING (bucket_id = 'confession-media' AND auth.uid() = owner);

-- ─── Trigger: update likes_count ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_confession_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE anonymous_confessions SET likes_count = likes_count + 1 WHERE id = NEW.confession_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE anonymous_confessions SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.confession_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS confession_likes_count_trigger ON confession_likes;
CREATE TRIGGER confession_likes_count_trigger
AFTER INSERT OR DELETE ON confession_likes
FOR EACH ROW EXECUTE FUNCTION update_confession_likes_count();

-- ─── Trigger: update comments_count ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_confession_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE anonymous_confessions SET comments_count = comments_count + 1 WHERE id = NEW.confession_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE anonymous_confessions SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.confession_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS confession_comments_count_trigger ON confession_comments;
CREATE TRIGGER confession_comments_count_trigger
AFTER INSERT OR DELETE ON confession_comments
FOR EACH ROW EXECUTE FUNCTION update_confession_comments_count();
