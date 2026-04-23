-- Tamamlanan işler için pagination performansını artırmak adına index
-- Supabase SQL Editor'de çalıştırın

CREATE INDEX IF NOT EXISTS idx_jobs_durum_created_at ON jobs (durum, created_at DESC);

-- ilike aramaları için trigram index (opsiyonel ama önerilir)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_jobs_is_emri_no_trgm ON jobs USING gin (is_emri_no gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_is_adi_trgm ON jobs USING gin (is_adi gin_trgm_ops);
