-- profiles tablosuna last_login sütunu ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT NULL;
