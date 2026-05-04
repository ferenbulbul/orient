-- ============================================
-- Depocu Rolu Ekleme (Guncellenmis - Idempotent)
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da calistir.
-- Birden fazla kez calistirmak guvenlidir (DROP IF EXISTS kullanilir).

-- 1) profiles tablosundaki role CHECK constraint guncelle
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('musteri', 'personel', 'admin', 'moderator', 'depocu'));

-- ============================================
-- Depocu: profiles erisimi
-- ============================================
DROP POLICY IF EXISTS "Depocu can read all profiles" ON public.profiles;
CREATE POLICY "Depocu can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'depocu');

-- ============================================
-- Kagit Giris (paper_entries) - depocu ekle
-- ============================================
DROP POLICY IF EXISTS "Depocu can read all paper entries" ON public.paper_entries;
CREATE POLICY "Depocu can read all paper entries"
  ON public.paper_entries FOR SELECT
  USING (public.get_user_role() = 'depocu');

DROP POLICY IF EXISTS "Depocu can create paper entries" ON public.paper_entries;
CREATE POLICY "Depocu can create paper entries"
  ON public.paper_entries FOR INSERT
  WITH CHECK (public.get_user_role() = 'depocu');

-- ============================================
-- Kagit Cikis (paper_exits) - depocu ekle
-- ============================================
DROP POLICY IF EXISTS "Depocu can read all paper exits" ON public.paper_exits;
CREATE POLICY "Depocu can read all paper exits"
  ON public.paper_exits FOR SELECT
  USING (public.get_user_role() = 'depocu');

DROP POLICY IF EXISTS "Depocu can create paper exits" ON public.paper_exits;
CREATE POLICY "Depocu can create paper exits"
  ON public.paper_exits FOR INSERT
  WITH CHECK (public.get_user_role() = 'depocu');

-- ============================================
-- Personel'den kagit giris/cikis yetkisi kaldir
-- ============================================
DROP POLICY IF EXISTS "Staff can create paper entries" ON public.paper_entries;
DROP POLICY IF EXISTS "Admin can create paper entries" ON public.paper_entries;
CREATE POLICY "Admin can create paper entries"
  ON public.paper_entries FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Staff can create paper exits" ON public.paper_exits;
DROP POLICY IF EXISTS "Admin can create paper exits" ON public.paper_exits;
CREATE POLICY "Admin can create paper exits"
  ON public.paper_exits FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

-- ============================================
-- Depocu: jobs + job_steps erisimi (personel ile ayni)
-- ============================================
DROP POLICY IF EXISTS "Depocu can read all jobs" ON public.jobs;
CREATE POLICY "Depocu can read all jobs"
  ON public.jobs FOR SELECT
  USING (public.get_user_role() = 'depocu');

DROP POLICY IF EXISTS "Depocu can create jobs" ON public.jobs;
CREATE POLICY "Depocu can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (public.get_user_role() = 'depocu');

DROP POLICY IF EXISTS "Depocu can update jobs" ON public.jobs;
CREATE POLICY "Depocu can update jobs"
  ON public.jobs FOR UPDATE
  USING (public.get_user_role() = 'depocu');

DROP POLICY IF EXISTS "Depocu can read job steps" ON public.job_steps;
CREATE POLICY "Depocu can read job steps"
  ON public.job_steps FOR SELECT
  USING (public.get_user_role() = 'depocu');

DROP POLICY IF EXISTS "Depocu can create job steps" ON public.job_steps;
CREATE POLICY "Depocu can create job steps"
  ON public.job_steps FOR INSERT
  WITH CHECK (public.get_user_role() = 'depocu');

DROP POLICY IF EXISTS "Depocu can update job steps" ON public.job_steps;
CREATE POLICY "Depocu can update job steps"
  ON public.job_steps FOR UPDATE
  USING (public.get_user_role() = 'depocu');

-- ============================================
-- Depocu: paper_types ve paper_grammages
-- ============================================
-- Bu tablolar zaten USING (true) ile herkese acik,
-- ama bazi Supabase sueruemlerinde sorun cikarabilir.
-- Ekstra politika ekliyoruz guvenlik icin.
DROP POLICY IF EXISTS "Depocu can read paper types" ON public.paper_types;
CREATE POLICY "Depocu can read paper types"
  ON public.paper_types FOR SELECT
  USING (public.get_user_role() = 'depocu');

DROP POLICY IF EXISTS "Depocu can read paper grammages" ON public.paper_grammages;
CREATE POLICY "Depocu can read paper grammages"
  ON public.paper_grammages FOR SELECT
  USING (public.get_user_role() = 'depocu');
