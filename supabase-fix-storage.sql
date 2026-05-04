-- =============================================
-- İrsaliye Storage Bucket + Policies
-- =============================================
-- Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştırın.
-- irsaliyeler bucket'ı yoksa oluşturur ve gerekli policy'leri ekler.

-- 1. Bucket oluştur (yoksa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('irsaliyeler', 'irsaliyeler', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Mevcut policy'leri temizle (varsa)
DROP POLICY IF EXISTS "Authenticated users can upload irsaliye" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read irsaliye" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete irsaliye" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update irsaliye" ON storage.objects;

-- 3. Upload policy - authenticated kullanıcılar dosya yükleyebilir
CREATE POLICY "Authenticated users can upload irsaliye"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'irsaliyeler');

-- 4. Read policy - authenticated kullanıcılar dosya okuyabilir
CREATE POLICY "Authenticated users can read irsaliye"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'irsaliyeler');

-- 5. Delete policy - authenticated kullanıcılar dosya silebilir
CREATE POLICY "Authenticated users can delete irsaliye"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'irsaliyeler');

-- 6. Update policy - authenticated kullanıcılar dosya güncelleyebilir
CREATE POLICY "Authenticated users can update irsaliye"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'irsaliyeler');
