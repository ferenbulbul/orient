# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje Özeti

**Orient** — Euromatprint matbaası için üretim takip uygulaması + kurumsal tanıtım sitesi. React 19 + Vite SPA (JavaScript, TypeScript değil), Tailwind CSS v3, backend tamamen Supabase (Auth + Postgres + RLS + Storage + Edge Functions). UI dili Türkçe, `LanguageContext` ile İngilizce çeviri desteklenir (`isEN ? '...' : '...'` deseni her metinde inline kullanılır). Alan adları Türkçedir: `musteri_id`, `is_emri_no`, `durum`, `tabaka`, `en/boy` (ebat) vb.

## Komutlar

```bash
npm run dev        # Vite dev sunucusu
npm run build      # Prod build (doğrulama için de kullanılır)
npm run lint       # ESLint
npm run preview    # Build önizleme
```

- Test altyapısı yok.
- Ortam değişkenleri `.env.local` içinde: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Lint'te önceden var olan hatalar var (örn. `PaperPage.jsx` içinde kullanılmayan `role`, `useEffect` içinde setState). Build geçiyor; değişiklik doğrulamada `npm run build` esas alınır.
- Deploy: Vercel (`vercel.json` SPA rewrite içerir).

## Supabase Şema Yönetimi (ÖNEMLİ)

Migration'lar CLI ile değil, **repo kökündeki `supabase-*.sql` dosyaları Supabase SQL Editor'da elle çalıştırılarak** uygulanır. Dosyalar kümülatiftir ve sonra gelenler önceki `CREATE OR REPLACE FUNCTION` tanımlarını ezer:

- `supabase-migration.sql` — temel şema: `profiles`, `jobs`, `job_steps`, trigger'lar, `get_user_role()`
- `supabase-add-*.sql` — sonraki eklemeler (shipments, paper, roller, lojistik fazı, is_tipi...)
- **Güncel `create_job_steps` / `update_job_durum` tanımları `supabase-add-is-tipi.sql` içindedir** (en son çalıştırılan; lojistik dosyasındaki sürümleri ezer).
- Yeni şema değişikliği = köke yeni `supabase-add-<özellik>.sql` dosyası ekle; kullanıcı SQL Editor'da çalıştırır. Mevcut dosyaları düzenleme (zaten çalıştırılmışlardır).

