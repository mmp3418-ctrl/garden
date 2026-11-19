-- Garden City L.L.C — Supabase schema (public site + admin dashboard)
-- Run in the Supabase SQL Editor.

-- ---------------------------------------------------------------------------
-- 1) Site settings (single row — prefer id = 1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_title_ar text,
  hero_title_en text,
  hero_subtitle_ar text,
  hero_subtitle_en text,
  main_heading_ar text,
  main_heading_en text,
  complex_overview_ar text,
  complex_overview_en text,
  facilities_heading_ar text,
  facilities_heading_en text,
  facilities_intro_ar text,
  facilities_intro_en text,
  about_ar text,
  about_en text,
  vision_ar text,
  vision_en text,
  mission_ar text,
  mission_en text,
  phone text,
  whatsapp text,
  email text,
  address_ar text,
  address_en text,
  map_url text,
  hero_image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Safe additive migrations for existing projects
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS main_heading_ar text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS main_heading_en text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS complex_overview_ar text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS complex_overview_en text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facilities_heading_ar text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facilities_heading_en text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facilities_intro_ar text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facilities_intro_en text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp text;

-- ---------------------------------------------------------------------------
-- 2) Services / facilities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text,
  description_en text,
  icon_name text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_sort_order_idx
  ON public.services (sort_order ASC);

-- ---------------------------------------------------------------------------
-- 3) Gallery items (image-only cards on the public site)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text,
  title_en text,
  category_ar text,
  category_en text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_items_created_at_idx
  ON public.gallery_items (created_at DESC);

-- ---------------------------------------------------------------------------
-- 4) Contact messages inbox
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON public.contact_messages (created_at DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services"
  ON public.services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read gallery_items" ON public.gallery_items;
CREATE POLICY "Public read gallery_items"
  ON public.gallery_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public insert contact_messages" ON public.contact_messages;
CREATE POLICY "Public insert contact_messages"
  ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated admin writes
DROP POLICY IF EXISTS "Admin write site_settings" ON public.site_settings;
CREATE POLICY "Admin write site_settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write services" ON public.services;
CREATE POLICY "Admin write services"
  ON public.services FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write gallery_items" ON public.gallery_items;
CREATE POLICY "Admin write gallery_items"
  ON public.gallery_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage contact_messages" ON public.contact_messages;
CREATE POLICY "Admin manage contact_messages"
  ON public.contact_messages FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Starter settings row
INSERT INTO public.site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage bucket: media (create in Dashboard if missing, then run policies)
-- ---------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('media', 'media', true)
-- on conflict (id) do update set public = true;
--
-- DROP POLICY IF EXISTS "Public read media" ON storage.objects;
-- CREATE POLICY "Public read media" ON storage.objects
--   FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
--
-- DROP POLICY IF EXISTS "Admin upload media" ON storage.objects;
-- CREATE POLICY "Admin upload media" ON storage.objects
--   FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
--
-- DROP POLICY IF EXISTS "Admin update media" ON storage.objects;
-- CREATE POLICY "Admin update media" ON storage.objects
--   FOR UPDATE TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');
--
-- DROP POLICY IF EXISTS "Admin delete media" ON storage.objects;
-- CREATE POLICY "Admin delete media" ON storage.objects
--   FOR DELETE TO authenticated USING (bucket_id = 'media');
