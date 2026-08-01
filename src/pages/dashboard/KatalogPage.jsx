import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { formatNumber } from '../../lib/formatters'

// Teklif modülü katalog yönetimi: işlem/makine/kağıt kartları + genel parametreler.
// Formüller kodda (docs/teklif-hesaplama.md), fiyatlar bu kartlarda yaşar.

const KATEGORILER = [
  { value: 'cilt', tr: 'Cilt', en: 'Binding' },
  { value: 'dikis', tr: 'Dikiş', en: 'Stitching' },
  { value: 'selefon', tr: 'Selefon', en: 'Lamination' },
  { value: 'lak', tr: 'Lak / Kaplama', en: 'Varnish / Coating' },
  { value: 'kirim', tr: 'Kırım / Katlama', en: 'Folding' },
  { value: 'kesim', tr: 'Kesim', en: 'Cutting' },
  { value: 'susleme', tr: 'Süsleme', en: 'Finishing' },
  { value: 'paket', tr: 'Paketleme', en: 'Packaging' },
  { value: 'sevk', tr: 'Sevkiyat', en: 'Shipping' },
  { value: 'tezgah', tr: 'Tezgah İşleri', en: 'Handwork' },
  { value: 'diger', tr: 'Diğer', en: 'Other' },
]

const HESAP_TIPLERI = [
  { value: 'forma', tr: 'Forma bazlı', en: 'Per signature' },
  { value: 'adet', tr: 'Adet bazlı', en: 'Per unit' },
  { value: 'm2', tr: 'm² bazlı', en: 'Per m²' },
  { value: 'paket', tr: 'Paket bazlı', en: 'Per package' },
  { value: 'sabit', tr: 'Sabit tutar', en: 'Fixed' },
  { value: 'serbest', tr: 'Serbest', en: 'Free-form' },
]

const PARA_BIRIMLERI = ['TRY', 'USD', 'EUR']
const PB_SYMBOL = { TRY: '₺', USD: '$', EUR: '€' }

const TABS = [
  { id: 'islemler', tr: 'İşlemler', en: 'Operations' },
  { id: 'makineler', tr: 'Makineler', en: 'Machines' },
  { id: 'kagitlar', tr: 'Kağıtlar', en: 'Papers' },
  { id: 'parametreler', tr: 'Parametreler', en: 'Parameters' },
]

// Sekme başına form alanları (modal, config-tabanlı)
const FORM_FIELDS = {
  islemler: [
    { key: 'ad', tr: 'Ad', en: 'Name', type: 'text', required: true },
    { key: 'kategori', tr: 'Kategori', en: 'Category', type: 'select', options: KATEGORILER, required: true },
    { key: 'hesap_tipi', tr: 'Hesap Tipi', en: 'Calc Type', type: 'select', options: HESAP_TIPLERI, required: true },
    { key: 'istasyon', tr: 'İstasyon', en: 'Station', type: 'text' },
    { key: 'para_birimi', tr: 'Para Birimi', en: 'Currency', type: 'pb', required: true },
    { key: 'dahil_adet', tr: 'Dahil Adet', en: 'Included Qty', type: 'number' },
    { key: 'min_forma', tr: 'Min. Forma Çarpanı', en: 'Min Signature Mult.', type: 'number' },
    { key: 'taban_1', tr: 'Taban 1 (₺)', en: 'Base 1', type: 'number' },
    { key: 'birim_1', tr: 'Birim Fiyat 1', en: 'Unit Price 1', type: 'number' },
    { key: 'kademe_esigi', tr: 'Kademe Eşiği', en: 'Tier Threshold', type: 'number' },
    { key: 'taban_2', tr: 'Taban 2', en: 'Base 2', type: 'number' },
    { key: 'birim_2', tr: 'Birim Fiyat 2', en: 'Unit Price 2', type: 'number' },
    { key: 'kb_taban', tr: 'Klişe/Bıçak Taban', en: 'Die Base', type: 'number' },
    { key: 'kb_birim', tr: 'Klişe/Bıçak Birim', en: 'Die Unit', type: 'number' },
    { key: 'notlar', tr: 'Notlar', en: 'Notes', type: 'text' },
  ],
  makineler: [
    { key: 'ad', tr: 'Ad', en: 'Name', type: 'text', required: true },
    { key: 'istasyon', tr: 'İstasyon', en: 'Station', type: 'text' },
    { key: 'para_birimi', tr: 'Para Birimi', en: 'Currency', type: 'pb', required: true },
    { key: 'dahil_adet', tr: 'Dahil Tiraj', en: 'Included Run', type: 'number' },
    { key: 'kalip_fiyat_1', tr: 'Kalıp Fiyatı 1', en: 'Plate Price 1', type: 'number', required: true },
    { key: 'birim_fiyat_1', tr: 'Tiraj Birimi 1 (yüz başı)', en: 'Run Unit 1', type: 'number', required: true },
    { key: 'kademe_esigi', tr: 'Kademe Eşiği', en: 'Tier Threshold', type: 'number' },
    { key: 'kalip_fiyat_2', tr: 'Kalıp Fiyatı 2', en: 'Plate Price 2', type: 'number' },
    { key: 'birim_fiyat_2', tr: 'Tiraj Birimi 2', en: 'Run Unit 2', type: 'number' },
    { key: 'notlar', tr: 'Notlar', en: 'Notes', type: 'text' },
  ],
  kagitlar: [
    { key: 'cins', tr: 'Cins', en: 'Type', type: 'text', required: true },
    { key: 'gramaj', tr: 'Gramaj (g/m²)', en: 'Grammage', type: 'number', required: true },
    { key: 'en', tr: 'En (cm)', en: 'Width', type: 'number', required: true },
    { key: 'boy', tr: 'Boy (cm)', en: 'Height', type: 'number', required: true },
    { key: 'satis_fiyat', tr: 'Satış Fiyatı (birim/kg)', en: 'Sale Price /kg', type: 'number' },
    { key: 'alis_fiyat', tr: 'Alış Fiyatı (birim/kg)', en: 'Cost Price /kg', type: 'number' },
    { key: 'para_birimi', tr: 'Para Birimi', en: 'Currency', type: 'pb', required: true },
    { key: 'kalinlik_mm', tr: 'Kalınlık (mm/yaprak)', en: 'Thickness mm/leaf', type: 'number' },
    { key: 'notlar', tr: 'Notlar', en: 'Notes', type: 'text' },
  ],
}

