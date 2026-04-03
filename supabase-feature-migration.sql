-- =============================================================
-- Orient Feature Migration
-- Moderatör rolü, fiyat alanı, RLS güncellemeleri, email güncelleme
-- =============================================================

-- 1) profiles.role CHECK constraint güncelle → 'moderator' ekle
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('musteri', 'personel', 'admin', 'moderator'));

-- 2) jobs tablosuna fiyat kolonu ekle
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS fiyat DECIMAL(12,2);

-- 3) RLS SELECT policy'lerine 'moderator' ekle
-- Mevcut SELECT policy'yi kaldırıp yeniden oluştur
DROP POLICY IF EXISTS "jobs_select_policy" ON jobs;
CREATE POLICY "jobs_select_policy" ON jobs
  FOR SELECT USING (
    auth.uid() = musteri_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('personel', 'admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "job_steps_select_policy" ON job_steps;
CREATE POLICY "job_steps_select_policy" ON job_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_steps.job_id
      AND (
        jobs.musteri_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('personel', 'admin', 'moderator')
        )
      )
    )
  );

-- 4) update_user_email() SECURITY DEFINER fonksiyonu
-- Admin'in başka kullanıcıların email'ini güncellemesi için
CREATE OR REPLACE FUNCTION update_user_email(target_user_id UUID, new_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Sadece admin çağırabilir
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update user emails';
  END IF;

  -- auth.users tablosunu güncelle
  UPDATE auth.users SET email = new_email WHERE id = target_user_id;

  -- profiles tablosunu güncelle
  UPDATE profiles SET email = new_email WHERE id = target_user_id;
END;
$$;
