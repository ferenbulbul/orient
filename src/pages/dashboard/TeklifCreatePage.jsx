import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { formatNumber } from '../../lib/formatters'
import {
  montajHesapla, verimHesapla, acikKapakEni,
  formaHesapla, ciltFormaHesapla, fireHesapla, tabakaHesapla,
  kalipHesapla, baskiTutari, malzemeTutari, islemTutari,
  toplamHesapla, urunKg,
} from '../../lib/teklifHesap'

// Teklif oluşturma — docs/teklif-hesaplama.md §6.
// Tasarım: "hesap defteri" — eski EuromatFMS ekranındaki gibi sütunları
// hizalı kompakt satır tablosu. Otomatik hesaplanan hücreler DOLU görünür
// ("oto" durumu); elle ezilen hücre kehribar renge döner ("elle") ve
// ↺ ile otomatiğe geri alınır. Sonuç sütunları tabular-nums ile hizalıdır.

const B_SEKILLERI = [
  { value: 'on_arka', tr: 'Ön/Arka', en: 'F/B' },
  { value: 'perfektor', tr: 'Perfektör', en: 'Perfector' },
  { value: 'cevirme', tr: 'Çevirme', en: 'W&T' },
  { value: 'tek_yuz', tr: 'Tek Yüz', en: 'Single' },
]

let satirSayac = 0
const yeniId = () => `s${++satirSayac}`

function num(v, fallback = 0) {
  if (v === '' || v == null) return fallback
  const n = Number(String(v).replace(',', '.'))
  return Number.isNaN(n) ? fallback : n
}

function tl(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return formatNumber(Math.round(n))
}

// Oto/elle hücresi: value === '' → otomatik (hesap değeri dolu gösterilir),
// dolu → elle (kehribar + ↺ sıfırla). Tüm ezilebilir sayısal alanlar bunu kullanır.
function OtoCell({ value, computed, onChange, width = 'w-16', title }) {
  const manual = value !== '' && value != null
  return (
    <span className={`relative inline-flex items-center ${width}`} title={title}>
      <input
        inputMode="decimal"
        value={manual ? value : (computed ?? '')}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className={`w-full rounded-md border px-1.5 py-1 pr-4 text-right text-[13px] tabular-nums outline-none transition ${
          manual
            ? 'border-amber-300 bg-amber-50 font-medium text-amber-800 focus:border-amber-400'
            : 'border-transparent bg-slate-100/70 text-slate-700 focus:border-slate-300 focus:bg-white'
        }`}
      />
      {manual ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onChange('')}
          title="Otomatiğe dön"
          className="absolute right-0.5 text-[10px] leading-none text-amber-500 hover:text-amber-700"
        >↺</button>
      ) : (
        <span className="pointer-events-none absolute right-0.5 text-[8px] font-semibold uppercase leading-none text-slate-300">oto</span>
      )}
    </span>
  )
}

// Ölçekli montaj şeması (§9.4) — sarı alan = kullanılmayan tabaka payı
function MontajSema({ tabakaEn, tabakaBoy, grid }) {
  if (!grid) return null
  const scale = 132 / Math.max(tabakaEn, tabakaBoy)
  const W = tabakaEn * scale
  const H = tabakaBoy * scale
  const rotated = !(grid.w <= tabakaEn && grid.h <= tabakaBoy)
  const gw = (rotated ? grid.h : grid.w) * scale
  const gh = (rotated ? grid.w : grid.h) * scale
  const cols = rotated ? grid.rows : grid.cols
  const rows = rotated ? grid.cols : grid.rows
  const cellW = gw / cols
  const cellH = gh / rows
  const cells = []
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      cells.push(
        <rect key={`${c}-${r}`} x={c * cellW} y={r * cellH} width={cellW} height={cellH}
          fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
      )
    }
  }
  return (
    <svg width={W} height={H} className="shrink-0 rounded-lg border border-slate-200 bg-white shadow-sm">
      <rect x="0" y="0" width={W} height={H} fill="#fff" />
      <rect x={gw} y="0" width={Math.max(W - gw, 0)} height={H} fill="#fef3c7" opacity="0.6" />
      <rect x="0" y={gh} width={gw} height={Math.max(H - gh, 0)} fill="#fef3c7" opacity="0.6" />
      {cells}
    </svg>
  )
}

// Renk noktaları: 4'e kadar CMYK, fazlası ekstra (gri) — kalıp çiplerinde kullanılır
const RENKLER = ['#0ea5e9', '#ec4899', '#facc15', '#1e293b']
function RenkNoktalari({ adet }) {
  const dots = []
  for (let i = 0; i < Math.min(adet, 6); i++) {
    dots.push(
      <span key={i} className="inline-block h-2 w-2 rounded-full ring-1 ring-white"
        style={{ backgroundColor: RENKLER[i] || '#94a3b8', marginLeft: i ? '-3px' : 0 }} />
    )
  }
  return <span className="inline-flex items-center">{dots}</span>
}

function KalipChip({ label, renk }) {
  return (
    <span className="flex items-center justify-between gap-1.5 rounded-md border border-slate-200 bg-white px-1.5 py-1 shadow-sm">
      <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <RenkNoktalari adet={renk} />
    </span>
  )
}

