-- ============================================
-- Kagit Girisine Irsaliye Alanlari Ekleme
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da calistir.

ALTER TABLE public.paper_entries
  ADD COLUMN IF NOT EXISTS irsaliye_path TEXT,
  ADD COLUMN IF NOT EXISTS irsaliye_original_name TEXT;
