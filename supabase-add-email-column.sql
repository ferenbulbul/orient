-- ============================================
-- Profiles tablosuna email kolonu ekleme
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.

-- 1. Email kolonu ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Mevcut kullanıcıların emaillerini auth.users'dan çek
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Trigger güncelle: Yeni kullanıcı oluşunca email de kaydet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'musteri')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
