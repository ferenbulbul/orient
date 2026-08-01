// Hesap motoru doğrulama — docs/teklif-hesaplama.md'deki GERÇEK ekran
// değerleriyle birebir karşılaştırır. Çalıştır: node scripts/teklifHesap.test.mjs
import {
  montajHesapla, verimHesapla, sirtHesapla, acikKapakEni,
  kalipHesapla, baskiTutari, malzemeTutari, islemTutari,
  toplamHesapla, urunKg,
} from '../src/lib/teklifHesap.js'

let pass = 0
let fail = 0
function eq(name, got, want, tol = 0) {
  const ok = tol === 0 ? got === want : Math.abs(got - want) <= tol
  if (ok) { pass++ } else {
    fail++
    console.error(`✗ ${name}: beklenen ${want}, gelen ${got}`)
  }
}

// ---- Montaj (§9 — stok kartlarıyla doğrulanmış) ----
eq('montaj 12,5×19,5 @57×82 tbkda', montajHesapla(12.5, 19.5, 57, 82).tbkda, 32)
eq('montaj 12,5×19,5 @70×100 tbkda', montajHesapla(12.5, 19.5, 70, 100).tbkda, 32)
eq('montaj 12,5×19,5 @86×62 tbkda', montajHesapla(12.5, 19.5, 86, 62).tbkda, 32)
eq('montaj 19,5×27,5 @57×82 tbkda', montajHesapla(19.5, 27.5, 57, 82).tbkda, 16)
eq('montaj 19,5×27,5 @70×100 tbkda', montajHesapla(19.5, 27.5, 70, 100).tbkda, 16)
eq('montaj 19,5×27,5 @53×78 tbkda (sınır vakası)', montajHesapla(19.5, 27.5, 53, 78).tbkda, 8)
eq('montaj verim hep 1', montajHesapla(12.5, 19.5, 70, 100).verim, 1)

// ---- Kapak verimi + sırt (§1.2, DENEY KİTAP) ----
eq('kapak verim 25,72×19,5 @70×100', verimHesapla(25.72, 19.5, 70, 100), 10)
eq('kapak verim 25,16×19,5 @70×100', verimHesapla(25.16, 19.5, 70, 100), 10)
eq('sırt 32 sf', sirtHesapla(32), 0.16, 1e-9)
eq('sırt 144 sf', sirtHesapla(144), 0.72, 1e-9)
eq('açık kapak 12,5 / 32 sf', acikKapakEni(12.5, 32), 25.16, 1e-9)

// ---- Kalıp (§1.3 + §7, Deney 12 + Revolta işleri) ----
eq('kalıp 4 forma 1/1 perfektör', kalipHesapla(4, 1, 1, 'perfektor').kalip, 8)
eq('kalıp 4,5 forma 1/1 ön/arka', kalipHesapla(4.5, 1, 1, 'on_arka').kalip, 9)
eq('kalıp 1 forma 4/0 tek yüz', kalipHesapla(1, 4, 0, 'tek_yuz').kalip, 4)
eq('kalıp tek yüz Y=1', kalipHesapla(1, 1, 0, 'tek_yuz').yuz, 1)
eq('kalıp 0,5 forma 4/4 revolta', kalipHesapla(0.5, 4, 4, 'cevirme').kalip, 4)
eq('kalıp 0,25 forma 4/4 revolta', kalipHesapla(0.25, 4, 4, 'cevirme').kalip, 4)
eq('kalıp 3 forma 4/4 perfektör (ÇOCUKLAR)', kalipHesapla(3, 4, 4, 'perfektor').kalip, 24)

