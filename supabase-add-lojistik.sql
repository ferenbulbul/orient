-- ============================================
-- Lojistik Fazı Ekleme (Phase 4)
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.
-- Mücellit sonrası, teslimden önce "Lojistik" fazı ekler.

-- 1. jobs tablosuna "lojistik" durumunu ekle
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_durum_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_durum_check
  CHECK (durum IN ('baski_oncesi', 'baskida', 'mucellit', 'lojistik', 'tamamlandi'));

-- 2. job_steps tablosuna phase 4 izni ekle
ALTER TABLE public.job_steps DROP CONSTRAINT IF EXISTS job_steps_phase_check;
ALTER TABLE public.job_steps ADD CONSTRAINT job_steps_phase_check
  CHECK (phase IN (1, 2, 3, 4));

-- 3. Trigger: Yeni iş oluşunca 8 adım (Lojistik dahil) oluştur
CREATE OR REPLACE FUNCTION public.create_job_steps()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.job_steps (job_id, phase, phase_name, step_order, step_name) VALUES
    (NEW.id, 1, 'Baskı Öncesi', 1, 'Doküman Onay'),
    (NEW.id, 1, 'Baskı Öncesi', 2, 'Kağıt'),
    (NEW.id, 1, 'Baskı Öncesi', 3, 'Bandrol'),
    (NEW.id, 2, 'Baskı',        1, 'Kapak Baskı'),
    (NEW.id, 2, 'Baskı',        2, 'İç Baskı'),
    (NEW.id, 2, 'Baskı',        3, 'Fason'),
    (NEW.id, 3, 'Mücellit',     1, 'Kırım'),
    (NEW.id, 3, 'Mücellit',     2, 'Cilt'),
    (NEW.id, 4, 'Lojistik',     1, 'Sevkiyat');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger: Durum otomatik güncelleme (4 faz destekli)
CREATE OR REPLACE FUNCTION public.update_job_durum()
RETURNS TRIGGER AS $$
DECLARE
  v_job_id UUID;
  p1_done BOOLEAN;
  p2_done BOOLEAN;
  p3_done BOOLEAN;
  p4_done BOOLEAN;
  new_durum TEXT;
BEGIN
  v_job_id := COALESCE(NEW.job_id, OLD.job_id);

  SELECT
    BOOL_AND(durum = 'tamamlandi') FILTER (WHERE phase = 1),
    BOOL_AND(durum = 'tamamlandi') FILTER (WHERE phase = 2),
    BOOL_AND(durum = 'tamamlandi') FILTER (WHERE phase = 3),
    BOOL_AND(durum = 'tamamlandi') FILTER (WHERE phase = 4)
  INTO p1_done, p2_done, p3_done, p4_done
  FROM public.job_steps
  WHERE job_id = v_job_id;

  IF COALESCE(p4_done, false) THEN
    new_durum := 'tamamlandi';
  ELSIF COALESCE(p3_done, false) THEN
    new_durum := 'lojistik';
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

-- 5. Faz sırası kontrolü (4 faz destekli)
CREATE OR REPLACE FUNCTION public.enforce_phase_order()
RETURNS TRIGGER AS $$
DECLARE
  prev_phase_complete BOOLEAN;
BEGIN
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

-- 6. Mevcut işlere lojistik adımı ekle (varsa)
INSERT INTO public.job_steps (job_id, phase, phase_name, step_order, step_name)
SELECT j.id, 4, 'Lojistik', 1, 'Sevkiyat'
FROM public.jobs j
WHERE NOT EXISTS (
  SELECT 1 FROM public.job_steps js
  WHERE js.job_id = j.id AND js.phase = 4
);
