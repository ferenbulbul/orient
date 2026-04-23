-- ============================================
-- Fason Adımı Ekleme (Baskı Fazı - Phase 2, Step 3)
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.
-- Baskı fazına 3. adım olarak "Fason" ekler.
-- Mücellit veya Lojistik aşamasındaki (veya tamamlanmış) işlerde
-- Fason adımı otomatik olarak tamamlanmış işaretlenir.

-- 1. Unique constraint güncelle (phase 2'de artık 3 adım olabilir)
--    Mevcut constraint zaten (job_id, phase, step_order) — yeni step_order=3 sorun çıkarmaz.

-- 2. Trigger'ı güncelle (9 adımlı yeni versiyon — supabase-add-lojistik.sql'de de güncellendi)
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

-- 3. Mevcut işlere Fason adımını ekle (henüz yoksa)
--    Mücellit (phase 3) veya sonrası tamamlanmışsa → Fason da tamamlanmış olarak ekle
--    Aksi halde → bekliyor olarak ekle
INSERT INTO public.job_steps (job_id, phase, phase_name, step_order, step_name, durum, completed_at)
SELECT
  j.id,
  2,
  'Baskı',
  3,
  'Fason',
  CASE
    WHEN (
      -- Mücellit fazının tüm adımları tamamlanmışsa → Fason da tamamlandı
      SELECT BOOL_AND(js2.durum = 'tamamlandi')
      FROM public.job_steps js2
      WHERE js2.job_id = j.id AND js2.phase = 3
    ) THEN 'tamamlandi'
    ELSE 'bekliyor'
  END,
  CASE
    WHEN (
      SELECT BOOL_AND(js2.durum = 'tamamlandi')
      FROM public.job_steps js2
      WHERE js2.job_id = j.id AND js2.phase = 3
    ) THEN now()
    ELSE NULL
  END
FROM public.jobs j
WHERE NOT EXISTS (
  SELECT 1 FROM public.job_steps js
  WHERE js.job_id = j.id AND js.phase = 2 AND js.step_order = 3
);
