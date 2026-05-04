-- ============================================
-- Kağıt Çıkış (Paper Exit) Sistemi
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.

CREATE TABLE IF NOT EXISTS public.paper_exits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musteri_id UUID NOT NULL REFERENCES public.profiles(id),
  is_emri_no TEXT,
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
ALTER TABLE public.paper_exits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Personel/admin/moderator tüm çıkışları okuyabilir
CREATE POLICY "Staff can read all paper exits"
  ON public.paper_exits FOR SELECT
  USING (public.get_user_role() IN ('personel', 'admin', 'moderator'));

-- Müşteri kendi çıkışlarını okuyabilir
CREATE POLICY "Customer can read own paper exits"
  ON public.paper_exits FOR SELECT
  USING (musteri_id = auth.uid());

-- Personel/admin çıkış kaydı oluşturabilir
CREATE POLICY "Staff can create paper exits"
  ON public.paper_exits FOR INSERT
  WITH CHECK (public.get_user_role() IN ('personel', 'admin'));

-- Sadece admin çıkış kaydı silebilir
CREATE POLICY "Admin can delete paper exits"
  ON public.paper_exits FOR DELETE
  USING (public.get_user_role() = 'admin');