const TABLE_BY_TAB = {
  islemler: 'teklif_islemler',
  makineler: 'teklif_makineler',
  kagitlar: 'teklif_kagitlar',
}

const EMPTY_ROW = {
  islemler: { kategori: 'diger', hesap_tipi: 'adet', para_birimi: 'TRY' },
  makineler: { para_birimi: 'TRY', dahil_adet: 3000 },
  kagitlar: { para_birimi: 'USD', kalinlik_mm: 0.1 },
}

function fmt(n) {
  if (n == null || n === '') return '—'
  return formatNumber(n)
}

export default function KatalogPage() {
  const { isAdmin } = useAuth()
  const { isEN } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = searchParams.get('tab') || 'islemler'
  const kategoriFilter = searchParams.get('kategori') || ''
  const [search, setSearch] = useState('')

  const [rows, setRows] = useState([])
  const [params, setParams] = useState([])
  const [kurlar, setKurlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Modal durumu: null = kapalı, {} = yeni kayıt, {id...} = düzenleme
  const [editing, setEditing] = useState(null)

  const setTab = (t) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', t)
    next.delete('kategori')
    setSearchParams(next, { replace: true })
    setSearch('')
  }

  const setKategori = (k) => {
    const next = new URLSearchParams(searchParams)
    if (k) next.set('kategori', k)
    else next.delete('kategori')
    setSearchParams(next, { replace: true })
  }

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      if (tab === 'parametreler') {
        const [{ data: p, error: e1 }, { data: k, error: e2 }] = await Promise.all([
          supabase.from('teklif_parametreler').select('*').order('anahtar'),
          supabase.from('teklif_kurlar').select('*').order('tarih', { ascending: false }).limit(10),
        ])
        if (e1 || e2) throw e1 || e2
        setParams(p || [])
        setKurlar(k || [])
      } else {
        const table = TABLE_BY_TAB[tab]
        let query = supabase.from(table).select('*')
        if (tab === 'islemler') query = query.order('kategori').order('ad')
        else if (tab === 'kagitlar') query = query.order('cins').order('gramaj').order('en')
        else query = query.order('ad')
        const { data, error: e } = await query
        if (e) throw e
        setRows(data || [])
      }
    } catch (err) {
      console.error('[Katalog] fetch error:', err)
      setError(isEN ? 'Data could not be loaded. Did you run supabase-add-teklif.sql?' : 'Veri yüklenemedi. supabase-add-teklif.sql çalıştırıldı mı?')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredRows = useMemo(() => {
    let list = rows
    if (tab === 'islemler' && kategoriFilter) {
      list = list.filter((r) => r.kategori === kategoriFilter)
    }
    const q = search.trim().toLocaleLowerCase('tr-TR')
    if (q) {
      list = list.filter((r) =>
        `${r.ad || ''} ${r.cins || ''} ${r.istasyon || ''}`.toLocaleLowerCase('tr-TR').includes(q)
      )
    }
    return list
  }, [rows, tab, kategoriFilter, search])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!isAdmin || !editing) return
    setSaving(true)
    setError('')
    const table = TABLE_BY_TAB[tab]
    const fields = FORM_FIELDS[tab]
    const payload = {}
    for (const f of fields) {
      let v = editing[f.key]
      if (f.type === 'number') {
        v = v === '' || v == null ? null : Number(String(v).replace(',', '.'))
        if (v != null && Number.isNaN(v)) v = null
      }
      if (typeof v === 'string') v = v.trim() || null
      payload[f.key] = v
    }
    try {
      if (editing.id) {
        const { error: err } = await supabase.from(table).update(payload).eq('id', editing.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from(table).insert(payload)
        if (err) throw err
      }
      setEditing(null)
      fetchData()
    } catch (err) {
      console.error('[Katalog] save error:', err)
      setError(err.message || 'Kayıt hatası')
    }
    setSaving(false)
  }

  const toggleAktif = async (row) => {
    if (!isAdmin) return
    const table = TABLE_BY_TAB[tab]
    await supabase.from(table).update({ aktif: !row.aktif }).eq('id', row.id)
    fetchData()
  }

  const saveParam = async (p, newValue) => {
    if (!isAdmin) return
    const v = Number(String(newValue).replace(',', '.'))
    if (Number.isNaN(v)) return
    await supabase.from('teklif_parametreler').update({ deger: v }).eq('id', p.id)
    fetchData()
  }

  const [yeniKur, setYeniKur] = useState({ tarih: new Date().toISOString().slice(0, 10), usd: '', eur: '', gbp: '' })
  const saveKur = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    const payload = {
      tarih: yeniKur.tarih,
      usd: Number(String(yeniKur.usd).replace(',', '.')),
      eur: Number(String(yeniKur.eur).replace(',', '.')),
      gbp: yeniKur.gbp ? Number(String(yeniKur.gbp).replace(',', '.')) : null,
    }
    if (!payload.tarih || Number.isNaN(payload.usd) || Number.isNaN(payload.eur)) return
    const { error: err } = await supabase
      .from('teklif_kurlar')
      .upsert(payload, { onConflict: 'tarih' })
    if (err) { setError(err.message); return }
    setYeniKur({ tarih: new Date().toISOString().slice(0, 10), usd: '', eur: '', gbp: '' })
    fetchData()
  }

  const katLabel = (v) => {
    const k = KATEGORILER.find((x) => x.value === v)
    return k ? (isEN ? k.en : k.tr) : v
  }
  const hesapLabel = (v) => {
    const h = HESAP_TIPLERI.find((x) => x.value === v)
    return h ? (isEN ? h.en : h.tr) : v
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400'
  const thCls = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'
  const tdCls = 'px-3 py-2 text-sm text-slate-700'

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">
            {isEN ? 'Quote Catalog' : 'Teklif Kataloğu'}
          </h1>
          {tab !== 'parametreler' && isAdmin && (
            <button
              type="button"
              onClick={() => setEditing({ ...EMPTY_ROW[tab] })}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              + {isEN ? 'New Record' : 'Yeni Kayıt'}
            </button>
          )}
        </div>

        {/* Sekmeler */}
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isEN ? t.en : t.tr}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : tab === 'parametreler' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Genel parametreler */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">
                {isEN ? 'General Parameters' : 'Genel Parametreler'}
              </h2>
              <div className="flex flex-col gap-2">
                {params.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700">{p.anahtar}</p>
                      {p.aciklama && <p className="truncate text-xs text-slate-400">{p.aciklama}</p>}
                    </div>
                    <input
                      type="text"
                      defaultValue={p.deger}
                      disabled={!isAdmin}
                      onBlur={(e) => {
                        if (String(p.deger) !== e.target.value) saveParam(p, e.target.value)
                      }}
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-slate-400 disabled:bg-slate-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Kurlar */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">
                {isEN ? 'Exchange Rates' : 'Döviz Kurları'}
              </h2>
              {isAdmin && (
                <form onSubmit={saveKur} className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <input type="date" value={yeniKur.tarih}
                    onChange={(e) => setYeniKur({ ...yeniKur, tarih: e.target.value })}
                    className={`${inputCls} col-span-2 sm:col-span-2`} />
                  <input type="text" placeholder="USD" value={yeniKur.usd}
                    onChange={(e) => setYeniKur({ ...yeniKur, usd: e.target.value })}
                    className={inputCls} />
                  <input type="text" placeholder="EUR" value={yeniKur.eur}
                    onChange={(e) => setYeniKur({ ...yeniKur, eur: e.target.value })}
                    className={inputCls} />
                  <button type="submit"
                    className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                    {isEN ? 'Save' : 'Kaydet'}
                  </button>
                </form>
              )}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className={thCls}>{isEN ? 'Date' : 'Tarih'}</th>
                    <th className={thCls}>USD</th>
                    <th className={thCls}>EUR</th>
                    <th className={thCls}>GBP</th>
                  </tr>
                </thead>
                <tbody>
                  {kurlar.map((k) => (
                    <tr key={k.id} className="border-b border-slate-50">
                      <td className={tdCls}>{k.tarih}</td>
                      <td className={tdCls}>{k.usd}</td>
                      <td className={tdCls}>{k.eur}</td>
                      <td className={tdCls}>{k.gbp ?? '—'}</td>
                    </tr>
                  ))}
                  {kurlar.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                      {isEN ? 'No rates yet' : 'Henüz kur kaydı yok'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Filtreler */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isEN ? 'Search...' : 'Ara...'}
                className="w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
              {tab === 'islemler' && (
                <select
                  value={kategoriFilter}
                  onChange={(e) => setKategori(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">{isEN ? 'All categories' : 'Tüm kategoriler'}</option>
                  {KATEGORILER.map((k) => (
                    <option key={k.value} value={k.value}>{isEN ? k.en : k.tr}</option>
                  ))}
                </select>
              )}
              <span className="ml-auto text-xs text-slate-400">
                {filteredRows.length} {isEN ? 'records' : 'kayıt'}
              </span>
            </div>

            {/* Tablo */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {tab === 'islemler' && (
                      <>
                        <th className={thCls}>{isEN ? 'Name' : 'Ad'}</th>
                        <th className={thCls}>{isEN ? 'Category' : 'Kategori'}</th>
                        <th className={thCls}>{isEN ? 'Calc' : 'Hesap'}</th>
                        <th className={thCls}>PB</th>
                        <th className={thCls}>{isEN ? 'Incl.' : 'Dahil'}</th>
                        <th className={thCls}>{isEN ? 'Base 1' : 'Taban 1'}</th>
                        <th className={thCls}>{isEN ? 'Unit 1' : 'Birim 1'}</th>
                        <th className={thCls}>{isEN ? 'Tier' : 'Eşik'}</th>
                        <th className={thCls}>{isEN ? 'Base 2' : 'Taban 2'}</th>
                        <th className={thCls}>{isEN ? 'Unit 2' : 'Birim 2'}</th>
                      </>
                    )}
                    {tab === 'makineler' && (
                      <>
                        <th className={thCls}>{isEN ? 'Name' : 'Ad'}</th>
                        <th className={thCls}>{isEN ? 'Station' : 'İstasyon'}</th>
                        <th className={thCls}>{isEN ? 'Incl. Run' : 'Dahil Tiraj'}</th>
                        <th className={thCls}>{isEN ? 'Plate 1' : 'Kalıp 1'}</th>
                        <th className={thCls}>{isEN ? 'Unit 1' : 'Birim 1'}</th>
                        <th className={thCls}>{isEN ? 'Tier' : 'Eşik'}</th>
                        <th className={thCls}>{isEN ? 'Plate 2' : 'Kalıp 2'}</th>
                        <th className={thCls}>{isEN ? 'Unit 2' : 'Birim 2'}</th>
                      </>
                    )}
                    {tab === 'kagitlar' && (
                      <>
                        <th className={thCls}>{isEN ? 'Type' : 'Cins'}</th>
                        <th className={thCls}>{isEN ? 'Grammage' : 'Gramaj'}</th>
                        <th className={thCls}>{isEN ? 'Size' : 'Ebat'}</th>
                        <th className={thCls}>{isEN ? 'Sale /kg' : 'Satış /kg'}</th>
                        <th className={thCls}>{isEN ? 'Thickness' : 'Kalınlık'}</th>
                      </>
                    )}
                    <th className={thCls}>{isEN ? 'Active' : 'Aktif'}</th>
                    {isAdmin && <th className={thCls}></th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.id} className={`border-b border-slate-50 ${r.aktif === false ? 'opacity-40' : ''}`}>
                      {tab === 'islemler' && (
                        <>
                          <td className={`${tdCls} font-medium`}>
                            {r.ad}
                            {r.notlar && (
                              <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700" title={r.notlar}>
                                {isEN ? 'note' : 'not'}
                              </span>
                            )}
                          </td>
                          <td className={tdCls}>{katLabel(r.kategori)}</td>
                          <td className={tdCls}>{hesapLabel(r.hesap_tipi)}</td>
                          <td className={tdCls}>{PB_SYMBOL[r.para_birimi] || r.para_birimi}</td>
                          <td className={tdCls}>{fmt(r.dahil_adet)}</td>
                          <td className={tdCls}>{fmt(r.taban_1)}</td>
                          <td className={tdCls}>{fmt(r.birim_1)}</td>
                          <td className={tdCls}>{fmt(r.kademe_esigi)}</td>
                          <td className={tdCls}>{fmt(r.taban_2)}</td>
                          <td className={tdCls}>{fmt(r.birim_2)}</td>
                        </>
                      )}
                      {tab === 'makineler' && (
                        <>
                          <td className={`${tdCls} font-medium`}>{r.ad}</td>
                          <td className={tdCls}>{r.istasyon || '—'}</td>
                          <td className={tdCls}>{fmt(r.dahil_adet)}</td>
                          <td className={tdCls}>{fmt(r.kalip_fiyat_1)}</td>
                          <td className={tdCls}>{fmt(r.birim_fiyat_1)}</td>
                          <td className={tdCls}>{fmt(r.kademe_esigi)}</td>
                          <td className={tdCls}>{fmt(r.kalip_fiyat_2)}</td>
                          <td className={tdCls}>{fmt(r.birim_fiyat_2)}</td>
                        </>
                      )}
                      {tab === 'kagitlar' && (
                        <>
                          <td className={`${tdCls} font-medium`}>{r.cins}</td>
                          <td className={tdCls}>{r.gramaj} gr</td>
                          <td className={tdCls}>{r.en} × {r.boy}</td>
                          <td className={tdCls}>
                            {r.satis_fiyat == null
                              ? <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">{isEN ? 'missing' : 'eksik'}</span>
                              : `${r.satis_fiyat} ${PB_SYMBOL[r.para_birimi] || ''}`}
                          </td>
                          <td className={tdCls}>{r.kalinlik_mm} mm</td>
                        </>
                      )}
                      <td className={tdCls}>
                        <button
                          type="button"
                          disabled={!isAdmin}
                          onClick={() => toggleAktif(r)}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-default ${r.aktif !== false ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${r.aktif !== false ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                        </button>
                      </td>
                      {isAdmin && (
                        <td className={tdCls}>
                          <button
                            type="button"
                            onClick={() => setEditing({ ...r })}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            {isEN ? 'Edit' : 'Düzenle'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-10 text-center text-sm text-slate-400">
                        {isEN ? 'No records found' : 'Kayıt bulunamadı'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Düzenleme / yeni kayıt modalı */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
            <form
              onSubmit={handleSave}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                {editing.id
                  ? (isEN ? 'Edit Record' : 'Kaydı Düzenle')
                  : (isEN ? 'New Record' : 'Yeni Kayıt')}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {FORM_FIELDS[tab].map((f) => (
                  <label key={f.key} className={`flex flex-col gap-1 ${f.key === 'ad' || f.key === 'notlar' ? 'sm:col-span-2' : ''}`}>
                    <span className="text-xs font-medium text-slate-500">
                      {isEN ? f.en : f.tr}{f.required && ' *'}
                    </span>
                    {f.type === 'select' ? (
                      <select
                        value={editing[f.key] || ''}
                        required={f.required}
                        onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                        className={inputCls}
                      >
                        {f.options.map((o) => (
                          <option key={o.value} value={o.value}>{isEN ? o.en : o.tr}</option>
                        ))}
                      </select>
                    ) : f.type === 'pb' ? (
                      <select
                        value={editing[f.key] || 'TRY'}
                        onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                        className={inputCls}
                      >
                        {PARA_BIRIMLERI.map((pb) => (
                          <option key={pb} value={pb}>{pb} ({PB_SYMBOL[pb]})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={editing[f.key] ?? ''}
                        required={f.required}
                        onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                        className={inputCls}
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  {isEN ? 'Cancel' : 'Vazgeç'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? (isEN ? 'Saving...' : 'Kaydediliyor...') : (isEN ? 'Save' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
