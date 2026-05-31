-- Kalıp adedi alanı: iş başına kalıp sayısını tutar
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS kalip_adedi INTEGER DEFAULT NULL;
