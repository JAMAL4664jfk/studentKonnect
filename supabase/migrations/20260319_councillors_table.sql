-- ============================================================
--  COUNCILLORS TABLE — 2021 SA Local Government Elections
--  Source: Electoral Commission Notice 653 of 2021
--  Migration: 20260319_councillors_table.sql
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.councillors (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  province         TEXT NOT NULL,
  municipality     TEXT NOT NULL,
  party            TEXT NOT NULL,
  ward_list_order  TEXT,          -- e.g. "21001001" (ward) or "PR(1)" (proportional)
  seat_category    TEXT,          -- "Ward" | "PR" | "DC 40%"
  surname          TEXT NOT NULL,
  full_name        TEXT NOT NULL,
  seat_type        TEXT,          -- "LC ward" | "LC PR" | "DC 40%"
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes for fast filtering (province, municipality, party, name search)
CREATE INDEX IF NOT EXISTS idx_councillors_province     ON public.councillors (province);
CREATE INDEX IF NOT EXISTS idx_councillors_municipality ON public.councillors (municipality);
CREATE INDEX IF NOT EXISTS idx_councillors_party        ON public.councillors (party);
CREATE INDEX IF NOT EXISTS idx_councillors_seat_cat     ON public.councillors (seat_category);
CREATE INDEX IF NOT EXISTS idx_councillors_surname      ON public.councillors (surname);

-- Full-text search index on full_name + surname
CREATE INDEX IF NOT EXISTS idx_councillors_fts
  ON public.councillors
  USING gin(to_tsvector('english', full_name || ' ' || surname));

-- 3. Row Level Security — public read, no public write
ALTER TABLE public.councillors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Councillors are publicly readable"
  ON public.councillors
  FOR SELECT
  USING (true);

-- Only service_role / admin can insert/update/delete
CREATE POLICY "Only service role can modify councillors"
  ON public.councillors
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
--  HOW TO SEED DATA
-- ============================================================
-- Option A — Supabase Dashboard (recommended for first-time setup):
--   1. Go to Table Editor → councillors → Import CSV
--   2. Upload: supabase/councillors_seed.csv
--
-- Option B — psql / supabase CLI:
--   \copy public.councillors(province,municipality,party,ward_list_order,seat_category,surname,full_name,seat_type)
--   FROM 'supabase/councillors_seed.csv' CSV HEADER;
--
-- Option C — Supabase Storage + Edge Function (for automated pipelines):
--   Upload CSV to a private bucket, then call an Edge Function that
--   reads the file and bulk-inserts via the service_role client.
-- ============================================================
