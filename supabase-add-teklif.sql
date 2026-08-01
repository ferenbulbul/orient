-- ============================================
-- Teklif Fiyatlandırma Modülü
-- ============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştır.
-- Kaynak: docs/teklif-hesaplama.md (formüller) + docs/katalog-tohum.md (tohum veri)
--
-- Tablolar:
--   teklif_makineler    : baskı makinesi kartları
--   teklif_islemler     : baskı sonrası işlem kartları (cilt, selefon, lak...)
--   teklif_kagitlar     : kağıt kartları (satış fiyatı + para birimi)
--   teklif_parametreler : genel parametreler (KO, kar, fire, sırt kalınlığı)
--   teklif_kurlar       : günlük döviz kurları
--   teklifler           : teklif kayıtları (satırlar JSONB)
--
-- Yetki: okuma admin+moderator (fiyat gören roller), yazma admin.

-- ============================================
-- 0. updated_at trigger fonksiyonu
-- ============================================
CREATE OR REPLACE FUNCTION public.teklif_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. Makine kartları
-- ============================================
CREATE TABLE IF NOT EXISTS public.teklif_makineler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad TEXT NOT NULL UNIQUE,
  istasyon TEXT,
  para_birimi TEXT NOT NULL DEFAULT 'TRY' CHECK (para_birimi IN ('TRY','USD','EUR')),
  dahil_adet NUMERIC NOT NULL DEFAULT 0,        -- kalıp fiyatına dahil tiraj (5_Renk: 3000)
  kalip_fiyat_1 NUMERIC NOT NULL DEFAULT 0,     -- kademe-1 kalıp fiyatı
  birim_fiyat_1 NUMERIC NOT NULL DEFAULT 0,     -- kademe-1 tiraj birimi (yüz başına)
  kademe_esigi NUMERIC,                          -- kademe-2'ye geçiş eşiği
  kalip_fiyat_2 NUMERIC,
  birim_fiyat_2 NUMERIC,
  aktif BOOLEAN NOT NULL DEFAULT true,
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teklif_makineler ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_teklif_makineler_updated ON public.teklif_makineler;
CREATE TRIGGER trg_teklif_makineler_updated
  BEFORE UPDATE ON public.teklif_makineler
  FOR EACH ROW EXECUTE FUNCTION public.teklif_set_updated_at();

-- ============================================
-- 2. İşlem kartları (baskı sonrası)
-- ============================================
CREATE TABLE IF NOT EXISTS public.teklif_islemler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad TEXT NOT NULL UNIQUE,
  kategori TEXT NOT NULL CHECK (kategori IN
    ('cilt','dikis','selefon','lak','kirim','kesim','susleme','paket','sevk','tezgah','diger')),
  istasyon TEXT,
  hesap_tipi TEXT NOT NULL CHECK (hesap_tipi IN
    ('forma','adet','m2','paket','sabit','serbest')),
  -- forma : Tutar = Adet × max(forma_cilt+1, min_forma) × birim  (taban: taban_1)
  -- adet  : Tutar = Miktar × birim                                (taban: taban_1)
  -- m2    : Tutar = Tabaka × (En×Boy/10000) × birim × kur         (taban: taban_1)
  -- paket : Tutar = ceil(Adet / paket_ici) × birim
  -- sabit : Tutar = taban_1
  para_birimi TEXT NOT NULL DEFAULT 'TRY' CHECK (para_birimi IN ('TRY','USD','EUR')),
  dahil_adet NUMERIC NOT NULL DEFAULT 0,
  min_forma NUMERIC NOT NULL DEFAULT 0,          -- forma hesabında minimum çarpan (Amerikan Cilt: 10)
  taban_1 NUMERIC,                               -- kademe-1 taban/kalıp ₺
  birim_1 NUMERIC,                               -- kademe-1 birim fiyat
  kademe_esigi NUMERIC,
  taban_2 NUMERIC,
  birim_2 NUMERIC,
  kb_taban NUMERIC,                              -- klişe/bıçak ek maliyeti (varak, gofre...)
  kb_birim NUMERIC,
  aktif BOOLEAN NOT NULL DEFAULT true,
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teklif_islemler ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_teklif_islemler_updated ON public.teklif_islemler;
CREATE TRIGGER trg_teklif_islemler_updated
  BEFORE UPDATE ON public.teklif_islemler
  FOR EACH ROW EXECUTE FUNCTION public.teklif_set_updated_at();

-- ============================================
-- 3. Kağıt kartları
-- ============================================
CREATE TABLE IF NOT EXISTS public.teklif_kagitlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cins TEXT NOT NULL,
  gramaj INTEGER NOT NULL CHECK (gramaj > 0),
  en NUMERIC NOT NULL CHECK (en > 0),            -- tabaka eni, cm
  boy NUMERIC NOT NULL CHECK (boy > 0),          -- tabaka boyu, cm
  satis_fiyat NUMERIC,                           -- birim/kg (para_birimi cinsinden)
  alis_fiyat NUMERIC,                            -- maliyet takibi için (opsiyonel)
  para_birimi TEXT NOT NULL DEFAULT 'USD' CHECK (para_birimi IN ('TRY','USD','EUR')),
  kalinlik_mm NUMERIC NOT NULL DEFAULT 0.1,      -- yaprak başına kalınlık (sırt hesabı)
  aktif BOOLEAN NOT NULL DEFAULT true,
  notlar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cins, gramaj, en, boy)
);
ALTER TABLE public.teklif_kagitlar ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_teklif_kagitlar_updated ON public.teklif_kagitlar;
CREATE TRIGGER trg_teklif_kagitlar_updated
  BEFORE UPDATE ON public.teklif_kagitlar
  FOR EACH ROW EXECUTE FUNCTION public.teklif_set_updated_at();