`supabase/functions/` altında iki Edge Function var: `create-user` (admin'in kullanıcı oluşturması, service role ile) ve `send-email` (Resend üzerinden tüm bildirim mailleri; istemci tarafı sarmalayıcı `src/lib/email.js`).

## Veri Modeli ve İş Akışı

- `profiles` — kullanıcı + rol; `handle_new_user` trigger'ı signup'ta profil oluşturur. Yeni kullanıcı `src/lib/supabase.js` içindeki `createNewUser()` ile açılır (session'sız ayrı client, admin oturumunu bozmaz).
- `jobs` — iş emirleri. `durum` değerleri: `baski_oncesi → baskida → mucellit → lojistik → tamamlandi`. `is_tipi` (`baski` | `baski_cilt` | `mucellit`, NULL = eski işler = baski_cilt) hangi adımların oluşacağını belirler.
- `job_steps` — iş oluşunca `create_job_steps` trigger'ı is_tipi'ne göre adımları üretir; adım tamamlanınca `update_job_durum` trigger'ı işin durumunu otomatik günceller; `enforce_phase_order` faz sırasını zorlar. **Adım/faz mantığını istemcide değil bu DB trigger'larında ara.**
- `shipments` — parçalı sevkiyat; trigger toplam sevk edilen adet işin adedine ulaşınca durumu günceller.
- Kağıt stoğu: `paper_entries` (giriş, irsaliye dosyası zorunlu — Storage bucket `irsaliyeler`, signed URL ile görüntülenir) ve `paper_exits` (çıkış, iş emrine bağlı). **Stok tablosu yok** — net stok istemcide giriş−çıkış olarak hesaplanır (cins+gramaj+ebat kırılımında). KG formülü: `(en × boy × gramaj × tabaka) / 10000`. `paper_type_name` satırlara denormalize yazılır.
- Euromatprint (ev firması, `company_name` içinde "euromat" geçen cari ile tanınır) kağıt çıkış ekranında diğer firmalara **stok devri** yapabilir: kendi stoğuna çıkış + karşı firmaya giriş kaydı atılır (`PaperPage.jsx`, notlarda `Devir → / Devir ←` işareti).

## Teklif Fiyatlandırma Modülü

- Formüllerin ve sayfa yapısının tam spesifikasyonu `docs/teklif-hesaplama.md` (eski EuromatFMS programından deneylerle tersine mühendislik yapıldı, 20+ gerçek örnekle doğrulandı); katalog tohum verisi `docs/katalog-tohum.md`; şema+tohum `supabase-add-teklif.sql`.
- Hesap motoru `src/lib/teklifHesap.js` — saf fonksiyonlar; **formül değişikliği yapmadan önce `node scripts/teklifHesap.test.mjs` çalıştır** (gerçek ekran değerleriyle 51 test).
- Kritik kurallar: montaj katlama gridli (Tbk'da hesaplanır, elle ezilebilir); baskı tiraj farkı `forma × max(0, adet−dahil) × yüz × birim` (dahil=makine kartı, 5_Renk 3.000); cilt `max(Adet × max(forma+1, minForma) × birim, taban)`; kağıt/selefon fiyatları döviz bazlı (kur × fiyat), KO %5 sadece malzemeye, kar %5 toplama.
- Sayfalar: `/panel/teklif/yeni` (admin), `/panel/teklifler` (admin+moderator), `/panel/katalog` (admin yazar, moderator okur — makine/işlem/kağıt kartları + parametreler + kurlar). Teklif satırları `teklifler` tablosunda JSONB snapshot olarak saklanır.

## Roller ve Yetki

Güvenlik RLS-first: tüm tablo erişimi DB'de `get_user_role()` ile kontrol edilir; UI kontrolleri sadece görünürlük içindir. Roller: `admin`, `personel`, `depocu`, `moderator` (çoğunlukla salt-okunur + fiyat görür), `musteri` (sadece kendi kayıtları).

- Yetki helper'ları `src/context/AuthContext.jsx` içinde: `isAdmin`, `canViewAllJobs`, `canEditJobs`, `canManagePaper` (admin+depocu), `canViewPrice` (admin+moderator) vb. Yeni yetki eklerken buraya ekle.
- Route koruması `App.jsx`'te `<ProtectedRoute allowedRoles={[...]}>` ile yapılır.
- `/panel` girişi `DashboardRouter.jsx`'te role göre farklı dashboard'a dağıtılır.
- Bir role tablo erişimi eklerken hem AuthContext helper'ını hem de ilgili RLS policy'sini (yeni SQL dosyasıyla) güncellemek gerekir — ikisi ayrı katmandır.

## Yapı

- İki dünya tek app: public site (`/`, `/kurumsal/*`, `/hizmetlerimiz/*`...) ve panel (`/panel/*`, `/giris`). `App.jsx` panel rotalarında site kabuğunu (TopBar/Navbar/Footer) gizler.
- Panel sayfaları `src/pages/dashboard/`, panel bileşenleri `src/components/dashboard/` altında; her panel sayfası `DashboardLayout` ile sarılır.
- Sayfa içi filtre/sekme durumu bazı sayfalarda URL search param'larında tutulur (örn. `DepoStokPage`) — yeni filtre eklerken bu deseni koru.
- Sayı formatlama `src/lib/formatters.js` (`formatNumber`), görsel sıkıştırma `src/lib/imageCompression.js` (upload öncesi zorunlu geçiş).