// ---- Baskı tutarı (§3 — Deney 0/3/11/12 + eski işler) ----
const R5 = { kalip_fiyat_1: 900, birim_fiyat_1: 0.175, dahil_adet: 3000 }
const TEK = { kalip_fiyat_1: 750, birim_fiyat_1: 0.15, dahil_adet: 3000 }
eq('baskı Q=2.000 (Deney 0)', baskiTutari({ makine: R5, kalip: 2, forma: 1, tabakaNet: 2000, yuz: 2 }), 1800)
eq('baskı Q=3.000', baskiTutari({ makine: R5, kalip: 2, forma: 1, tabakaNet: 3000, yuz: 2 }), 1800)
eq('baskı Q=3.100', baskiTutari({ makine: R5, kalip: 2, forma: 1, tabakaNet: 3100, yuz: 2 }), 1835)
eq('baskı Q=5.000', baskiTutari({ makine: R5, kalip: 2, forma: 1, tabakaNet: 5000, yuz: 2 }), 2500)
eq('baskı Q=10.000 (Deney 11)', baskiTutari({ makine: R5, kalip: 2, forma: 1, tabakaNet: 10000, yuz: 2 }), 4250)
eq('baskı tek yüz Q=5.000 (Deney 12)', baskiTutari({ makine: R5, kalip: 1, forma: 1, tabakaNet: 5000, yuz: 1 }), 1250)
eq('baskı 144sf 4,5 forma (BİLİM KURGU v2)', baskiTutari({ makine: R5, kalip: 9, forma: 4.5, tabakaNet: 22500, yuz: 2 }), 11250)
eq('baskı 128sf 4 forma Tek (BİLİM KURGU)', baskiTutari({ makine: TEK, kalip: 8, forma: 4, tabakaNet: 20000, yuz: 2 }), 8400)
eq('baskı 32sf Tek Q=5.000', baskiTutari({ makine: TEK, kalip: 2, forma: 1, tabakaNet: 5000, yuz: 2 }), 2100)
eq('baskı kapak 700 tb (eşik altı)', baskiTutari({ makine: R5, kalip: 4, forma: 0, tabakaNet: 700, yuz: 1 }), 3600)

// ---- Malzeme (§2 — 4 kağıt, 3 farklı gün kuru) ----
const KUR_1107 = { TRY: 1, USD: 46.9630, EUR: 53.6963 }
const KUR_2607 = { TRY: 1, USD: 47.3206, EUR: 53.8725 }
eq('malzeme 20.800 tb 55gr 53×82 (BİLİM KURGU)',
  malzemeTutari({ tabaka: 20800, kagit: { en: 53, boy: 82, gramaj: 55, satis_fiyat: 1.568, para_birimi: 'USD' }, kurlar: KUR_1107 }).tutar,
  38442, 5)
eq('malzeme 22.500 tb 70gr 57×81,5',
  malzemeTutari({ tabaka: 22500, kagit: { en: 57, boy: 81.5, gramaj: 70, satis_fiyat: 1.100, para_birimi: 'USD' }, kurlar: KUR_1107 }).tutar,
  39687, 5)
eq('malzeme Deney 0 (2.000 tb 70gr 57×82)',
  malzemeTutari({ tabaka: 2000, kagit: { en: 57, boy: 82, gramaj: 70, satis_fiyat: 1.100, para_birimi: 'USD' }, kurlar: KUR_1107 }).tutar,
  3549, 1)
eq('malzeme DENEY KİTAP iç (26.07 kuru)',
  malzemeTutari({ tabaka: 2000, kagit: { en: 57, boy: 82, gramaj: 70, satis_fiyat: 1.100, para_birimi: 'USD' }, kurlar: KUR_2607 }).tutar,
  3576, 1)
eq('malzeme DENEY KİTAP kapak (200 tb Bristol)',
  malzemeTutari({ tabaka: 200, kagit: { en: 70, boy: 100, gramaj: 220, satis_fiyat: 1.000, para_birimi: 'USD' }, kurlar: KUR_2607 }).tutar,
  1530, 1)

