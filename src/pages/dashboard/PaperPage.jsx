import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

export default function PaperPage() {
  const { profile, role, isAdmin, canEditJobs } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const isCustomer = role === 'musteri'

  const [tab, setTab] = useState('entry') // 'entry' | 'stock'
  const [types, setTypes] = useState([])
  const [grammages, setGrammages] = useState([])
  const [customers, setCustomers] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [form, setForm] = useState({
    musteri_id: '',
    paper_type_id: '',
    grammage: '',
    en: '',
    boy: '',
    tabaka: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  // Filtre state (stok tab)
  const [stockFilter, setStockFilter] = useState({ musteri_id: '', paper_type_id: '' })

  const fetchData = async () => {
    const promises = [
      supabase.from('paper_types').select('*').order('name'),
      supabase.from('paper_grammages').select('*').order('value'),
      supabase.from('paper_entries')
        .select('*, musteri:profiles!paper_entries_musteri_id_fkey(full_name, company_name), paper_type:paper_types!paper_entries_paper_type_id_fkey(name)')
        .order('created_at', { ascending: false }),
    ]

    // Müşteri listesini sadece personel/admin çeker
    if (!isCustomer) {
      promises.push(
        supabase.from('profiles').select('id, full_name, company_name').eq('role', 'musteri').order('full_name')
      )
    }

    const results = await Promise.all(promises)
    setTypes(results[0].data || [])
    setGrammages(results[1].data || [])
    setEntries(results[2].data || [])
    if (!isCustomer && results[3]) {
      setCustomers(results[3].data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // KG hesaplama: (en × boy × gramaj × tabaka) / 10.000
  const calculatedKg = (() => {
    const en = parseInt(form.en, 10) || 0
    const boy = parseInt(form.boy, 10) || 0
    const gr = parseInt(form.grammage, 10) || 0
    const tb = parseInt(form.tabaka, 10) || 0
    if (en && boy && gr && tb) {
      return (en * boy * gr * tb) / 10000
    }
    return 0
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.musteri_id || !form.paper_type_id || !form.grammage || !form.en || !form.boy || !form.tabaka) return

    setSaving(true)
    const selectedType = types.find((t) => t.id === form.paper_type_id)

    const { error } = await supabase.from('paper_entries').insert({
      musteri_id: form.musteri_id,
      paper_type_id: form.paper_type_id,
      paper_type_name: selectedType?.name || '',
      grammage: parseInt(form.grammage, 10),
      en: parseInt(form.en, 10),
      boy: parseInt(form.boy, 10),
      tabaka: parseInt(form.tabaka, 10),
      kg: calculatedKg,
      notes: form.notes.trim() || null,
      created_by: profile.id,
    })

    if (error) {
      console.error('Paper entry error:', error)
      setSaving(false)
      return
    }

    // Form sıfırla
    setForm({ musteri_id: '', paper_type_id: '', grammage: '', en: '', boy: '', tabaka: '', notes: '' })
    setSaving(false)
    fetchData()
  }

  const handleDeleteEntry = async (id) => {
    await supabase.from('paper_entries').delete().eq('id', id)
    fetchData()
  }

  // Stok hesaplama (gruplama)
  const stockData = (() => {
    let filtered = entries
    if (stockFilter.musteri_id) {
      filtered = filtered.filter((e) => e.musteri_id === stockFilter.musteri_id)
    }
    if (stockFilter.paper_type_id) {
      filtered = filtered.filter((e) => e.paper_type_id === stockFilter.paper_type_id)
    }

    const groups = {}
    filtered.forEach((e) => {
      const key = `${e.musteri_id}_${e.paper_type_name}_${e.grammage}_${e.en}x${e.boy}`
      if (!groups[key]) {
        groups[key] = {
          musteri: e.musteri?.company_name || e.musteri?.full_name || '-',
          musteri_id: e.musteri_id,
          type: e.paper_type_name,
          grammage: e.grammage,
          ebat: `${e.en}x${e.boy}`,
          totalTabaka: 0,
          totalKg: 0,
        }
      }
      groups[key].totalTabaka += e.tabaka
      groups[key].totalKg += Number(e.kg)
    })

    return Object.values(groups).sort((a, b) => a.musteri.localeCompare(b.musteri, 'tr'))
  })()

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
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">
            {isEN ? 'Paper Management' : (isCustomer ? 'Kağıtlarım' : 'Kağıt Yönetimi')}
          </h1>
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/panel/kagit-ayarlari')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isEN ? 'Settings' : 'Ayarlar'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('entry')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === 'entry'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {isEN ? 'Paper Entry' : 'Kağıt Girişi'}
          </button>
          <button
            type="button"
            onClick={() => setTab('stock')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === 'stock'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {isEN ? 'Stock Status' : 'Depo Stok Durumu'}
          </button>
        </div>

        {/* TAB 1: Kağıt Girişi */}
        {tab === 'entry' && (
          <div>
            {/* Form — sadece personel/admin */}
            {canEditJobs && (
              <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-sm font-semibold text-slate-700">
                  {isEN ? 'New Paper Entry' : 'Yeni Kağıt Girişi'}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Müşteri */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      {isEN ? 'Customer' : 'Müşteri'}
                    </label>
                    <select
                      value={form.musteri_id}
                      onChange={(e) => setForm({ ...form, musteri_id: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="">{isEN ? 'Select customer...' : 'Müşteri seçin...'}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name}{c.company_name ? ` — ${c.company_name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Kağıt Cinsi */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      {isEN ? 'Paper Type' : 'Kağıt Cinsi'}
                    </label>
                    <select
                      value={form.paper_type_id}
                      onChange={(e) => setForm({ ...form, paper_type_id: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="">{isEN ? 'Select type...' : 'Cins seçin...'}</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gramaj */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      {isEN ? 'Grammage (g/m²)' : 'Gramaj (g/m²)'}
                    </label>
                    <select
                      value={form.grammage}
                      onChange={(e) => setForm({ ...form, grammage: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="">{isEN ? 'Select grammage...' : 'Gramaj seçin...'}</option>
                      {grammages.map((g) => (
                        <option key={g.id} value={g.value}>{g.value}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ebat: En x Boy */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      {isEN ? 'Size (cm)' : 'Ebat (cm)'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={form.en}
                        onChange={(e) => setForm({ ...form, en: e.target.value })}
                        placeholder={isEN ? 'Width' : 'En'}
                        min="1"
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                      />
                      <span className="text-sm font-bold text-slate-400">x</span>
                      <input
                        type="number"
                        value={form.boy}
                        onChange={(e) => setForm({ ...form, boy: e.target.value })}
                        placeholder={isEN ? 'Height' : 'Boy'}
                        min="1"
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Tabaka */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      {isEN ? 'Sheets' : 'Tabaka'}
                    </label>
                    <input
                      type="number"
                      value={form.tabaka}
                      onChange={(e) => setForm({ ...form, tabaka: e.target.value })}
                      placeholder={isEN ? 'e.g. 20000' : 'ör. 20000'}
                      min="1"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                  </div>

                  {/* KG (otomatik) */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      {isEN ? 'Weight (KG)' : 'Kağıt KG'}
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                      <span className={`text-sm font-bold ${calculatedKg > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                        {calculatedKg > 0 ? formatNumber(Math.round(calculatedKg * 100) / 100) : '—'}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">kg</span>
                    </div>
                  </div>

                  {/* Notlar */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      {isEN ? 'Notes' : 'Notlar'}
                    </label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder={isEN ? 'Optional...' : 'İsteğe bağlı...'}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || calculatedKg <= 0}
                  className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto sm:px-8"
                >
                  {saving ? '...' : isEN ? 'Save' : 'Kaydet'}
                </button>
              </form>
            )}

            {/* Son girişler tablosu */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-700">
                  {isEN ? 'Recent Entries' : 'Son Girişler'}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Date' : 'Tarih'}</th>
                      {!isCustomer && <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Customer' : 'Müşteri'}</th>}
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Type' : 'Cins'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Gr' : 'Gr'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Size' : 'Ebat'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 text-right">{isEN ? 'Sheets' : 'Tabaka'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 text-right">KG</th>
                      {isAdmin && <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 w-10" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={isCustomer ? 6 : 7} className="px-4 py-8 text-center text-xs text-slate-400">
                          {isEN ? 'No entries yet' : 'Henüz kayıt yok'}
                        </td>
                      </tr>
                    ) : (
                      entries.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {new Date(e.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          {!isCustomer && (
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {e.musteri?.company_name || e.musteri?.full_name || '-'}
                            </td>
                          )}
                          <td className="px-4 py-3 text-slate-700">{e.paper_type_name}</td>
                          <td className="px-4 py-3 text-slate-600">{e.grammage}</td>
                          <td className="px-4 py-3 text-slate-600">{e.en}x{e.boy}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(e.tabaka)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">{formatNumber(Math.round(Number(e.kg) * 100) / 100)}</td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(e.id)}
                                className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Depo Stok Durumu */}
        {tab === 'stock' && (
          <div>
            {/* Filtreler */}
            {!isCustomer && (
              <div className="mb-4 flex flex-wrap gap-3">
                <select
                  value={stockFilter.musteri_id}
                  onChange={(e) => setStockFilter({ ...stockFilter, musteri_id: e.target.value })}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">{isEN ? 'All Customers' : 'Tüm Müşteriler'}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}{c.company_name ? ` — ${c.company_name}` : ''}
                    </option>
                  ))}
                </select>
                <select
                  value={stockFilter.paper_type_id}
                  onChange={(e) => setStockFilter({ ...stockFilter, paper_type_id: e.target.value })}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">{isEN ? 'All Types' : 'Tüm Cinsler'}</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Stok tablosu */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {!isCustomer && <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Customer' : 'Müşteri'}</th>}
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Type' : 'Cins'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Gr' : 'Gr'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Size' : 'Ebat'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 text-right">{isEN ? 'Total Sheets' : 'Toplam Tabaka'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 text-right">{isEN ? 'Total KG' : 'Toplam KG'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stockData.length === 0 ? (
                      <tr>
                        <td colSpan={isCustomer ? 5 : 6} className="px-4 py-8 text-center text-xs text-slate-400">
                          {isEN ? 'No stock data' : 'Stok verisi yok'}
                        </td>
                      </tr>
                    ) : (
                      stockData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {!isCustomer && <td className="px-4 py-3 font-medium text-slate-900">{row.musteri}</td>}
                          <td className="px-4 py-3 text-slate-700">{row.type}</td>
                          <td className="px-4 py-3 text-slate-600">{row.grammage}</td>
                          <td className="px-4 py-3 text-slate-600">{row.ebat}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(row.totalTabaka)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatNumber(Math.round(row.totalKg * 100) / 100)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
