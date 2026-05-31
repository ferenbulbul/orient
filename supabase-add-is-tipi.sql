-- ============================================
-- İş Tipi Seçimi (3 farklı iş süreci)
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.

-- 1. jobs tablosuna is_tipi sütunu ekle
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_tipi TEXT DEFAULT NULL;
-- NULL = eski işler (baski_cilt olarak davranır)
-- Değerler: 'baski', 'baski_cilt', 'mucellit'

-- 2. Trigger: Yeni iş oluşunca iş tipine göre adımlar oluştur
CREATE OR REPLACE FUNCTION public.create_job_steps()
RETURNS TRIGGER AS $$
BEGIN
  CASE COALESCE(NEW.is_tipi, 'baski_cilt')
    WHEN 'baski' THEN
      INSERT INTO public.job_steps (job_id, phase, phase_name, step_order, step_name) VALUES
        (NEW.id, 1, 'Baskı Öncesi', 1, 'Doküman Onay'),
        (NEW.id, 1, 'Baskı Öncesi', 2, 'Kağıt'),
        (NEW.id, 2, 'Baskı',        1, 'Kapak Baskı'),
        (NEW.id, 2, 'Baskı',        2, 'İç Baskı'),
        (NEW.id, 2, 'Baskı',        3, 'Fason'),
        (NEW.id, 3, 'Lojistik',     1, 'Sevkiyat');

    WHEN 'mucellit' THEN
      INSERT INTO public.job_steps (job_id, phase, phase_name, step_order, step_name) VALUES
        (NEW.id, 1, 'Mücellit', 1, 'Kırım'),
        (NEW.id, 1, 'Mücellit', 2, 'Cilt'),
        (NEW.id, 2, 'Lojistik', 1, 'Sevkiyat');
      -- Mücellit tipi işler 'mucellit' durumuyla başlar
      UPDATE public.jobs SET durum = 'mucellit' WHERE id = NEW.id;

    ELSE -- 'baski_cilt' veya NULL (eski işler)
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
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger: Durum otomatik güncelleme (iş tipine göre)
CREATE OR REPLACE FUNCTION public.update_job_durum()
RETURNS TRIGGER AS $$
DECLARE
  v_job_id UUID;
  new_durum TEXT;
  phase_rec RECORD;
  all_done BOOLEAN;
  found_incomplete BOOLEAN := false;
BEGIN
  v_job_id := COALESCE(NEW.job_id, OLD.job_id);

  -- İşteki tüm fazları sırayla kontrol et
  FOR phase_rec IN
    SELECT DISTINCT phase, phase_name
    FROM public.job_steps
    WHERE job_id = v_job_id
    ORDER BY phase ASC
  LOOP
    SELECT BOOL_AND(durum = 'tamamlandi')
    INTO all_done
    FROM public.job_steps
    WHERE job_id = v_job_id AND phase = phase_rec.phase;

    IF NOT COALESCE(all_done, false) THEN
      -- Bu faz henüz tamamlanmamış, durum bu fazın adına göre belirlenir
      CASE phase_rec.phase_name
        WHEN 'Baskı Öncesi' THEN new_durum := 'baski_oncesi';
        WHEN 'Baskı'        THEN new_durum := 'baskida';
        WHEN 'Mücellit'     THEN new_durum := 'mucellit';
        WHEN 'Lojistik'     THEN new_durum := 'lojistik';
        ELSE new_durum := 'baski_oncesi';
      END CASE;
      found_incomplete := true;
      EXIT; -- İlk tamamlanmamış fazda dur
    END IF;
  END LOOP;

  -- Tüm fazlar tamamlandıysa
  IF NOT found_incomplete THEN
    new_durum := 'tamamlandi';
  END IF;

  UPDATE public.jobs SET durum = new_durum, updated_at = now()
  WHERE id = v_job_id AND durum IS DISTINCT FROM new_durum;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
