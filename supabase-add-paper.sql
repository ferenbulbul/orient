-- ============================================
-- Kağıt Stok Takip Sistemi
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.

-- 1. Kağıt Cinsleri tablosu
CREATE TABLE IF NOT EXISTS public.paper_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.paper_types ENABLE ROW LEVEL SECURITY;

-- 2. Kağıt Gramajları tablosu
CREATE TABLE IF NOT EXISTS public.paper_grammages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value INTEGER NOT NULL UNIQUE CHECK (value > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.paper_grammages ENABLE ROW LEVEL SECURITY;

-- 3. Kağıt Giriş Kayıtları tablosu
CREATE TABLE IF NOT EXISTS public.paper_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musteri_id UUID NOT NULL REFERENCES public.profiles(id),
  paper_type_id UUID NOT NULL REFERENCES public.paper_types(id),
  paper_type_name TEXT NOT NULL,
  grammage INTEGER NOT NULL CHECK (grammage > 0),
  en INTEGER NOT NULL CHECK (en > 0),
  boy INTEGER NOT NULL CHECK (boy > 0),
  tabaka INTEGER NOT NULL CHECK (tabaka > 0),
  kg DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.paper_entries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- paper_types: herkes okuyabilir, admin CRUD
CREATE POLICY "Anyone can read paper types"
  ON public.paper_types FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert paper types"
  ON public.paper_types FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admin can update paper types"
  ON public.paper_types FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin can delete paper types"
  ON public.paper_types FOR DELETE
  USING (public.get_user_role() = 'admin');

-- paper_grammages: herkes okuyabilir, admin CRUD
CREATE POLICY "Anyone can read paper grammages"
  ON public.paper_grammages FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert paper grammages"
  ON public.paper_grammages FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admin can update paper grammages"
  ON public.paper_grammages FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin can delete paper grammages"
  ON public.paper_grammages FOR DELETE
  USING (public.get_user_role() = 'admin');

-- paper_entries: personel/admin okur ve ekler, admin siler, müşteri kendi kayıtlarını okur
CREATE POLICY "Staff can read all paper entries"
  ON public.paper_entries FOR SELECT
  USING (public.get_user_role() IN ('personel', 'admin', 'moderator'));

CREATE POLICY "Customer can read own paper entries"
  ON public.paper_entries FOR SELECT
  USING (musteri_id = auth.uid());

CREATE POLICY "Staff can create paper entries"
  ON public.paper_entries FOR INSERT
  WITH CHECK (public.get_user_role() IN ('personel', 'admin'));

CREATE POLICY "Admin can delete paper entries"
  ON public.paper_entries FOR DELETE
  USING (public.get_user_role() = 'admin');

-- ============================================
-- Varsayılan Kağıt Cinsleri
-- ============================================
INSERT INTO public.paper_types (name) VALUES
  ('1.Hamur'),
  ('3.Hamur'),
  ('Parlak Kuşe'),
  ('Mat Kuşe'),
  ('Bristol'),
  ('İvory'),
  ('Sticker')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Varsayılan Kağıt Gramajları
-- ============================================
INSERT INTO public.paper_grammages (value) VALUES
  (45),(50),(52),(60),(65),(70),(75),(80),(90),(100),
  (115),(120),(130),(135),(140),(150),(170),(190),(200),
  (205),(210),(220),(230),(240),(250),(270),(300),(310),(350),(400)
ON CONFLICT (value) DO NOTHING;