// ---- Cilt (§4.2 — 8 işle doğrulanan formül) ----
const AC_04 = { hesap_tipi: 'forma', para_birimi: 'TRY', min_forma: 10, taban_1: 4000, birim_1: 0.4 }
const AC_025 = { ...AC_04, birim_1: 0.25 }
const AC_DENEY = { ...AC_04, taban_1: 1200, birim_1: 0.08 }
const AC_035 = { ...AC_04, taban_1: 1200, birim_1: 0.35 }
eq('cilt KİTAP-2 (forma 10)', islemTutari(AC_04, { adet: 3000, ciltForma: 10 }), 13200)
eq('cilt UNTER (taban devrede)', islemTutari(AC_04, { adet: 1000, ciltForma: 9 }), 4000)
eq('cilt AJAN (forma 9, 0,25)', islemTutari(AC_025, { adet: 5000, ciltForma: 9 }), 12500)
eq('cilt YAZUKİ (forma 6 → min 10)', islemTutari(AC_025, { adet: 5000, ciltForma: 6 }), 12500)
eq('cilt ÇANAKKALE (forma 8 → min 10)', islemTutari(AC_025, { adet: 2500, ciltForma: 8 }), 6250)
eq('cilt DENEY (forma 2 → min 10)', islemTutari(AC_DENEY, { adet: 2000, ciltForma: 2 }), 1600)
eq('cilt BİLİM KURGU (forma 9, 0,35)', islemTutari(AC_035, { adet: 5000, ciltForma: 9 }), 17500)

// ---- Selefon (§4.1 — $/m² × kur, 4 iş 3 farklı gün) ----
const SELEFON = { hesap_tipi: 'm2', para_birimi: 'USD', taban_1: 750, birim_1: 0.13 }
const KUR_2107 = { TRY: 1, USD: 47.2494 }
const KUR_2307 = { TRY: 1, USD: 47.2866 }
eq('selefon BİLİM KURGU (700 tb 70×100, 11.07)',
  islemTutari(SELEFON, { tabaka: 700, en: 70, boy: 100 }, KUR_1107), 2991, 2)
eq('selefon UNTER (450 tb 65×90, 23.07)',
  islemTutari(SELEFON, { tabaka: 450, en: 65, boy: 90 }, KUR_2307), 1618, 2)
eq('selefon KİTAP-2 (1.700 tb 60×84, 21.07)',
  islemTutari(SELEFON, { tabaka: 1700, en: 60, boy: 84 }, KUR_2107), 5262, 2)
eq('selefon DENEY (200 tb 70×100, 26.07)',
  islemTutari(SELEFON, { tabaka: 200, en: 70, boy: 100 }, KUR_2607), 861, 1)
const EMBOSS = { hesap_tipi: 'm2', para_birimi: 'TRY', taban_1: 800, birim_1: 1.5 }
eq('emboss taban devrede (735 → 800)',
  islemTutari(EMBOSS, { tabaka: 700, en: 70, boy: 100 }), 800)

// ---- Shrink (§4.3) ----
const SHRINK = { hesap_tipi: 'paket', para_birimi: 'TRY', birim_1: 10 }
eq('shrink 5.000/20 paket', islemTutari(SHRINK, { adet: 5000, paketIci: 20 }), 2500)

// ---- Toplam zinciri (§5 — Deney 0) ----
const t = toplamHesapla({ baskiToplam: 1800, malzemeToplam: 3549.4, islemToplam: 0, karOrani: 5, adet: 2000 })
eq('fiyatlama (Deney 0)', t.fiyatlama, 5349.4, 0.1)
eq('karlı satış (Deney 0)', t.karliSatis, 5616.87, 0.1)
eq('birim fiyat (Deney 0)', t.birimFiyat, 2.80843, 0.001)

// ---- Ürün kg (yaklaşık — ekran 53) ----
eq('ürün kg Deney 0', urunKg({ adet: 2000, sayfa: 32, isEn: 12, isBoy: 19.5, gramaj: 70 }), 52.4, 0.1)

console.log(`\n${pass} test geçti, ${fail} test kaldı.`)
process.exit(fail > 0 ? 1 : 0)
