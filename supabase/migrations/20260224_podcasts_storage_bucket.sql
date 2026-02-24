-- Create podcasts storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'podcasts',
  'podcasts',
  true,
  524288000, -- 500MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/x-m4a',
        'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg',
        'image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/x-m4a',
        'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg',
        'image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage policies for podcasts bucket
DROP POLICY IF EXISTS "Public read access for podcasts" ON storage.objects;
CREATE POLICY "Public read access for podcasts"
ON storage.objects FOR SELECT
USING (bucket_id = 'podcasts');

DROP POLICY IF EXISTS "Authenticated users can upload to podcasts" ON storage.objects;
CREATE POLICY "Authenticated users can upload to podcasts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'podcasts' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own podcast files" ON storage.objects;
CREATE POLICY "Users can update their own podcast files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'podcasts' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own podcast files" ON storage.objects;
CREATE POLICY "Users can delete their own podcast files"
ON storage.objects FOR DELETE
USING (bucket_id = 'podcasts' AND auth.uid()::text = (storage.foldername(name))[1]);