function FormaKarti({ etiket, yarim, bSekli, r1, r2, isEN }) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg border p-1.5 ${yarim ? 'border-dashed border-slate-300 bg-slate-50' : 'border-slate-200 bg-slate-100/60'}`}>
      <span className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">{etiket}</span>
      {bSekli === 'cevirme' ? (
        <KalipChip label={isEN ? 'F+B' : 'Ön+Arka'} renk={r1} />
      ) : bSekli === 'tek_yuz' ? (
        <KalipChip label={isEN ? 'F' : 'Ön'} renk={r1} />
      ) : (
        <>
          <KalipChip label={isEN ? 'F' : 'Ön'} renk={r1} />
          <KalipChip label={isEN ? 'B' : 'Arka'} renk={r2} />
        </>
      )}
    </div>
  )
}

// Kalıp şeması: forma başına ön/arka kalıp çipleri (§1.3 + §7 kuralları).
// tek_yuz → sadece ön; on_arka/perfektor → ön + arka; cevirme → tek ortak kalıp.
function KalipSema({ forma, r1, r2, bSekli, kalip, elle, isEN }) {
  if (!forma || forma <= 0 || (!r1 && !r2)) return null
  const tam = Math.floor(forma)
  const kusurat = Math.round((forma - tam) * 100) / 100
  const cokForma = tam > 6
  const ortak = { bSekli, r1, r2, isEN }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-stretch gap-1.5">
        {cokForma ? (
          <>
            <FormaKarti etiket="F1" {...ortak} />
            <div className="flex items-center px-1 text-sm font-bold text-slate-400">× {tam}</div>
          </>
        ) : (
          Array.from({ length: tam }, (_, i) => <FormaKarti key={i} etiket={`F${i + 1}`} {...ortak} />)
        )}
        {kusurat > 0 && <FormaKarti etiket={kusurat === 0.5 ? '½' : `${kusurat}`} yarim {...ortak} />}
      </div>
      <div className="flex flex-col items-center rounded-lg bg-slate-900 px-2.5 py-1.5 text-white">
        <span className="text-base font-bold leading-tight tabular-nums">{kalip}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400">{isEN ? 'plates' : 'kalıp'}</span>
      </div>
      {elle && (
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">elle</span>
      )}
    </div>
  )
}

// Kapak yerleşim şeması: açık kapağın tabakaya dizilişi (verim görseli)
function KapakSema({ acikEn, boy, tabakaEn, tabakaBoy }) {
  if (!acikEn || !boy || !tabakaEn || !tabakaBoy) return null
  const duz = { cols: Math.floor(tabakaEn / acikEn), rows: Math.floor(tabakaBoy / boy), rot: false }
  const donuk = { cols: Math.floor(tabakaEn / boy), rows: Math.floor(tabakaBoy / acikEn), rot: true }
  const secim = duz.cols * duz.rows >= donuk.cols * donuk.rows ? duz : donuk
  if (secim.cols * secim.rows === 0) return null
  const w = secim.rot ? boy : acikEn
  const h = secim.rot ? acikEn : boy
  const scale = 132 / Math.max(tabakaEn, tabakaBoy)
  const W = tabakaEn * scale
  const H = tabakaBoy * scale
  const cells = []
  for (let c = 0; c < secim.cols; c++) {
    for (let r = 0; r < secim.rows; r++) {
      cells.push(
        <rect key={`${c}-${r}`} x={c * w * scale} y={r * h * scale}
          width={w * scale} height={h * scale}
          fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.6" />
      )
    }
  }
  return (
    <svg width={W} height={H} className="shrink-0 rounded-lg border border-slate-200 bg-white shadow-sm">
      <rect x="0" y="0" width={W} height={H} fill="#fffbeb" />
      {cells}
    </svg>
  )
}

export default function TeklifCreatePage() {
  const { profile } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()

  const [makineler, setMakineler] = useState([])
  const [islemler, setIslemler] = useState([])
  const [kagitlar, setKagitlar] = useState([])
  const [paramMap, setParamMap] = useState({})
  const [kur, setKur] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [is, setIs] = useState({
    firma_adi: '', is_adi: '', cinsi: 'Kitap', adet: '', en: '', boy: '',
    sayfa: '', ciltte: '16', cilt_islem_id: '', kapak_var: true, notlar: '',
  })

  const [baskiSatirlari, setBaskiSatirlari] = useState([])
  const [sonrasiSatirlari, setSonrasiSatirlari] = useState([])
  const [satisTutariInput, setSatisTutariInput] = useState('')
  const [acikDetay, setAcikDetay] = useState(null) // montaj şeması açık satır id

  useEffect(() => {
    const load = async () => {
      try {
        const [m, i, k, p, kr] = await Promise.all([
          supabase.from('teklif_makineler').select('*').eq('aktif', true).order('ad'),
          supabase.from('teklif_islemler').select('*').eq('aktif', true).order('kategori').order('ad'),
          supabase.from('teklif_kagitlar').select('*').eq('aktif', true).order('cins').order('gramaj').order('en'),
          supabase.from('teklif_parametreler').select('*'),
          supabase.from('teklif_kurlar').select('*').order('tarih', { ascending: false }).limit(1),
        ])
        const err = m.error || i.error || k.error || p.error || kr.error
        if (err) throw err
        setMakineler(m.data || [])
        setIslemler(i.data || [])
        setKagitlar(k.data || [])
        setParamMap(Object.fromEntries((p.data || []).map((x) => [x.anahtar, Number(x.deger)])))
        setKur(kr.data?.[0] || null)
      } catch (e) {
        console.error('[Teklif] katalog yükleme:', e)
        setError(isEN
          ? 'Catalog could not be loaded. Did you run supabase-add-teklif.sql?'
          : 'Katalog yüklenemedi. supabase-add-teklif.sql çalıştırıldı mı?')
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const kurlar = useMemo(() => ({
    TRY: 1,
    USD: kur ? Number(kur.usd) : 0,
    EUR: kur ? Number(kur.eur) : 0,
  }), [kur])

  const ciltIslemleri = useMemo(
    () => islemler.filter((x) => x.kategori === 'cilt' || x.kategori === 'dikis'),
    [islemler]
  )

  const varsayilanFire = paramMap.varsayilan_fire ?? 200
  const koOrani = paramMap.ko_orani ?? 5
  const karOrani = paramMap.kar_orani ?? 5
  const shrinkPaketIci = paramMap.shrink_paket_ici ?? 20

  // Satır etiketi: aynı tipten birden çok satır varsa numaralanır (İç 1, İç 2…)
  const satirEtiketi = (satir) => {
    if (satir.aciklama) return satir.aciklama
    const esler = baskiSatirlari.filter((r) => r.tip === satir.tip)
    const base = satir.tip === 'ic' ? 'İç' : (isEN ? 'Cover' : 'Kapak')
    if (esler.length <= 1) return base
    return `${base} ${esler.findIndex((r) => r.id === satir.id) + 1}`
  }

  const bosBaskiSatiri = (tip) => ({
    id: yeniId(), tip, aciklama: '',
    makine_id: '', kagit_id: '',
    renk_on: tip === 'ic' ? '1' : '4', renk_arka: tip === 'ic' ? '1' : '0',
    sayfa: tip === 'ic' ? '' : '2',
    b_sekli: tip === 'ic' ? 'on_arka' : 'tek_yuz',
    fire: '', tbkda: '', verim: '', kalip: '',
  })

  const satirlariOlustur = () => {
    const ic = { ...bosBaskiSatiri('ic'), sayfa: is.sayfa }
    const baski = [ic]
    if (is.kapak_var) baski.push(bosBaskiSatiri('kapak'))
    const sonrasi = []
    if (is.cilt_islem_id) {
      sonrasi.push({ id: yeniId(), bagli: ic.id, islem_id: is.cilt_islem_id, miktar: '', tutar: '' })
    }
    if (is.kapak_var) {
      sonrasi.push({ id: yeniId(), bagli: baski[1].id, islem_id: '', miktar: '', tutar: '', not: isEN ? 'Select lamination' : 'Selefon belirtiniz' })
    }
    const shrink = islemler.find((x) => x.hesap_tipi === 'paket' && x.ad === 'Shrink')
    if (shrink) {
      sonrasi.push({ id: yeniId(), bagli: ic.id, islem_id: shrink.id, miktar: '', tutar: '', paket_ici: String(shrinkPaketIci) })
    }
    setBaskiSatirlari(baski)
    setSonrasiSatirlari(sonrasi)
  }

  // --- Canlı hesap ---
  const hesap = useMemo(() => {
    const adet = num(is.adet)
    const isEnN = num(is.en)
    const isBoyN = num(is.boy)
    const sayfaN = num(is.sayfa)
    const ciltteN = num(is.ciltte, 16)

    const baskiHesaplari = baskiSatirlari.map((s) => {
      const makine = makineler.find((m) => m.id === s.makine_id) || null
      const kagit = kagitlar.find((k) => k.id === s.kagit_id) || null
      const r1 = num(s.renk_on)
      const r2 = num(s.renk_arka)
      const satirSayfa = num(s.sayfa)

      let montaj = null
      let tbkda = 0
      let forma = 0
      let verim = 1
      let otoVerim = null
      let acikEn = null

      if (s.tip === 'ic') {
        if (kagit && isEnN && isBoyN) montaj = montajHesapla(isEnN, isBoyN, kagit.en, kagit.boy)
        tbkda = num(s.tbkda) || montaj?.tbkda || 0
        forma = tbkda ? formaHesapla(satirSayfa, tbkda) : 0
      } else {
        acikEn = isEnN ? acikKapakEni(isEnN, sayfaN, kagit?.kalinlik_mm ?? 0.1) : null
        otoVerim = kagit && acikEn ? verimHesapla(acikEn, isBoyN, kagit.en, kagit.boy) : null
        verim = num(s.verim) || otoVerim || 1
      }

      const otoFire = fireHesapla(s.tip === 'ic' ? forma : 1, varsayilanFire)
      const fire = s.fire === '' ? otoFire : num(s.fire)
      const tabaka = tabakaHesapla({ adet, forma, verim, fire, tekParca: s.tip === 'kapak' })

      const oto = kalipHesapla(s.tip === 'ic' ? forma : 1, r1, r2, s.b_sekli)
      const kalip = num(s.kalip) || oto.kalip
      const yuz = oto.yuz

      const baskiT = makine
        ? baskiTutari({ makine, kalip, forma: s.tip === 'ic' ? forma : 0, tabakaNet: tabaka.net, yuz })
        : 0
      const malzeme = kagit
        ? malzemeTutari({ tabaka: tabaka.toplam, kagit, kurlar, koOrani })
        : { kg: 0, tutar: 0 }

      return {
        satir: s, makine, kagit, montaj, acikEn,
        tbkda, otoTbkda: montaj?.tbkda ?? null,
        forma, verim, otoVerim,
        fire, otoFire, tabaka,
        kalip, otoKalip: oto.kalip, yuz,
        baskiT, malzeme,
      }
    })

    const ciltForma = ciltFormaHesapla(sayfaN, ciltteN)

    const sonrasiHesaplari = sonrasiSatirlari.map((s) => {
      const islem = islemler.find((x) => x.id === s.islem_id) || null
      const bagli = baskiHesaplari.find((b) => b.satir.id === s.bagli) || null
      let otoTutar = 0
      if (islem) {
        const ctx = {
          adet,
          ciltForma,
          miktar: s.miktar !== '' ? num(s.miktar) : adet,
          tabaka: bagli?.tabaka.toplam || 0,
          en: bagli?.kagit?.en || 0,
          boy: bagli?.kagit?.boy || 0,
          paketIci: s.paket_ici ? num(s.paket_ici) : shrinkPaketIci,
        }
        otoTutar = islemTutari(islem, ctx, kurlar)
      }
      const tutar = s.tutar !== '' && s.tutar != null ? num(s.tutar) : otoTutar
      return { satir: s, islem, bagli, tutar, otoTutar }
    })

    const baskiToplam = baskiHesaplari.reduce((a, b) => a + b.baskiT, 0)
    const malzemeToplam = baskiHesaplari.reduce((a, b) => a + b.malzeme.tutar, 0)
    const islemToplam = sonrasiHesaplari.reduce((a, b) => a + b.tutar, 0)
    const toplam = toplamHesapla({ baskiToplam, malzemeToplam, islemToplam, karOrani, adet })

    const icKg = baskiHesaplari
      .filter((b) => b.satir.tip === 'ic' && b.kagit)
      .reduce((a, b) => a + urunKg({ adet, sayfa: num(b.satir.sayfa), isEn: isEnN, isBoy: isBoyN, gramaj: b.kagit.gramaj }), 0)

    const satis = satisTutariInput !== '' ? num(satisTutariInput) : Math.round(toplam.karliSatis)

    return {
      adet, ciltForma, baskiHesaplari, sonrasiHesaplari,
      baskiToplam, malzemeToplam, islemToplam, ...toplam,
      satisTutari: satis,
      birimSatis: adet > 0 ? satis / adet : 0,
      toplamKg: icKg,
    }
  }, [is, baskiSatirlari, sonrasiSatirlari, makineler, kagitlar, islemler, kurlar, koOrani, karOrani, varsayilanFire, shrinkPaketIci, satisTutariInput])

  const setBaski = (id, patch) =>
    setBaskiSatirlari((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const setSonrasi = (id, patch) =>
    setSonrasiSatirlari((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const baskiSatirEkle = (tip) => setBaskiSatirlari((rows) => [...rows, bosBaskiSatiri(tip)])
  const baskiSatirKopyala = (id) =>
    setBaskiSatirlari((rows) => {
      const src = rows.find((r) => r.id === id)
      if (!src) return rows
      const idx = rows.indexOf(src)
      const kopya = { ...src, id: yeniId(), aciklama: '' }
      return [...rows.slice(0, idx + 1), kopya, ...rows.slice(idx + 1)]
    })
  const baskiSatirSil = (id) => {
    setBaskiSatirlari((rows) => rows.filter((r) => r.id !== id))
    setSonrasiSatirlari((rows) => rows.filter((r) => r.bagli !== id))
    if (acikDetay === id) setAcikDetay(null)
  }
  const sonrasiSatirEkle = () =>
    setSonrasiSatirlari((rows) => [...rows, {
      id: yeniId(), bagli: baskiSatirlari[0]?.id || '', islem_id: '', miktar: '', tutar: '',
    }])

  const handleSave = async () => {
    if (!is.firma_adi.trim() || !is.is_adi.trim() || !hesap.adet) {
      setError(isEN ? 'Company, job name and quantity are required.' : 'Firma, iş adı ve adet zorunludur.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      firma_adi: is.firma_adi.trim(),
      is_adi: is.is_adi.trim(),
      cinsi: is.cinsi || null,
      adet: hesap.adet,
      en: num(is.en),
      boy: num(is.boy),
      sayfa: num(is.sayfa) || null,
      ciltte: num(is.ciltte) || null,
      cilt_turu: ciltIslemleri.find((c) => c.id === is.cilt_islem_id)?.ad || null,
      kapak_var: is.kapak_var,
      notlar: is.notlar || null,
      kur_usd: kurlar.USD || null,
      kur_eur: kurlar.EUR || null,
      ko_orani: koOrani,
      kar_orani: karOrani,
      baski_satirlari: hesap.baskiHesaplari.map((b) => ({
        ...b.satir,
        etiket: satirEtiketi(b.satir),
        makine_ad: b.makine?.ad || null,
        kagit_ad: b.kagit ? `${b.kagit.gramaj} gr ${b.kagit.en}x${b.kagit.boy} ${b.kagit.cins}` : null,
        hesap: {
          tbkda: b.tbkda, forma: b.forma, verim: b.verim, fire: b.fire,
          tabaka: b.tabaka, kalip: b.kalip, yuz: b.yuz,
          baski_tutar: b.baskiT, kg: b.malzeme.kg, malzeme_tutar: b.malzeme.tutar,
        },
      })),
      sonrasi_satirlari: hesap.sonrasiHesaplari.map((sh) => ({
        ...sh.satir,
        islem_ad: sh.islem?.ad || null,
        tutar_hesap: sh.tutar,
      })),
      fiyatlama: hesap.fiyatlama,
      karli_satis: hesap.karliSatis,
      satis_tutari: hesap.satisTutari,
      birim_fiyat: hesap.birimSatis,
      toplam_kg: hesap.toplamKg,
      created_by: profile.id,
    }
    const { error: err } = await supabase.from('teklifler').insert(payload)
    if (err) {
      console.error('[Teklif] kayıt:', err)
      setError(err.message)
      setSaving(false)
      return
    }
    navigate('/panel/teklifler')
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400'
  const lblCls = 'text-xs font-medium text-slate-500'
  const thCls = 'whitespace-nowrap px-2 pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400'
  const thNumCls = 'whitespace-nowrap px-2 pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400'
  const tdCls = 'px-2 py-2 align-middle'
  const sonucCls = 'whitespace-nowrap px-2 py-2 text-right align-middle text-[13px] tabular-nums text-slate-600'
  const miniSelect = 'w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[13px] outline-none focus:border-slate-400'
  const ikonBtn = 'rounded-md p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600'

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">
            {isEN ? 'New Quote' : 'Yeni Teklif'}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
              <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-slate-300 align-middle" />
              {isEN ? 'auto' : 'oto'}
            </span>
            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700">
              <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-amber-300 align-middle" />
              {isEN ? 'manual (↺ resets)' : 'elle (↺ otomatiğe döner)'}
            </span>
            {kur ? (
              <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white">
                {kur.tarih} · $ {kur.usd} · € {kur.eur}
              </span>
            ) : (
              <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] text-red-700">
                {isEN ? 'No exchange rate!' : 'Kur kaydı yok!'}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_290px]">
          <div className="flex min-w-0 flex-col gap-6">
            {/* İş bilgileri */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">
                {isEN ? 'Job Details' : 'İş Bilgileri'}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className={lblCls}>{isEN ? 'Company *' : 'Firma *'}</span>
                  <input className={inputCls} value={is.firma_adi}
                    onChange={(e) => setIs({ ...is, firma_adi: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className={lblCls}>{isEN ? 'Job Name *' : 'İşin Adı *'}</span>
                  <input className={inputCls} value={is.is_adi}
                    onChange={(e) => setIs({ ...is, is_adi: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={lblCls}>{isEN ? 'Quantity *' : 'Adet *'}</span>
                  <input className={`${inputCls} tabular-nums`} inputMode="numeric" value={is.adet}
                    onChange={(e) => setIs({ ...is, adet: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={lblCls}>{isEN ? 'Size (W × H cm)' : 'Ebat (En × Boy cm)'}</span>
                  <div className="flex items-center gap-1.5">
                    <input className={`${inputCls} tabular-nums`} inputMode="decimal" value={is.en}
                      onChange={(e) => setIs({ ...is, en: e.target.value })} />
                    <span className="text-slate-300">×</span>
                    <input className={`${inputCls} tabular-nums`} inputMode="decimal" value={is.boy}
                      onChange={(e) => setIs({ ...is, boy: e.target.value })} />
                  </div>
                </label>
                <label className="flex flex-col gap-1">
                  <span className={lblCls}>{isEN ? 'Pages (w/o cover)' : 'Sayfa (kapak hariç)'}</span>
                  <input className={`${inputCls} tabular-nums`} inputMode="numeric" value={is.sayfa}
                    onChange={(e) => setIs({ ...is, sayfa: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={lblCls}>Ciltte</span>
                  <select className={inputCls} value={is.ciltte}
                    onChange={(e) => setIs({ ...is, ciltte: e.target.value })}>
                    {[4, 8, 16, 32].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className={lblCls}>{isEN ? 'Type' : 'Cinsi'}</span>
                  <select className={inputCls} value={is.cinsi}
                    onChange={(e) => setIs({ ...is, cinsi: e.target.value })}>
                    {['Kitap', 'Dergi', 'Katalog', 'Broşür', 'Diğer'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className={lblCls}>{isEN ? 'Binding' : 'Cilt Türü'}</span>
                  <select className={inputCls} value={is.cilt_islem_id}
                    onChange={(e) => setIs({ ...is, cilt_islem_id: e.target.value })}>
                    <option value="">{isEN ? '— none —' : '— yok —'}</option>
                    {ciltIslemleri.map((c) => <option key={c.id} value={c.id}>{c.ad}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={is.kapak_var}
                    onChange={(e) => setIs({ ...is, kapak_var: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300" />
                  <span className="text-sm text-slate-700">{isEN ? '+ Cover' : '+ Kapak'}</span>
                </label>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={satirlariOlustur}
                  disabled={!is.adet || !is.en || !is.boy || !is.sayfa}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-40"
                >
                  {baskiSatirlari.length === 0
                    ? (isEN ? 'Create Rows' : 'Satırları Oluştur')
                    : (isEN ? 'Recreate Rows' : 'Satırları Yeniden Oluştur')}
                </button>
                {hesap.ciltForma > 0 && (
                  <span className="text-xs tabular-nums text-slate-500">
                    {isEN ? 'Binding signatures' : 'Cilt forması'}: <b>{hesap.ciltForma}</b>
                  </span>
                )}
              </div>
            </div>

            {/* Baskı — hizalı satır tablosu */}
            {baskiSatirlari.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-700">{isEN ? 'Printing' : 'Baskı'}</h2>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => baskiSatirEkle('ic')}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">
                      + {isEN ? 'Inner' : 'İç'}
                    </button>
                    <button type="button" onClick={() => baskiSatirEkle('kapak')}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">
                      + {isEN ? 'Cover' : 'Kapak'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 overflow-x-auto pb-3">
                  <table className="w-full min-w-[1180px] border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b">
                        <th className={`${thCls} pl-5`}>{isEN ? 'Row' : 'Satır'}</th>
                        <th className={thCls}>{isEN ? 'Machine' : 'Makine'}</th>
                        <th className={thCls}>{isEN ? 'Paper' : 'Kağıt'}</th>
                        <th className={thNumCls}>{isEN ? 'Pages' : 'Sayfa'}</th>
                        <th className={thNumCls}>{isEN ? 'Colors' : 'Renk'}</th>
                        <th className={thCls}>B.Şekli</th>
                        <th className={thNumCls}>Tbk/{isEN ? 'Yield' : 'Verim'}</th>
                        <th className={thNumCls}>Fire</th>
                        <th className={thNumCls}>{isEN ? 'Plates' : 'Kalıp'}</th>
                        <th className={`${thNumCls} border-l border-slate-100`}>Forma</th>
                        <th className={thNumCls}>{isEN ? 'Sheets' : 'Tabaka'}</th>
                        <th className={thNumCls}>kg</th>
                        <th className={thNumCls}>{isEN ? 'Print ₺' : 'Baskı ₺'}</th>
                        <th className={thNumCls}>{isEN ? 'Paper ₺' : 'Kağıt ₺'}</th>
                        <th className={thCls}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {hesap.baskiHesaplari.map((b) => {
                        const s = b.satir
                        const detayAcik = acikDetay === s.id
                        return (
                          <Fragment key={s.id}>
                            <tr className="group border-b border-slate-50 transition hover:bg-slate-50/60">
                              {/* Satır etiketi */}
                              <td className={`${tdCls} pl-5`}>
                                <div className="flex items-center gap-1.5">
                                  <span className={`inline-block h-2 w-2 rounded-full ${s.tip === 'ic' ? 'bg-slate-400' : 'bg-sky-400'}`} />
                                  <input
                                    value={s.aciklama}
                                    placeholder={satirEtiketi(s)}
                                    onChange={(e) => setBaski(s.id, { aciklama: e.target.value })}
                                    className="w-16 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[13px] font-semibold text-slate-800 outline-none placeholder:text-slate-800 focus:border-slate-300 focus:bg-white focus:placeholder:text-slate-300"
                                  />
                                </div>
                              </td>
                              {/* Makine */}
                              <td className={`${tdCls} min-w-[96px]`}>
                                <select className={miniSelect} value={s.makine_id}
                                  onChange={(e) => setBaski(s.id, { makine_id: e.target.value })}>
                                  <option value="">{isEN ? 'select' : 'seç'}</option>
                                  {makineler.map((m) => <option key={m.id} value={m.id}>{m.ad}</option>)}
                                </select>
                              </td>
                              {/* Kağıt */}
                              <td className={`${tdCls} min-w-[190px]`}>
                                <select className={miniSelect} value={s.kagit_id}
                                  onChange={(e) => setBaski(s.id, { kagit_id: e.target.value })}>
                                  <option value="">{isEN ? 'select' : 'seç'}</option>
                                  {kagitlar.map((k) => (
                                    <option key={k.id} value={k.id}>
                                      {k.gramaj} gr {k.en}×{k.boy} {k.cins}{k.satis_fiyat == null ? ' ⚠' : ''}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              {/* Sayfa */}
                              <td className={`${tdCls} text-right`}>
                                {s.tip === 'ic' ? (
                                  <input
                                    inputMode="numeric" value={s.sayfa}
                                    onChange={(e) => setBaski(s.id, { sayfa: e.target.value })}
                                    className="w-14 rounded-md border border-slate-200 px-1.5 py-1 text-right text-[13px] tabular-nums outline-none focus:border-slate-400"
                                  />
                                ) : (
                                  <span className="text-[13px] text-slate-400">—</span>
                                )}
                              </td>
                              {/* Renk */}
                              <td className={`${tdCls} text-right`}>
                                <span className="inline-flex items-center gap-0.5">
                                  <input inputMode="numeric" value={s.renk_on}
                                    onChange={(e) => setBaski(s.id, { renk_on: e.target.value })}
                                    className="w-9 rounded-md border border-slate-200 px-1 py-1 text-center text-[13px] tabular-nums outline-none focus:border-slate-400" />
                                  <span className="text-slate-300">/</span>
                                  <input inputMode="numeric" value={s.renk_arka}
                                    onChange={(e) => setBaski(s.id, { renk_arka: e.target.value })}
                                    className="w-9 rounded-md border border-slate-200 px-1 py-1 text-center text-[13px] tabular-nums outline-none focus:border-slate-400" />
                                </span>
                              </td>
                              {/* B.Şekli */}
                              <td className={`${tdCls} min-w-[100px]`}>
                                <select className={miniSelect} value={s.b_sekli}
                                  onChange={(e) => setBaski(s.id, { b_sekli: e.target.value })}>
                                  {B_SEKILLERI.map((x) => (
                                    <option key={x.value} value={x.value}>{isEN ? x.en : x.tr}</option>
                                  ))}
                                </select>
                              </td>
                              {/* Tbk'da / Verim (oto/elle) */}
                              <td className={`${tdCls} text-right`}>
                                {s.tip === 'ic' ? (
                                  <OtoCell value={s.tbkda} computed={b.otoTbkda ?? ''}
                                    onChange={(v) => setBaski(s.id, { tbkda: v })}
                                    title="Tbk'da — tabakadaki sayfa (montajdan otomatik)" />
                                ) : (
                                  <OtoCell value={s.verim} computed={b.otoVerim ?? ''}
                                    onChange={(v) => setBaski(s.id, { verim: v })}
                                    title={isEN ? 'Yield — covers per sheet' : 'Verim — tabakadan çıkan kapak'} />
                                )}
                              </td>
                              {/* Fire (oto/elle) */}
                              <td className={`${tdCls} text-right`}>
                                <OtoCell value={s.fire} computed={b.otoFire}
                                  onChange={(v) => setBaski(s.id, { fire: v })}
                                  title="Fire — forma başına zayiat tabakası" />
                              </td>
                              {/* Kalıp (oto/elle) */}
                              <td className={`${tdCls} text-right`}>
                                <OtoCell value={s.kalip} computed={b.otoKalip}
                                  onChange={(v) => setBaski(s.id, { kalip: v })} width="w-14"
                                  title={isEN ? 'Plates' : 'Kalıp sayısı'} />
                              </td>
                              {/* Sonuç sütunları */}
                              <td className={`${sonucCls} border-l border-slate-100`}>
                                {s.tip === 'ic' && b.forma > 0 ? Number(b.forma.toFixed(2)) : '—'}
                              </td>
                              <td className={sonucCls}>
                                {b.tabaka.toplam ? formatNumber(b.tabaka.toplam) : '—'}
                              </td>
                              <td className={sonucCls}>
                                {b.malzeme.kg ? formatNumber(Math.round(b.malzeme.kg)) : '—'}
                              </td>
                              <td className={`${sonucCls} font-semibold text-slate-900`}>{tl(b.baskiT)}</td>
                              <td className={`${sonucCls} font-semibold text-slate-900`}>
                                {b.kagit && b.kagit.satis_fiyat == null
                                  ? <span className="text-red-500" title={isEN ? 'Paper has no price' : 'Kağıdın fiyatı girilmemiş'}>⚠</span>
                                  : tl(b.malzeme.tutar)}
                              </td>
                              {/* Aksiyonlar */}
                              <td className={`${tdCls} pr-3`}>
                                <span className="flex items-center justify-end gap-0.5 opacity-0 transition group-hover:opacity-100">
                                  <button type="button" onClick={() => setAcikDetay(detayAcik ? null : s.id)}
                                    title={isEN ? 'Imposition & plates' : 'Montaj + kalıp şeması'}
                                    className={`${ikonBtn} ${detayAcik ? 'bg-slate-100 text-slate-600' : ''}`}>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                    </svg>
                                  </button>
                                  <button type="button" onClick={() => baskiSatirKopyala(s.id)}
                                    title={isEN ? 'Duplicate' : 'Kopyala'} className={ikonBtn}>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                    </svg>
                                  </button>
                                  <button type="button" onClick={() => baskiSatirSil(s.id)}
                                    title={isEN ? 'Delete' : 'Sil'}
                                    className="rounded-md p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              </td>
                            </tr>
                            {/* Detay: montaj/yerleşim + kalıp şeması */}
                            {detayAcik && (
                              <tr className="bg-slate-50/60">
                                <td colSpan={15} className="px-5 py-3">
                                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                    {s.tip === 'ic' && b.montaj && b.kagit && (
                                      <>
                                        <MontajSema tabakaEn={b.kagit.en} tabakaBoy={b.kagit.boy} grid={b.montaj.grid} />
                                        <div className="text-xs leading-5 text-slate-600">
                                          <p>
                                            <b>{b.kagit.en}×{b.kagit.boy}</b> {isEN ? 'sheet' : 'tabaka'} ·
                                            {' '}{isEN ? 'per side' : 'yüz montajı'} <b>{b.montaj.grid.cols}×{b.montaj.grid.rows}</b> ·
                                            {' '}Tbk'da <b>{b.tbkda}</b>
                                            {s.tbkda !== '' && <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-700">elle</span>}
                                          </p>
                                          <p>
                                            {isEN ? 'Signatures per sheet' : 'Tabakadan cilt forması'}:
                                            {' '}<b>{num(is.ciltte, 16) ? Math.round(b.tbkda / num(is.ciltte, 16) * 100) / 100 : '—'}</b> ({num(is.ciltte, 16)}'lik) ·
                                            {' '}{isEN ? 'sheets' : 'tabaka'}: <b>{formatNumber(b.tabaka.net)}</b> + {formatNumber(b.fire)} fire
                                          </p>
                                          <p className="text-slate-400">
                                            {isEN ? 'Yellow area = unused sheet margin (grip/trim).' : 'Sarı alan = kullanılmayan tabaka payı (makas/etek).'}
                                          </p>
                                        </div>
                                      </>
                                    )}
                                    {s.tip === 'kapak' && b.kagit && b.acikEn && (
                                      <>
                                        <KapakSema acikEn={b.acikEn} boy={num(is.boy)} tabakaEn={b.kagit.en} tabakaBoy={b.kagit.boy} />
                                        <div className="text-xs leading-5 text-slate-600">
                                          <p>
                                            {isEN ? 'Open cover' : 'Açık kapak'}: <b>{b.acikEn.toFixed(2)} × {num(is.boy)}</b> cm
                                            {' '}({isEN ? 'spine' : 'sırt'} {(b.acikEn - 2 * num(is.en)).toFixed(2)} cm)
                                          </p>
                                          <p>
                                            <b>{b.kagit.en}×{b.kagit.boy}</b> {isEN ? 'sheet' : 'tabaka'} ·
                                            {' '}{isEN ? 'yield' : 'verim'} <b>{b.verim}</b>
                                            {s.verim !== '' && <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-700">elle</span>} ·
                                            {' '}{isEN ? 'sheets' : 'tabaka'}: <b>{formatNumber(b.tabaka.net)}</b> + {formatNumber(b.fire)} fire
                                          </p>
                                        </div>
                                      </>
                                    )}
                                    <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                                      <KalipSema
                                        forma={s.tip === 'ic' ? b.forma : 1}
                                        r1={num(s.renk_on)} r2={num(s.renk_arka)}
                                        bSekli={s.b_sekli} kalip={b.kalip}
                                        elle={s.kalip !== ''} isEN={isEN}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {/* Kapak bilgi şeridi (detay kapalıyken) */}
                            {!detayAcik && s.tip === 'kapak' && b.acikEn && (
                              <tr>
                                <td colSpan={15} className="px-5 pb-1.5 pt-0 text-[11px] text-slate-400">
                                  {isEN ? 'Open cover' : 'Açık kapak'}: {b.acikEn.toFixed(2)} × {num(is.boy)} cm
                                  ({isEN ? 'spine' : 'sırt'} {(b.acikEn - 2 * num(is.en)).toFixed(2)} cm) ·
                                  {' '}{isEN ? 'yield' : 'verim'} {b.verim}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-100 bg-slate-50/40">
                        <td colSpan={12} className="px-5 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {isEN ? 'Section total' : 'Bölüm toplamı'}
                        </td>
                        <td className={`${sonucCls} font-bold text-slate-900`}>{tl(hesap.baskiToplam)}</td>
                        <td className={`${sonucCls} font-bold text-slate-900`}>{tl(hesap.malzemeToplam)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Baskı Sonrası — hizalı satır tablosu */}
            {baskiSatirlari.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 pt-4">
                  <h2 className="text-sm font-semibold text-slate-700">
                    {isEN ? 'Post-Press' : 'Baskı Sonrası'}
                  </h2>
                  <button type="button" onClick={sonrasiSatirEkle}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">
                    + {isEN ? 'Operation' : 'İşlem'}
                  </button>
                </div>
                <div className="mt-3 overflow-x-auto pb-3">
                  <table className="w-full min-w-[760px] border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className={`${thCls} pl-5`}>{isEN ? 'Applies to' : 'Bağlı'}</th>
                        <th className={thCls}>{isEN ? 'Operation' : 'İşlem'}</th>
                        <th className={thNumCls}>{isEN ? 'Qty' : 'Miktar'}</th>
                        <th className={thNumCls}>{isEN ? 'Per pack' : 'Paket İçi'}</th>
                        <th className={thNumCls}>{isEN ? 'Amount' : 'Tutar'}</th>
                        <th className={`${thNumCls} border-l border-slate-100`}>₺</th>
                        <th className={thCls}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {hesap.sonrasiHesaplari.map((sh) => {
                        const s = sh.satir
                        return (
                          <tr key={s.id} className="group border-b border-slate-50 transition hover:bg-slate-50/60">
                            <td className={`${tdCls} min-w-[100px] pl-5`}>
                              <select className={miniSelect} value={s.bagli}
                                onChange={(e) => setSonrasi(s.id, { bagli: e.target.value })}>
                                {baskiSatirlari.map((bs) => (
                                  <option key={bs.id} value={bs.id}>{satirEtiketi(bs)}</option>
                                ))}
                              </select>
                            </td>
                            <td className={`${tdCls} min-w-[200px]`}>
                              <div className="flex items-center gap-2">
                                <select className={miniSelect} value={s.islem_id}
                                  onChange={(e) => setSonrasi(s.id, { islem_id: e.target.value, not: '' })}>
                                  <option value="">{isEN ? 'select' : 'seç'}</option>
                                  {islemler.map((x) => (
                                    <option key={x.id} value={x.id}>{x.ad}</option>
                                  ))}
                                </select>
                                {s.not && (
                                  <span className="whitespace-nowrap rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">{s.not}</span>
                                )}
                              </div>
                            </td>
                            <td className={`${tdCls} text-right`}>
                              <OtoCell value={s.miktar} computed={hesap.adet || ''}
                                onChange={(v) => setSonrasi(s.id, { miktar: v })} width="w-20" />
                            </td>
                            <td className={`${tdCls} text-right`}>
                              {sh.islem?.hesap_tipi === 'paket' ? (
                                <OtoCell value={s.paket_ici || ''} computed={shrinkPaketIci}
                                  onChange={(v) => setSonrasi(s.id, { paket_ici: v })} width="w-14" />
                              ) : <span className="text-[13px] text-slate-300">—</span>}
                            </td>
                            <td className={`${tdCls} text-right`}>
                              <OtoCell value={s.tutar} computed={Math.round(sh.otoTutar)}
                                onChange={(v) => setSonrasi(s.id, { tutar: v })} width="w-24"
                                title={isEN ? 'Amount — override manually if needed' : 'Tutar — gerekirse elle ez'} />
                            </td>
                            <td className={`${sonucCls} border-l border-slate-100 font-semibold text-slate-900`}>
                              {tl(sh.tutar)}
                            </td>
                            <td className={`${tdCls} pr-3 text-right`}>
                              <button type="button"
                                onClick={() => setSonrasiSatirlari((rows) => rows.filter((r) => r.id !== s.id))}
                                className="rounded-md p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {sonrasiSatirlari.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-xs text-slate-400">
                            {isEN ? 'No operations' : 'İşlem satırı yok'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-100 bg-slate-50/40">
                        <td colSpan={5} className="px-5 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {isEN ? 'Section total' : 'Bölüm toplamı'}
                        </td>
                        <td className={`${sonucCls} font-bold text-slate-900`}>{tl(hesap.islemToplam)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Özet paneli */}
          <div className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:sticky xl:top-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              {isEN ? 'Calculation' : 'Hesaplama'}
            </h2>
            <div className="flex flex-col gap-2 text-sm tabular-nums">
              <div className="flex justify-between"><span className="text-slate-500">{isEN ? 'Printing' : 'Baskı'}</span><span>{tl(hesap.baskiToplam)} ₺</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{isEN ? 'Paper' : 'Malzeme'}</span><span>{tl(hesap.malzemeToplam)} ₺</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{isEN ? 'Post-press' : 'Baskı Sonrası'}</span><span>{tl(hesap.islemToplam)} ₺</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-medium">
                <span>{isEN ? 'Cost Total' : 'Fiyatlama'}</span><span>{tl(hesap.fiyatlama)} ₺</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isEN ? `With margin (${karOrani}%)` : `Karlı Satış (%${karOrani})`}</span>
                <span>{tl(hesap.karliSatis)} ₺</span>
              </div>
              <label className="mt-2 flex flex-col gap-1">
                <span className={lblCls}>{isEN ? 'Sale Total (round manually)' : 'Satış Tutarı (elle yuvarla)'}</span>
                <input className={`${inputCls} tabular-nums`} inputMode="numeric" value={satisTutariInput}
                  placeholder={formatNumber(Math.round(hesap.karliSatis))}
                  onChange={(e) => setSatisTutariInput(e.target.value)} />
              </label>
              <div className="mt-1 flex items-baseline justify-between rounded-xl bg-slate-900 px-3 py-2.5 text-white">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{isEN ? 'Unit' : 'Birim'}</span>
                <span className="text-lg font-bold tabular-nums">
                  {hesap.adet > 0 ? `${hesap.birimSatis.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ₺` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{isEN ? 'Approx. weight' : 'Yaklaşık ağırlık'}</span>
                <span>{hesap.toplamKg ? `${formatNumber(Math.round(hesap.toplamKg))} kg` : '—'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || baskiSatirlari.length === 0}
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-40"
            >
              {saving ? (isEN ? 'Saving...' : 'Kaydediliyor...') : (isEN ? 'Save Quote' : 'Teklifi Kaydet')}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
