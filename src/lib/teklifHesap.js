// Teklif fiyatlandırma hesap motoru.
// Formüllerin kaynağı ve doğrulama örnekleri: docs/teklif-hesaplama.md
// Tüm fonksiyonlar saf — UI/DB bağımlılığı yok; scripts/teklifHesap.test.mjs
// dokümandaki gerçek örneklerle birebir doğrular.

// ---------------------------------------------------------------------------
// Montaj (katlama kısıtlı yerleşim) — §9
// ---------------------------------------------------------------------------

// Yüz başına geçerli katlama gridleri (sütun × satır), büyükten küçüğe.
// Tbk'da = grid × 2 yüz.
const KATLAMA_GRIDLERI = [
  { tbkda: 64, cols: 8, rows: 4 },
  { tbkda: 32, cols: 4, rows: 4 },
  { tbkda: 16, cols: 4, rows: 2 },
  { tbkda: 8, cols: 2, rows: 2 },
  { tbkda: 4, cols: 2, rows: 1 },
]

function sigar(w, h, En, Boy) {
  return (w <= En && h <= Boy) || (w <= Boy && h <= En)
}

/**
 * İç sayfalar için montaj: iş ebadı + tabaka ebadı → Tbk'da, verim, grid.
 * Ölçüler cm. Dönüş: { tbkda, verim, grid: {cols, rows, w, h} } | null (sığmıyor)
 */
export function montajHesapla(isEn, isBoy, tabakaEn, tabakaBoy) {
  for (const g of KATLAMA_GRIDLERI) {
    const w = g.cols * isEn
    const h = g.rows * isBoy
    if (!sigar(w, h, tabakaEn, tabakaBoy)) continue
    // Verim: aynı yerleşim tabakaya kaç kez sığıyor (iki yönelimin iyisi)
    const duz = Math.floor(tabakaEn / w) * Math.floor(tabakaBoy / h)
    const donuk = Math.floor(tabakaEn / h) * Math.floor(tabakaBoy / w)
    const verim = Math.max(duz, donuk, 1)
    return { tbkda: g.tbkda, verim, grid: { cols: g.cols, rows: g.rows, w, h } }
  }
  return null
}

/**
 * Tek parça işler (kapak vb.) için verim: tabakadan kaç parça çıkar.
 * İki saf yönelimin iyisi (§9.2 adım 4).
 */
export function verimHesapla(parcaEn, parcaBoy, tabakaEn, tabakaBoy) {
  const duz = Math.floor(tabakaEn / parcaEn) * Math.floor(tabakaBoy / parcaBoy)
  const donuk = Math.floor(tabakaEn / parcaBoy) * Math.floor(tabakaBoy / parcaEn)
  return Math.max(duz, donuk)
}

/** Sırt kalınlığı (cm) = yaprak sayısı × kalınlık(mm) / 10. 32 sf → 0,16 ✓ */
export function sirtHesapla(sayfa, kalinlikMm = 0.1) {
  return (sayfa / 2) * kalinlikMm / 10
}

/** Açık kapak eni = 2 × kapalı en + sırt (25,16 = 2×12,5 + 0,16 ✓) */
export function acikKapakEni(kapaliEn, sayfa, kalinlikMm = 0.1) {
  return 2 * kapaliEn + sirtHesapla(sayfa, kalinlikMm)
}

// ---------------------------------------------------------------------------
// Forma / tabaka / kalıp — §1
// ---------------------------------------------------------------------------

/** Baskı forması = satırın sayfası / Tbk'da (küsurat kalır: 144/32 = 4,5) */
export function formaHesapla(sayfa, tbkda) {
  if (!tbkda) return 0
  return sayfa / tbkda
}

/** Cilt forması = toplam sayfa / ciltte (yukarı yuvarlanır: 7,5 → 8) */
export function ciltFormaHesapla(sayfa, ciltte) {
  if (!ciltte) return 0
  return Math.ceil(sayfa / ciltte)
}

/** Fire = forma başına fire × ceil(forma); kapakta forma=1 kabul edilir */
export function fireHesapla(forma, birimFire = 200) {
  if (forma <= 0) return 0
  return birimFire * Math.ceil(forma)
}

/**
 * Satırın tabaka ihtiyacı.
 * İç: adet × forma + fire.  Kapak/tek parça: ceil(adet / verim) + fire.
 */
export function tabakaHesapla({ adet, forma = 0, verim = 1, fire = 0, tekParca = false }) {
  const net = tekParca ? Math.ceil(adet / Math.max(verim, 1)) : adet * forma
  return { net: Math.ceil(net), toplam: Math.ceil(net) + fire }
}

// Baskı şekilleri — §7. Kalıp sayısı ve yüz (geçiş) çarpanı.
export const BASKI_SEKILLERI = ['tek_yuz', 'on_arka', 'perfektor', 'cevirme']

/**
 * Kalıp sayısı ve tiraj yüz çarpanı.
 *   tek_yuz  : Klp = forma×r1            Y = 1
 *   on_arka  : Klp = forma×(r1+r2)       Y = 2
 *   perfektor: Klp = forma×(r1+r2)       Y = 2 (tek geçişte iki yüz basılsa da
 *              tiraj farkı 2 yüz sayar — 128sf işiyle doğrulandı)
 *   cevirme  : Klp = ceil(forma)×r1      Y = 2 (ön+arka aynı kalıpta; Revolta)
 */
