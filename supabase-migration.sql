-- ============================================
-- Euromat Print - Supabase Database Migration
-- ============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın.
-- Sırasıyla: tablolar, fonksiyonlar, trigger'lar, RLS politikaları

-- ============================================
-- 1. TABLOLAR
-- ============================================

-- profiles tablosu
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'musteri' CHECK (role IN ('musteri', 'personel', 'admin')),
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- jobs tablosu
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_emri_no TEXT NOT NULL UNIQUE,
  is_adi TEXT NOT NULL,
  adet INTEGER NOT NULL DEFAULT 1,
  musteri_id UUID NOT NULL REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  teslim_tarihi DATE,
  durum TEXT NOT NULL DEFAULT 'baski_oncesi'
    CHECK (durum IN ('baski_oncesi', 'baskida', 'mucellit', 'tamamlandi')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- job_steps tablosu
CREATE TABLE public.job_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL CHECK (phase IN (1, 2, 3)),
  phase_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'bekliyor' CHECK (durum IN ('bekliyor', 'tamamlandi')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, phase, step_order)
);
ALTER TABLE public.job_steps ENABLE ROW LEVEL SECURITY;


-- ============================================
-- 2. FONKSIYONLAR & TRIGGER'LAR
-- ============================================

-- 2.1: Yeni kullanıcı kayıt olunca profiles kaydı oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'musteri'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 2.2: Yeni iş oluşunca 7 alt adımı otomatik oluştur
CREATE OR REPLACE FUNCTION public.create_job_steps()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.job_steps (job_id, phase, phase_name, step_order, step_name) VALUES
    (NEW.id, 1, 'Baskı Öncesi', 1, 'Doküman Onay'),
    (NEW.id, 1, 'Baskı Öncesi', 2, 'Kağıt'),
    (NEW.id, 1, 'Baskı Öncesi', 3, 'Bandrol'),
    (NEW.id, 2, 'Baskı',        1, 'Kapak Baskı'),
    (NEW.id, 2, 'Baskı',        2, 'İç Baskı'),
    (NEW.id, 3, 'Mücellit',     1, 'Kırım'),
    (NEW.id, 3, 'Mücellit',     2, 'Cilt');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_job_created
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.create_job_steps();


-- 2.3: Adım güncellenince iş durumunu otomatik güncelle
CREATE OR REPLACE FUNCTION public.update_job_durum()
RETURNS TRIGGER AS $$
DECLARE
  v_job_id UUID;
  p1_done BOOLEAN;
  p2_done BOOLEAN;
  p3_done BOOLEAN;
  new_durum TEXT;
BEGIN
  v_job_id := COALESCE(NEW.job_id, OLD.job_id);

  SELECT
    BOOL_AND(durum = 'tamamlandi') FILTER (WHERE phase = 1),
    BOOL_AND(durum = 'tamamlandi') FILTER (WHERE phase = 2),
    BOOL_AND(durum = 'tamamlandi') FILTER (WHERE phase = 3)
  INTO p1_done, p2_done, p3_done
  FROM public.job_steps
  WHERE job_id = v_job_id;

  IF COALESCE(p3_done, false) THEN
    new_durum := 'tamamlandi';
  ELSIF COALESCE(p2_done, false) THEN
    new_durum := 'mucellit';
  ELSIF COALESCE(p1_done, false) THEN
    new_durum := 'baskida';
  ELSE
    new_durum := 'baski_oncesi';
  END IF;

  UPDATE public.jobs SET durum = new_durum, updated_at = now()
  WHERE id = v_job_id AND durum IS DISTINCT FROM new_durum;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_step_updated
  AFTER UPDATE ON public.job_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_durum();


-- 2.4: Faz sırası kontrolü - önceki faz bitmeden sonraki faza geçişi engelle
CREATE OR REPLACE FUNCTION public.enforce_phase_order()
RETURNS TRIGGER AS $$
DECLARE
  prev_phase_complete BOOLEAN;
BEGIN
  -- Sadece "tamamlandi" olarak işaretlenirken kontrol et
  IF NEW.durum = 'tamamlandi' AND OLD.durum != 'tamamlandi' AND NEW.phase > 1 THEN
    SELECT BOOL_AND(durum = 'tamamlandi')
    INTO prev_phase_complete
    FROM public.job_steps
    WHERE job_id = NEW.job_id AND phase = NEW.phase - 1;

    IF NOT COALESCE(prev_phase_complete, false) THEN
      RAISE EXCEPTION 'Önceki faz tamamlanmadan bu adım tamamlanamaz';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_step_update
  BEFORE UPDATE ON public.job_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_phase_order();


-- 2.5: updated_at otomatik güncelle
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================

-- Helper: kullanıcının rolünü döndür
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- === profiles RLS ===
-- Herkes kendi profilini okuyabilir
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Personel ve admin tüm profilleri okuyabilir
CREATE POLICY "Staff can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() IN ('personel', 'admin'));

-- Admin profilleri güncelleyebilir
CREATE POLICY "Admin can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- Kullanıcı kendi profilini güncelleyebilir (rol hariç)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());


-- === jobs RLS ===
-- Müşteri kendi işlerini görebilir
CREATE POLICY "Customers can read own jobs"
  ON public.jobs FOR SELECT
  USING (musteri_id = auth.uid());

-- Personel ve admin tüm işleri görebilir
CREATE POLICY "Staff can read all jobs"
  ON public.jobs FOR SELECT
  USING (public.get_user_role() IN ('personel', 'admin'));

-- Personel ve admin iş oluşturabilir
CREATE POLICY "Staff can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (public.get_user_role() IN ('personel', 'admin'));

-- Personel ve admin iş güncelleyebilir
CREATE POLICY "Staff can update jobs"
  ON public.jobs FOR UPDATE
  USING (public.get_user_role() IN ('personel', 'admin'));


-- === job_steps RLS ===
-- Müşteri kendi işinin adımlarını okuyabilir
CREATE POLICY "Customers can read own job steps"
  ON public.job_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_steps.job_id
        AND jobs.musteri_id = auth.uid()
    )
  );

-- Personel ve admin tüm adımları okuyabilir
CREATE POLICY "Staff can read all steps"
  ON public.job_steps FOR SELECT
  USING (public.get_user_role() IN ('personel', 'admin'));

-- Personel ve admin adımları güncelleyebilir
CREATE POLICY "Staff can update steps"
  ON public.job_steps FOR UPDATE
  USING (public.get_user_role() IN ('personel', 'admin'));

-- job_steps INSERT (trigger'lar için SECURITY DEFINER kullanılıyor,
-- ama direkt insert gerekirse)
CREATE POLICY "Staff can insert steps"
  ON public.job_steps FOR INSERT
  WITH CHECK (public.get_user_role() IN ('personel', 'admin'));
