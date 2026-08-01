-- ============================================
-- Kağıt Devir 400 Hatası Düzeltmesi
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.
--
-- Devir kaydında iş emri ve irsaliye olmaz; bu kolonlar NULL gönderilir.
-- Prod'da bu kolonlardan biri NOT NULL kaldıysa devir insert'i 400 döner.
-- DROP NOT NULL zaten nullable kolonda zararsız (no-op) olduğu için
-- ikisini de çalıştırmak güvenlidir.

ALTER TABLE public.paper_exits ALTER COLUMN is_emri_no DROP NOT NULL;
ALTER TABLE public.paper_entries ALTER COLUMN irsaliye_path DROP NOT NULL;
ALTER TABLE public.paper_entries ALTER COLUMN irsaliye_original_name DROP NOT NULL;

-- Kontrol: hâlâ NOT NULL olan kolonları listeler (bilgi amaçlı).
SELECT table_name, column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('paper_exits', 'paper_entries')
ORDER BY table_name, ordinal_position;
