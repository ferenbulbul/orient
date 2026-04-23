-- ============================================
-- Lojistik Parçalama (Partial Shipments)
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.
-- Sevkiyat adımını parçalı gönderi sistemine dönüştürür.

-- 1. shipments tablosu
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  adet INTEGER NOT NULL CHECK (adet > 0),
  irsaliye_path TEXT NOT NULL,
  irsaliye_original_name TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- 2. RLS policies
CREATE POLICY "Staff can read all shipments"
  ON public.shipments FOR SELECT
  USING (public.get_user_role() IN ('personel', 'admin', 'moderator'));

CREATE POLICY "Customers can read own job shipments"
  ON public.shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = shipments.job_id
        AND jobs.musteri_id = auth.uid()
    )
  );

CREATE POLICY "Staff can create shipments"
  ON public.shipments FOR INSERT
  WITH CHECK (public.get_user_role() IN ('personel', 'admin'));

CREATE POLICY "Admin can delete shipments"
  ON public.shipments FOR DELETE
  USING (public.get_user_role() = 'admin');

-- 3. Sevkiyat adımını otomatik tamamlama trigger'ı
CREATE OR REPLACE FUNCTION public.check_shipment_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_total_shipped INTEGER;
  v_job_adet INTEGER;
  v_sevkiyat_step_id UUID;
  v_job_id UUID;
BEGIN
  v_job_id := COALESCE(NEW.job_id, OLD.job_id);

  SELECT COALESCE(SUM(adet), 0) INTO v_total_shipped
  FROM public.shipments
  WHERE job_id = v_job_id;

  SELECT adet INTO v_job_adet
  FROM public.jobs
  WHERE id = v_job_id;

  SELECT id INTO v_sevkiyat_step_id
  FROM public.job_steps
  WHERE job_id = v_job_id AND phase = 4 AND step_name = 'Sevkiyat';

  IF v_sevkiyat_step_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_total_shipped >= v_job_adet THEN
    UPDATE public.job_steps
    SET durum = 'tamamlandi',
        completed_at = now(),
        completed_by = COALESCE(NEW.created_by, OLD.created_by)
    WHERE id = v_sevkiyat_step_id
      AND durum = 'bekliyor';
  ELSE
    UPDATE public.job_steps
    SET durum = 'bekliyor',
        completed_at = NULL,
        completed_by = NULL
    WHERE id = v_sevkiyat_step_id
      AND durum = 'tamamlandi';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_shipment_change
  AFTER INSERT OR DELETE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_shipment_completion();

-- 4. Storage bucket (irsaliye dosyaları için)
INSERT INTO storage.buckets (id, name, public)
VALUES ('irsaliyeler', 'irsaliyeler', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS policies
CREATE POLICY "Staff can upload irsaliye"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'irsaliyeler'
    AND public.get_user_role() IN ('personel', 'admin')
  );

CREATE POLICY "Authenticated can read irsaliye"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'irsaliyeler'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admin can delete irsaliye"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'irsaliyeler'
    AND public.get_user_role() = 'admin'
  );
