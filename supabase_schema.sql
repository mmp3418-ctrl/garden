-- Garden City L.L.C Admin — run in Supabase SQL Editor

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
  logo_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS main_heading_ar text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS main_heading_en text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS complex_overview_ar text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS complex_overview_en text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facilities_heading_ar text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facilities_heading_en text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facilities_intro_ar text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facilities_intro_en text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url text;

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

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text,
  title_en text,
  category_ar text,
  category_en text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  username text NOT NULL,
  password text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.admin_credentials (id, username, password)
VALUES (1, 'admin', '20262026')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Public/anon read for content tables (dashboard uses anon key + local session)
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public write site_settings" ON public.site_settings;
CREATE POLICY "Public write site_settings" ON public.site_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public write services" ON public.services;
CREATE POLICY "Public write services" ON public.services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read gallery_items" ON public.gallery_items;
CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public write gallery_items" ON public.gallery_items;
CREATE POLICY "Public write gallery_items" ON public.gallery_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert contact_messages" ON public.contact_messages;
CREATE POLICY "Public insert contact_messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public manage contact_messages" ON public.contact_messages;
CREATE POLICY "Public manage contact_messages" ON public.contact_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public manage admin_credentials" ON public.admin_credentials;
CREATE POLICY "Public manage admin_credentials" ON public.admin_credentials FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