export function kalipHesapla(forma, r1, r2, bSekli) {
  const f = Math.max(forma, 0)
  switch (bSekli) {
    case 'tek_yuz':
      return { kalip: Math.ceil(f * r1), yuz: 1 }
    case 'cevirme':
      return { kalip: Math.ceil(f) * r1, yuz: 2 }
    case 'perfektor':
    case 'on_arka':
    default:
      return { kalip: Math.ceil(f * (r1 + r2)), yuz: 2 }
  }
}

// ---------------------------------------------------------------------------
// Baskı maliyeti — §3 (KESİN: 3.000 eşiği + yüz çarpanı deneyle doğrulandı)
// ---------------------------------------------------------------------------

/**
 * Baskı satırı tutarı.
 * Tutar = Klp × kalıp fiyatı + forma × max(0, T_f − dahil) × yüz × birim
 * T_f = forma başına net tabaka (iç işlerde = adet, kapakta = adet/verim).
 * Not: makine kartındaki kademe-2 alanları v1'de uygulanmıyor (Q=10.000
 * deneyinde tek kademe doğrulandı); kademe kuralı netleşirse buraya eklenir.
 */
export function baskiTutari({ makine, kalip, forma, tabakaNet, yuz }) {
  if (!makine) return 0
  const kalipMaliyet = kalip * (makine.kalip_fiyat_1 || 0)
  const dahil = makine.dahil_adet || 0
  const birim = makine.birim_fiyat_1 || 0
  // Forma başına tabaka eşikle kıyaslanır; kapakta (forma=0) satırın tamamı tek parti.
  const extra = forma > 0
    ? forma * Math.max(0, tabakaNet / forma - dahil) * yuz * birim
    : Math.max(0, tabakaNet - dahil) * yuz * birim
  return kalipMaliyet + extra
}

// ---------------------------------------------------------------------------
// Malzeme (kağıt) maliyeti — §2 (KESİN)
// ---------------------------------------------------------------------------

/** Tabaka ağırlığı, kg. kg = tabaka × en × boy × gramaj / 10^7 (cm, g/m²) */
export function kagitKg(tabaka, en, boy, gramaj) {
  return (tabaka * en * boy * gramaj) / 10_000_000
}

/**
 * Kağıt tutarı (₺).
 * Tutar = kg × satış fiyatı × kağıdın para birimi kuru × (1 + KO/100)
 * kurlar: { TRY: 1, USD: 47.32, EUR: 53.87, ... }
 */
export function malzemeTutari({ tabaka, kagit, kurlar, koOrani = 5 }) {
  if (!kagit || kagit.satis_fiyat == null) return { kg: 0, tutar: 0 }
  const kg = kagitKg(tabaka, kagit.en, kagit.boy, kagit.gramaj)
  const kur = kurlar[kagit.para_birimi] ?? 1
  const tutar = kg * kagit.satis_fiyat * kur * (1 + koOrani / 100)
  return { kg, tutar }
}

// ---------------------------------------------------------------------------
// Baskı sonrası işlemler — §4 (KESİN)
// ---------------------------------------------------------------------------

/**
 * İşlem satırı tutarı. islem = katalog kartı; ctx satıra göre değişir:
 *   forma : { adet, ciltForma }                → Adet × max(forma+1, minForma) × birim
 *   m2    : { tabaka, en, boy }                → tabaka × m² × birim × kur
 *   adet  : { miktar }                         → miktar × birim
 *   paket : { adet, paketIci }                 → ceil(adet/paketIci) × birim
 *   sabit : {}                                 → taban_1
 *   serbest: { miktar, birim }                 → miktar × birim (karttan bağımsız)
 * Taban (taban_1) tüm tiplerde alt sınırdır (max kuralı — §4 doğrulamaları).
 */
export function islemTutari(islem, ctx, kurlar = { TRY: 1 }) {
  if (!islem) return 0
  const kur = kurlar[islem.para_birimi] ?? 1
  const taban = islem.taban_1 || 0
  const birim = (islem.birim_1 || 0) * (islem.para_birimi === 'TRY' ? 1 : kur)

  switch (islem.hesap_tipi) {
    case 'forma': {
      const carpan = Math.max((ctx.ciltForma || 0) + 1, islem.min_forma || 0)
      return Math.max((ctx.adet || 0) * carpan * birim, taban)
    }
    case 'm2': {
      const m2 = (ctx.tabaka || 0) * ((ctx.en || 0) * (ctx.boy || 0)) / 10_000
      return Math.max(m2 * birim, taban)
    }
    case 'adet':
      return Math.max((ctx.miktar || 0) * birim, taban)
    case 'paket': {
      const paket = Math.ceil((ctx.adet || 0) / Math.max(ctx.paketIci || 1, 1))
      return Math.max(paket * birim, taban)
    }
    case 'sabit':
      return taban
    case 'serbest':
    default:
      return (ctx.miktar || 0) * (ctx.birim || 0)
  }
}

// ---------------------------------------------------------------------------
// Toplam zinciri — §5 (KESİN)
// ---------------------------------------------------------------------------

/** Fiyatlama → karlı satış → birim fiyat */
export function toplamHesapla({ baskiToplam, malzemeToplam, islemToplam, karOrani = 5, adet }) {
  const fiyatlama = baskiToplam + malzemeToplam + islemToplam
  const karliSatis = fiyatlama * (1 + karOrani / 100)
  return {
    fiyatlama,
    karliSatis,
    birimFiyat: adet > 0 ? karliSatis / adet : 0,
  }
}

/** Bitmiş ürün ağırlığı (yaklaşık, sevkiyat bilgisi): Σ adet×yaprak×ebat×gr */
export function urunKg({ adet, sayfa, isEn, isBoy, gramaj }) {
  return (adet * (sayfa / 2) * isEn * isBoy * gramaj) / 10_000_000
}