-- ============================================
-- 4. Genel parametreler
-- ============================================
CREATE TABLE IF NOT EXISTS public.teklif_parametreler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anahtar TEXT NOT NULL UNIQUE,
  deger NUMERIC NOT NULL,
  aciklama TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teklif_parametreler ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_teklif_parametreler_updated ON public.teklif_parametreler;
CREATE TRIGGER trg_teklif_parametreler_updated
  BEFORE UPDATE ON public.teklif_parametreler
  FOR EACH ROW EXECUTE FUNCTION public.teklif_set_updated_at();

-- ============================================
-- 5. Günlük kurlar
-- ============================================
CREATE TABLE IF NOT EXISTS public.teklif_kurlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarih DATE NOT NULL UNIQUE,
  usd NUMERIC NOT NULL,
  eur NUMERIC NOT NULL,
  gbp NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teklif_kurlar ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. Teklifler
-- ============================================
CREATE TABLE IF NOT EXISTS public.teklifler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teklif_no BIGINT GENERATED BY DEFAULT AS IDENTITY UNIQUE,
  -- iş bilgileri (Blok 1)
  musteri_id UUID REFERENCES public.profiles(id),  -- sistemdeki cari (opsiyonel)
  firma_adi TEXT NOT NULL,                          -- serbest cari adı
  is_adi TEXT NOT NULL,
  cinsi TEXT,                                       -- Kitap/Dergi/Katalog... (etiket)
  adet INTEGER NOT NULL CHECK (adet > 0),
  en NUMERIC NOT NULL,                              -- işin (kapalı) eni, cm
  boy NUMERIC NOT NULL,
  sayfa INTEGER,                                    -- iç sayfa (kapak hariç)
  ciltte INTEGER,                                   -- cilt formasında sayfa (4/8/16/32)
  cilt_turu TEXT,
  kapak_var BOOLEAN NOT NULL DEFAULT false,
  bandrol TEXT,
  termin DATE,
  notlar TEXT,
  -- hesap anlık görüntüsü (teklif anındaki değerler)
  kur_usd NUMERIC,
  kur_eur NUMERIC,
  kur_gbp NUMERIC,
  ko_orani NUMERIC NOT NULL DEFAULT 5,
  kar_orani NUMERIC NOT NULL DEFAULT 5,
  -- satırlar (yapı: docs/teklif-hesaplama.md §6)
  baski_satirlari JSONB NOT NULL DEFAULT '[]'::jsonb,
  sonrasi_satirlari JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- sonuçlar
  fiyatlama NUMERIC,
  karli_satis NUMERIC,
  satis_tutari NUMERIC,        -- elle yuvarlanabilir
  birim_fiyat NUMERIC,
  toplam_kg NUMERIC,
  durum TEXT NOT NULL DEFAULT 'taslak' CHECK (durum IN
    ('taslak','gonderildi','onaylandi','reddedildi')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teklifler ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_teklifler_updated ON public.teklifler;
CREATE TRIGGER trg_teklifler_updated
  BEFORE UPDATE ON public.teklifler
  FOR EACH ROW EXECUTE FUNCTION public.teklif_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_teklifler_durum ON public.teklifler(durum);
CREATE INDEX IF NOT EXISTS idx_teklifler_created ON public.teklifler(created_at DESC);

-- ============================================
-- RLS Policies
-- Fiyat bilgisi hassas: okuma admin+moderator, yazma admin.
-- (İleride personel'e teklif açma yetkisi verilecekse buradaki
--  policy'ler yeni bir SQL dosyasıyla genişletilir.)
-- ============================================

-- Kataloglar: 5 tablo için aynı desen
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['teklif_makineler','teklif_islemler','teklif_kagitlar','teklif_parametreler','teklif_kurlar']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Fiyat rolleri okuyabilir" ON public.%I', t);
    EXECUTE format($f$CREATE POLICY "Fiyat rolleri okuyabilir" ON public.%I
      FOR SELECT USING (public.get_user_role() IN ('admin','moderator'))$f$, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin ekleyebilir" ON public.%I', t);
    EXECUTE format($f$CREATE POLICY "Admin ekleyebilir" ON public.%I
      FOR INSERT WITH CHECK (public.get_user_role() = 'admin')$f$, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin guncelleyebilir" ON public.%I', t);
    EXECUTE format($f$CREATE POLICY "Admin guncelleyebilir" ON public.%I
      FOR UPDATE USING (public.get_user_role() = 'admin')$f$, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin silebilir" ON public.%I', t);
    EXECUTE format($f$CREATE POLICY "Admin silebilir" ON public.%I
      FOR DELETE USING (public.get_user_role() = 'admin')$f$, t);
  END LOOP;
END $$;

-- Teklifler
DROP POLICY IF EXISTS "Fiyat rolleri teklifleri okuyabilir" ON public.teklifler;
CREATE POLICY "Fiyat rolleri teklifleri okuyabilir"
  ON public.teklifler FOR SELECT
  USING (public.get_user_role() IN ('admin','moderator'));

DROP POLICY IF EXISTS "Admin teklif ekleyebilir" ON public.teklifler;
CREATE POLICY "Admin teklif ekleyebilir"
  ON public.teklifler FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin teklif guncelleyebilir" ON public.teklifler;
CREATE POLICY "Admin teklif guncelleyebilir"
  ON public.teklifler FOR UPDATE
  USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin teklif silebilir" ON public.teklifler;
CREATE POLICY "Admin teklif silebilir"
  ON public.teklifler FOR DELETE
  USING (public.get_user_role() = 'admin');

-- ============================================
-- TOHUM VERİLERİ (docs/katalog-tohum.md)
-- '?' işaretli değerler ekran görüntüsünden net okunamadı;
-- notlar sütununda 'teyit edilecek' yazar, katalog ekranından düzeltilir.
-- ============================================

-- ---- Makineler ----
INSERT INTO public.teklif_makineler
  (ad, istasyon, para_birimi, dahil_adet, kalip_fiyat_1, birim_fiyat_1, kademe_esigi, kalip_fiyat_2, birim_fiyat_2) VALUES
  ('Tek Renk', 'R 1/1',     'TRY', 3000, 750, 0.15,  7000, 750, 0.15),
  ('5_Renk',   '5.Renk',    'TRY', 3000, 900, 0.175, 8000, 800, 0.15),
  ('8_Renk',   '8.Renk',    'TRY', 3000, 850, 0.175, 8000, 750, 0.15),
  ('Dijital',  'Xerox_280', 'TRY', 1,    5,   5,     7000, NULL, NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Cilt işlemleri (hesap: forma) ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, dahil_adet, min_forma, taban_1, birim_1, kademe_esigi, taban_2, birim_2, notlar) VALUES
  ('Amerikan Cilt',                  'cilt', 'Acoro', 'forma', 'TRY', 1000, 10, 4000, 0.4,  8000,  4000, 0.4,  NULL),
  ('Amerikan Cilt Kulaklı',          'cilt', 'Acoro', 'forma', 'TRY', 1000, 10, 5000, 0.5,  8000,  5000, 0.5,  NULL),
  ('Amerikan Cilt Silikon Tutkallı', 'cilt', 'Acoro', 'forma', 'TRY', 1000, 10, 7000, 0.7,  7000,  400,  0.45, 'kademe-2 teyit edilecek'),
  ('Amerikan Cilt Yarım Tutkal',     'cilt', 'Acoro', 'forma', 'TRY', 1000, 10, 4000, 0.4,  7000,  400,  0.4,  'kademe-2 teyit edilecek'),
  ('Silikonlu Amerikan Cilt',        'cilt', 'Acoro', 'forma', 'TRY', 1000, 10, 7000, 0.7,  3501,  1200, 0.45, NULL),
  ('Pur Cilt',                       'cilt', 'Acoro', 'forma', 'TRY', 1000, 10, 750,  0.08, 437.5, 1000, 0.075, NULL),
  ('Harman (forma)',                 'cilt', 'Acoro', 'forma', 'TRY', 1000, 8,  2000, 0.15, 437.5, 2000, 0.15, NULL),
  ('Harman (Kitap)',                 'cilt', 'Acoro', 'forma', 'TRY', 1000, 1,  2000, 0.5,  437.5, 150,  0.5,  NULL),
  ('Harman (yaprak)',                'cilt', 'Acoro', 'adet',  'TRY', 0,    0,  0,    0.03, 437.5, NULL, 0.03, NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Dikişler (hesap: adet) ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, dahil_adet, taban_1, birim_1, kademe_esigi, taban_2, birim_2, notlar) VALUES
  ('İplik Dikiş',                    'dikis', 'İplik Dikiş', 'adet', 'TRY', 10000, 7000, 0.7,   631,  7000, 0.7,  NULL),
  ('Tel Dikiş',                      'dikis', 'Tel Dikiş',   'adet', 'TRY', 1000,  2000, 0.3,   8000, 750,  0.25, NULL),
  ('Tel Dikiş (Kendinden Kapaklı)',  'dikis', 'Tel Dikiş',   'adet', 'TRY', 1000,  2000, 0.25,  8000, 2500, 0.25, 'birim-1 teyit edilecek'),
  ('Omega Tel Dikiş (2''li)',        'dikis', 'Tel Dikiş',   'adet', 'TRY', 1000,  500,  0.025, 3500, 350,  0.035, 'birim-1 teyit edilecek'),
  ('Omega Tel Dikiş (4''lü)',        'dikis', 'Tel Dikiş',   'adet', 'TRY', 1000,  500,  0.045, 8000, 500,  0.05, NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Selefonlar (hesap: m2, DOLAR bazlı) ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, taban_1, birim_1, notlar) VALUES
  ('Parlak Selefon',       'selefon', 'Fason', 'm2', 'USD', 750, 0.13, 'doğrulandı: 0,13$ × kur = ekran 6,105/6,147/6,152'),
  ('Mat Selefon',          'selefon', 'Fason', 'm2', 'USD', 800, 0.14, NULL),
  ('Parlak Selefon Pur',   'selefon', 'Fason', 'm2', 'USD', 300, 0.11, NULL),
  ('Mat Selefon Pur',      'selefon', 'Fason', 'm2', 'USD', 300, 0.12, NULL),
  ('Kadife Selefon',       'selefon', 'Fason', 'm2', 'USD', 500, 0.55, NULL),
  ('Çizilmez Mat Selefon', 'selefon', 'Fason', 'm2', 'USD', 500, 0.6,  NULL),
  ('Metalize Selefon',     'selefon', 'Fason', 'm2', 'TRY', 500, 0.35, 'para birimi teyit edilecek'),
  ('Sedef Selefon',        'selefon', 'Fason', 'm2', 'TRY', 500, 0.18, 'para birimi teyit edilecek')
ON CONFLICT (ad) DO NOTHING;

-- ---- Laklar / kaplamalar (hesap: m2) ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, dahil_adet, taban_1, birim_1, kademe_esigi, taban_2, birim_2, notlar) VALUES
  ('Dış Lak Mat',      'lak', '704',   'm2', 'TRY', 1000, 500, 0.3,   8000, NULL, 0.3,   NULL),
  ('Dış Lak Parlak',   'lak', '704',   'm2', 'TRY', 1000, 500, 0.3,   8000, NULL, 0.3,   NULL),
  ('Dış Lak YarıMat',  'lak', '704',   'm2', 'TRY', 1000, 500, 0.2,   8000, NULL, 0.2,   NULL),
  ('Emboss Lak',       'lak', 'Fason', 'm2', 'TRY', 1000, 800, 0.5,   3501, 800,  1.5,   'doğrulandı: 700tb×0,7×1,5=735 → taban 800'),
  ('Efect Lak',        'lak', 'Fason', 'm2', 'TRY', 1000, 350, 0.66,  7000, NULL, NULL,  NULL),
  ('Kumlu Lak %20',    'lak', 'Fason', 'm2', 'TRY', 1000, 350, 0.66,  7000, NULL, NULL,  NULL),
  ('Kabartma Lak %20', 'lak', 'Fason', 'm2', 'TRY', 1000, 175, 0.175, 3500, 250,  0.25,  NULL),
  ('Lokal Lak %20',    'lak', 'Fason', 'm2', 'TRY', 1000, 250, 0.325, 3501, 600,  0.425, 'birim-1 teyit edilecek'),
  ('Lokal Lak %30',    'lak', 'Fason', 'm2', 'TRY', 1000, 425, 0.4,   3501, 650,  0.475, NULL),
  ('Lokal Lak %40',    'lak', 'Fason', 'm2', 'TRY', 1000, 550, 0.455, 3501, 700,  0.52,  NULL),
  ('Lokal Lak %50',    'lak', 'Fason', 'm2', 'TRY', 1000, 200, 0.25,  3501, 300,  0.185, NULL),
  ('Lokal Lak %60',    'lak', 'Fason', 'm2', 'TRY', 1000, 200, 0.25,  3501, 300,  0.2,   NULL),
  ('Lokal Lak %70',    'lak', 'Fason', 'm2', 'TRY', 1000, 200, 0.25,  3501, 300,  0.225, NULL),
  ('Lokal Lak %80',    'lak', 'Fason', 'm2', 'TRY', 1000, 200, 0.25,  3501, 300,  0.245, NULL),
  ('Lokal Lak %90',    'lak', 'Fason', 'm2', 'TRY', 1000, 200, 0.25,  3501, 300,  0.265, NULL),
  ('Simli Lak %20',    'lak', 'Fason', 'm2', 'TRY', 1000, 175, 0.7,   3501, 250,  0.7,   NULL),
  ('Simli Lak %30',    'lak', 'Fason', 'm2', 'TRY', 1000, 175, 0.7,   3501, 250,  0.7,   NULL),
  ('Termo Lak',        'lak', 'Fason', 'm2', 'TRY', 1000, 150, 0.13,  3500, 250,  0.26,  NULL),
  ('Tümsek Lak',       'lak', 'Fason', 'm2', 'TRY', 1000, 300, 0.18,  3500, 350,  0.228, NULL),
  ('Twin Lak',         'lak', 'Fason', 'm2', 'TRY', 0,    300, 0.5,   3500, 500,  1,     NULL),
  ('Lak UV',           'lak', 'Fason', 'm2', 'TRY', 0,    150, 0.45,  8000, 150,  0.45,  NULL),
  ('Pileki Lak',       'lak', 'Fason', 'm2', 'TRY', 1,    0,   1.9,   3501, 150,  0.1,   'birim-2 teyit edilecek'),
  ('Vernik Mat',       'lak', '704',   'm2', 'TRY', 3000, 500, 0.25,  8000, NULL, 0.25,  NULL),
  ('Vernik Parlak',    'lak', '704',   'm2', 'TRY', 3000, 500, 0.25,  8000, NULL, 0.25,  NULL),
  ('Kalıplı Vernik',   'lak', '704',   'm2', 'TRY', 1000, 500, 0.25,  8000, NULL, 0.25,  NULL),
  ('Jelatinleme',      'lak', 'Fason', 'adet','TRY', 0,   100, 0.65,  7000, NULL, NULL,  NULL),
  ('PVC Kaplama',      'lak', 'Fason', 'adet','TRY', 0,   NULL, 1,    7000, NULL, NULL,  NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Kırım / katlama (hesap: adet — miktar tabaka üzerinden gelir) ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, dahil_adet, taban_1, birim_1, kademe_esigi, taban_2, birim_2, notlar) VALUES
  ('Kırım Tek',      'kirim', 'Haidelberg_Kırım',    'adet', 'TRY', 0,     100, 0.03,   7000, NULL, NULL,   NULL),
  ('Kırım İki',      'kirim', 'MBO_Kırım',           'adet', 'TRY', 0,     100, 0.010,  7000, NULL, NULL,   NULL),
  ('Kırım Üç',       'kirim', 'Haidelberg_Kırım',    'adet', 'TRY', 0,     100, 0.015,  7000, NULL, NULL,   NULL),
  ('Kırım Dört',     'kirim', 'Otomatik Haidelberg', 'adet', 'TRY', 1000,  100, 0.02,   7000, NULL, NULL,   NULL),
  ('Kırım M',        'kirim', 'Haidelberg_Kırım',    'adet', 'TRY', 0,     100, 0.018,  7000, NULL, NULL,   NULL),
  ('Kırım Paralel',  'kirim', 'Haidelberg_Kırım',    'adet', 'TRY', 0,     100, 0.018,  7000, NULL, NULL,   NULL),
  ('Kırım Z',        'kirim', 'Haidelberg_Kırım',    'adet', 'TRY', 0,     100, 0.018,  7000, NULL, NULL,   NULL),
  ('Akordeon',       'kirim', 'Haidelberg_Kırım',    'adet', 'TRY', 1000,  100, 0.03,   3500, 100,  0.03,   NULL),
  ('Getfold katlama','kirim', 'Haidelberg_Kırım',    'adet', 'TRY', 10000, 100, 0.04,   3500, 100,  0.04,   NULL),
  ('Harita Katlama', 'kirim', 'Haidelberg_Kırım',    'adet', 'TRY', 1000,  500, 0.5,    8000, 250,  0.15,   NULL),
  ('Tutkallı Kırım', 'kirim', 'MBO_Tutkal',          'adet', 'TRY', 10000, 200, 0.0175, 1750, 200,  0.0225, NULL),
  ('Elde Katlama',   'kirim', 'Tezgah 1',            'adet', 'TRY', 0,     100, 0.025,  1750, NULL, NULL,   NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Kesimler ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, dahil_adet, taban_1, birim_1, kademe_esigi, taban_2, birim_2, kb_taban, kb_birim, notlar) VALUES
  ('Düz Kesim',     'kesim', 'Gyotin',   'adet', 'TRY', 0,    1000, 0.01,  3500, 1500, 0.02, NULL, NULL, NULL),
  ('Özel Kesim',    'kesim', 'Fason',    'adet', 'TRY', 1000, 2000, 1,     3500, 650,  0.25, 150,  0.1,  NULL),
  ('Pedal Kesim',   'kesim', 'Fason',    'adet', 'TRY', 1000, 100,  0.13,  3750, 300,  0.2,  150,  0.1,  'kademe-1 teyit edilecek'),
  ('Yarım Kesim',   'kesim', 'Fason',    'adet', 'TRY', 1000, 1500, 0.75,  1750, 1000, 0.75, 150,  0.1,  NULL),
  ('Puzzle Kesim',  'kesim', 'Fason',    'adet', 'TRY', 1000, 0,    1,     7000, NULL, NULL, 150,  0.1,  NULL),
  ('Parmak Kesim',  'kesim', 'Tezgah 1', 'adet', 'TRY', 1,    300,  1.5,   7000, NULL, NULL, NULL, NULL, NULL),
  ('Fihrist kesim', 'kesim', 'Fason',    'adet', 'TRY', 0,    NULL, NULL,  7000, NULL, NULL, NULL, NULL, 'fiyat kartta boş'),
  ('Perforaj',      'kesim', 'Fason',    'adet', 'TRY', 1000, 50,   0.035, 3500, 100,  0.07, NULL, NULL, NULL),
  ('Delik Açma',    'kesim', 'Tezgah 1', 'adet', 'TRY', 0,    150,  0.03,  1750, 150,  0.04, NULL, NULL, NULL),
  ('Radüs Kesim',   'kesim', 'Fason',    'adet', 'TRY', 0,    100,  0.4,   3500, 100,  0.04, NULL, NULL, 'kademe-2 teyit edilecek'),
  ('Radüs Yapma',   'kesim', 'Fason',    'adet', 'TRY', 0,    200,  3,     7000, NULL, NULL, NULL, NULL, NULL),
  ('Dilimleme',     'kesim', 'Fason',    'adet', 'TRY', 0,    100,  0.01,  7000, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Süsleme / özel işlemler ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, dahil_adet, taban_1, birim_1, kademe_esigi, taban_2, birim_2, kb_taban, kb_birim, notlar) VALUES
  ('Varak Altın',        'susleme', 'Fason', 'adet', 'TRY', 1000, 250, 0.13,  3500, 400, 0.2,   250, 1.6, NULL),
  ('Varak Gümüş',        'susleme', 'Fason', 'adet', 'TRY', 1000, 250, 0.13,  3500, 400, 0.2,   250, 1.6, NULL),
  ('Varak Renkli',       'susleme', 'Fason', 'adet', 'TRY', 1000, 250, 0.13,  3500, 400, 0.2,   250, 1.6, NULL),
  ('Kabartma',           'susleme', 'Fason', 'adet', 'TRY', 0,    NULL, NULL, 3500, NULL, NULL, 250, 1.6, NULL),
  ('Deboss (çökertme)',  'susleme', 'Fason', 'adet', 'TRY', 1000, NULL, NULL, 3500, NULL, NULL, 250, 1.6, NULL),
  ('Yakma Baskı',        'susleme', 'Fason', 'adet', 'TRY', 0,    NULL, NULL, 3500, NULL, NULL, 250, 1.6, NULL),
  ('Gofre',              'susleme', 'Fason', 'adet', 'TRY', 1000, 400, 0.04,  3500, 600, 0.06,  200, 0.8, NULL),
  ('Çökertme',           'susleme', 'Fason', 'adet', 'TRY', 1000, 100, 0.025, 3500, 150, 0.04,  100, 0.05, NULL),
  ('Numaratör',          'susleme', 'Fason', 'adet', 'TRY', 0,    75,  0.025, 3500, 100, 0.05,  NULL, NULL, NULL),
  ('Serigrafi Baskı',    'susleme', 'Fason', 'adet', 'TRY', 3000, 200, 0.3,   3500, NULL, 0.025, NULL, NULL, 'kademe-2 teyit edilecek'),
  ('Kenar Yaldız',       'susleme', 'Fason', 'adet', 'TRY', 0,    NULL, NULL, 1750, NULL, NULL, NULL, NULL, 'fiyat kartta boş')
ON CONFLICT (ad) DO NOTHING;

-- ---- Ambalaj / paketleme ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, taban_1, birim_1, notlar) VALUES
  ('Shrink',       'paket', 'Tezgah 1', 'paket', 'TRY', NULL, 3,    'işlerde paket başı 10 girilmiş (elle ezme)'),
  ('Koli',         'paket', 'Tezgah 1', 'paket', 'TRY', 100,  15,   NULL),
  ('Kraft Paket',  'paket', 'Tezgah 1', 'paket', 'TRY', NULL, 0.35, NULL),
  ('Lastik Paket', 'paket', 'Fason',    'adet',  'TRY', 100,  0.05, NULL),
  ('Poşetleme',    'paket', 'Fason',    'adet',  'TRY', 60,   0.08, 'birim teyit edilecek'),
  ('Kuşak Atma',   'paket', 'Tezgah 1', 'adet',  'TRY', 60,   0.1,  NULL),
  ('Euro Palet',   'paket', NULL,       'adet',  'TRY', 100,  1000, NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Sevkiyat (hesap: sabit) ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, taban_1, notlar) VALUES
  ('1 ton Anadolu yakası',  'sevk', 'Sevk Aracı', 'sabit', 'TRY', 2000, NULL),
  ('1 ton Avrupa yakası',   'sevk', 'Sevk Aracı', 'sabit', 'TRY', 1000, NULL),
  ('2 ton Anadolu yakası',  'sevk', 'Sevk Aracı', 'sabit', 'TRY', 500,  'tarife teyit edilecek (1 ton''dan ucuz görünüyor)'),
  ('2 ton Avrupa yakası',   'sevk', 'Sevk Aracı', 'sabit', 'TRY', 400,  'tarife teyit edilecek'),
  ('5 ton Anadolu yakası',  'sevk', 'Sevk Aracı', 'sabit', 'TRY', 1000, NULL),
  ('5 ton Avrupa yakası',   'sevk', 'Fason',      'sabit', 'TRY', 750,  NULL),
  ('10 ton Anadolu yakası', 'sevk', 'Sevk Aracı', 'sabit', 'TRY', 1250, NULL),
  ('10 ton Avrupa yakası',  'sevk', 'Sevk Aracı', 'sabit', 'TRY', 1000, NULL),
  ('Kargo Matbaadan',       'sevk', 'Sevk Aracı', 'sabit', 'TRY', 300,  NULL),
  ('Fason Nakliye',         'sevk', 'Sevk Aracı', 'sabit', 'TRY', 150,  NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Tezgah mikro-işlemleri (hesap: adet) ----
INSERT INTO public.teklif_islemler
  (ad, kategori, istasyon, hesap_tipi, para_birimi, taban_1, birim_1, notlar) VALUES
  ('Ayak Yapıştırma',            'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.03,  NULL),
  ('Ayıklama',                   'tezgah', 'Fason',    'adet', 'TRY', 200, 0.3,   NULL),
  ('Ayraç Alma',                 'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.04,  NULL),
  ('Bandrol Yapıştırma',         'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.08,  NULL),
  ('Bant Yapıştırma Tek Parça',  'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.05,  NULL),
  ('Doldurma',                   'tezgah', 'Tezgah 1', 'adet', 'TRY', 100, 1,     NULL),
  ('Dosya Çift Cep Yapıştırma',  'tezgah', 'Tezgah 1', 'adet', 'TRY', 100, 0.2,   NULL),
  ('Dosya Tek Cep Yapıştırma',   'tezgah', 'Tezgah 1', 'adet', 'TRY', 100, 0.1,   NULL),
  ('Dosya Teli Takma',           'tezgah', 'Tezgah 1', 'adet', 'TRY', 100, 0.06,  NULL),
  ('Kapak Yapıştırma',           'tezgah', 'Fason',    'adet', 'TRY', 200, 0.2,   NULL),
  ('Kroşe Takma',                'tezgah', 'Fason',    'adet', 'TRY', 60,  0.06,  NULL),
  ('Kurdela',                    'tezgah', 'Fason',    'adet', 'TRY', 60,  0.03,  NULL),
  ('Kuş Gözü Çakma',             'tezgah', 'Fason',    'adet', 'TRY', 100, 0.15,  NULL),
  ('Kutu Taslama',               'tezgah', 'Fason',    'adet', 'TRY', 100, 1.5,   NULL),
  ('Kutu Yapıştırma',            'tezgah', 'Fason',    'adet', 'TRY', 100, 0.06,  NULL),
  ('Küp Bloknot Yapma ve Doldurma','tezgah','Tezgah 1','adet', 'TRY', 60,  0.05,  NULL),
  ('Mıknatıslı Kilit',           'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.03,  NULL),
  ('Misina Bağlama',             'tezgah', 'Fason',    'adet', 'TRY', 100, 0.16,  'birim teyit edilecek'),
  ('Parçalama Dolum',            'tezgah', 'Tezgah 1', 'adet', 'TRY', 100, 0.15,  NULL),
  ('Pliyaj',                     'tezgah', 'Fason',    'adet', 'TRY', 100, 0.03,  NULL),
  ('Pvc Yapıştırma',             'tezgah', 'Fason',    'adet', 'TRY', 60,  0.04,  NULL),
  ('Sayım',                      'tezgah', 'Tezgah 1', 'adet', 'TRY', 100, 0.003, NULL),
  ('Sırt Sürme',                 'tezgah', 'Fason',    'adet', 'TRY', 150, 0.1,   NULL),
  ('Sıvama (Birbirine)',         'tezgah', 'Fason',    'adet', 'TRY', 0,   0.4,   NULL),
  ('Sıvama (Mukavva)',           'tezgah', 'Fason',    'adet', 'TRY', 0,   0.6,   NULL),
  ('Şerase',                     'tezgah', 'Fason',    'adet', 'TRY', 60,  0.03,  NULL),
  ('Şömiz Takma',                'tezgah', 'Tezgah 1', 'adet', 'TRY', 100, 0.4,   NULL),
  ('Taslama',                    'tezgah', 'Fason',    'adet', 'TRY', 100, 0.35,  NULL),
  ('Tutkal',                     'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.02,  NULL),
  ('Üstten İki Taçlı Bloknot',   'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.52,  NULL),
  ('Üstten Taçlı Bloknot',       'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.1,   NULL),
  ('Üstten Tutkallı Bloknot',    'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.04,  NULL),
  ('Vantuz Takma',               'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.06,  NULL),
  ('Yan ve Dip Yapıştırma',      'tezgah', 'Fason',    'adet', 'TRY', 500, 0.02,  NULL),
  ('Yan Yapıştırma',             'tezgah', 'Fason',    'adet', 'TRY', 200, 0.05,  NULL),
  ('Yapıştırma',                 'tezgah', 'Tezgah 1', 'adet', 'TRY', 60,  0.03,  NULL),
  ('Tek Parça Küçük Boy Çanta',  'tezgah', 'Fason',    'adet', 'TRY', 0,   0.55,  NULL),
  ('Tek Parça Orta Boy Çanta',   'tezgah', 'Fason',    'adet', 'TRY', 0,   0.6,   NULL),
  ('Tek Parça Büyük Boy Çanta',  'tezgah', 'Fason',    'adet', 'TRY', 0,   0.75,  NULL),
  ('İki Parça Orta Boy Çanta',   'tezgah', 'Fason',    'adet', 'TRY', 0,   0.75,  NULL),
  ('İki Parça Büyük Boy Çanta',  'tezgah', 'Fason',    'adet', 'TRY', 0,   0.8,   NULL),
  ('Flexi Kapak Takma',          'tezgah', 'Fason',    'adet', 'TRY', 0,   2,     NULL),
  ('Flexi Kapak Yapıştırma',     'tezgah', 'Fason',    'adet', 'TRY', 200, 0.2,   NULL),
  ('Sert Kapak',                 'tezgah', 'Fason',    'adet', 'TRY', 0,   2.5,   NULL)
ON CONFLICT (ad) DO NOTHING;

-- ---- Kağıt kartları ----
-- Satış fiyatı stok ekranındaki SATIŞ birim fiyatı (kg başına, para birimi cinsinden)
INSERT INTO public.teklif_kagitlar (cins, gramaj, en, boy, satis_fiyat, para_birimi) VALUES
  -- 1.Hamur (USD)
  ('1.Hamur', 60,  64, 86,     1.10, 'USD'),
  ('1.Hamur', 70,  56.9, 79.8, 1.10, 'USD'),
  ('1.Hamur', 70,  57, 80,     1.10, 'USD'),
  ('1.Hamur', 70,  57, 82,     1.10, 'USD'),
  ('1.Hamur', 70,  57, 86,     1.10, 'USD'),
  ('1.Hamur', 70,  57, 90,     1.10, 'USD'),
  ('1.Hamur', 70,  58, 80,     1.10, 'USD'),
  ('1.Hamur', 70,  58, 90,     1.10, 'USD'),
  ('1.Hamur', 80,  64, 90,     1.10, 'USD'),
  ('1.Hamur', 80,  64, 92,     1.10, 'USD'),
  ('1.Hamur', 90,  64, 90,     1.10, 'USD'),
  ('1.Hamur', 140, 64, 90,     1.10, 'USD'),
  -- Kitap Kağıdı (EUR)
  ('Kitap Kağıdı', 52, 57, 82,  1.20, 'EUR'),
  ('Kitap Kağıdı', 55, 57, 82,  1.20, 'EUR'),
  ('Kitap Kağıdı', 55, 53, 82,  1.20, 'EUR'),
  ('Kitap Kağıdı', 55, 68, 100, 1.20, 'EUR'),
  ('Kitap Kağıdı', 60, 50, 80,  1.20, 'EUR'),
  ('Kitap Kağıdı', 60, 53, 82,  1.20, 'EUR'),
  -- Holmen (EUR)
  ('Holmen', 52, 57, 82,  1.25, 'EUR'),
  ('Holmen', 55, 57, 82,  1.25, 'EUR'),
  ('Holmen', 65, 57, 82,  1.25, 'EUR'),
  ('Holmen', 65, 57, 90,  1.25, 'EUR'),
  ('Holmen', 70, 57, 88,  1.25, 'EUR'),
  ('Holmen', 70, 70, 100, 1.25, 'EUR'),
  -- Ivory (EUR)
  ('Ivory', 70, 57, 82, 1.08, 'EUR'),
  -- Mat Kuşe (EUR)
  ('Mat Kuşe', 90,  64, 90,  1.35, 'EUR'),
  ('Mat Kuşe', 130, 57, 82,  1.35, 'EUR'),
  ('Mat Kuşe', 130, 70, 100, 1.35, 'EUR'),
  ('Mat Kuşe', 170, 57, 82,  1.35, 'EUR'),
  ('Mat Kuşe', 200, 64, 90,  1.35, 'EUR'),
  ('Mat Kuşe', 250, 57, 82,  1.35, 'EUR'),
  ('Mat Kuşe', 250, 64, 90,  1.35, 'EUR'),
  ('Mat Kuşe', 300, 64, 90,  1.35, 'EUR'),
  ('Mat Kuşe', 300, 70, 100, 1.35, 'EUR'),
  -- Parlak Kuşe (EUR)
  ('Parlak Kuşe', 115, 64, 90,  1.35, 'EUR'),
  ('Parlak Kuşe', 130, 64, 90,  1.35, 'EUR'),
  ('Parlak Kuşe', 200, 70, 100, 1.35, 'EUR'),
  ('Parlak Kuşe', 350, 64, 90,  1.35, 'EUR'),
  -- Bristol (USD)
  ('Bristol', 200, 60, 80,  1.00, 'USD'),
  ('Bristol', 210, 60, 90,  1.00, 'USD'),
  ('Bristol', 210, 70, 100, 1.00, 'USD'),
  ('Bristol', 220, 70, 100, 1.00, 'USD'),
  ('Bristol', 225, 60, 95,  1.00, 'USD'),
  ('Bristol', 230, 60, 80,  1.00, 'USD'),
  ('Bristol', 230, 60, 84,  1.00, 'USD'),
  ('Bristol', 230, 64, 86,  1.00, 'USD'),
  ('Bristol', 230, 65, 86,  1.00, 'USD'),
  ('Bristol', 230, 65, 90,  1.00, 'USD'),
  ('Bristol', 230, 70, 100, 1.00, 'USD'),
  ('Bristol', 300, 64, 90,  1.00, 'USD'),
  ('Bristol', 350, 70, 100, 1.00, 'USD'),
  -- Krome Karton (fiyat kartta boş — katalog ekranından girilecek)
  ('Krome Karton', 350, 58, 85, NULL, 'USD')
ON CONFLICT (cins, gramaj, en, boy) DO NOTHING;

-- ---- Genel parametreler ----
INSERT INTO public.teklif_parametreler (anahtar, deger, aciklama) VALUES
  ('ko_orani',          5,   'Malzeme katsayısı %% (kağıt tutarına uygulanır)'),
  ('kar_orani',         5,   'Karlı satış oranı %% (Fiyatlama toplamına uygulanır)'),
  ('varsayilan_fire',   200, 'Forma başına varsayılan fire (tabaka)'),
  ('sirt_kalinlik_mm',  0.1, 'Yaprak başına varsayılan kalınlık, mm (sırt hesabı)'),
  ('shrink_paket_ici',  20,  'Shrink paketinde varsayılan adet')
ON CONFLICT (anahtar) DO NOTHING;

-- ---- Örnek kur kaydı (26.07.2026 — teklif ekranından) ----
INSERT INTO public.teklif_kurlar (tarih, usd, eur, gbp) VALUES
  ('2026-07-26', 47.3206, 53.8725, 63.1594)
ON CONFLICT (tarih) DO NOTHING;
