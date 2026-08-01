import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { formatNumber } from '../../lib/formatters'

const DURUMLAR = [
  { value: 'taslak', tr: 'Taslak', en: 'Draft', cls: 'bg-slate-100 text-slate-600' },
  { value: 'gonderildi', tr: 'Gönderildi', en: 'Sent', cls: 'bg-blue-50 text-blue-700' },
  { value: 'onaylandi', tr: 'Onaylandı', en: 'Approved', cls: 'bg-green-50 text-green-700' },
  { value: 'reddedildi', tr: 'Reddedildi', en: 'Rejected', cls: 'bg-red-50 text-red-600' },
]

export default function TekliflerPage() {
  const { isAdmin } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const durumFilter = searchParams.get('durum') || ''
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    const { data, error: err } = await supabase
      .from('teklifler')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (err) {
      console.error('[Teklifler] fetch:', err)
      setError(isEN ? 'Quotes could not be loaded.' : 'Teklifler yüklenemedi.')
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, []) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    let list = rows
    if (durumFilter) list = list.filter((r) => r.durum === durumFilter)
    const q = search.trim().toLocaleLowerCase('tr-TR')
    if (q) {
      list = list.filter((r) =>
        `${r.firma_adi} ${r.is_adi} ${r.teklif_no}`.toLocaleLowerCase('tr-TR').includes(q))
    }
    return list
  }, [rows, durumFilter, search])

  const setDurumFilter = (d) => {
    const next = new URLSearchParams(searchParams)
    if (d) next.set('durum', d)
    else next.delete('durum')
    setSearchParams(next, { replace: true })
  }

  const setDurum = async (row, durum) => {
    if (!isAdmin) return
    await supabase.from('teklifler').update({ durum }).eq('id', row.id)
    fetchData()
  }

  const durumBadge = (d) => {
    const x = DURUMLAR.find((y) => y.value === d) || DURUMLAR[0]
    return (
      <span className={`rounded-lg px-2 py-1 text-xs font-medium ${x.cls}`}>
        {isEN ? x.en : x.tr}
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">
            {isEN ? 'Quotes' : 'Teklifler'}
          </h1>
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/panel/teklif/yeni')}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              + {isEN ? 'New Quote' : 'Yeni Teklif'}
            </button>
          )}
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEN ? 'Search...' : 'Ara...'}
            className="w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <select
            value={durumFilter}
            onChange={(e) => setDurumFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="">{isEN ? 'All statuses' : 'Tüm durumlar'}</option>
            {DURUMLAR.map((d) => (
              <option key={d.value} value={d.value}>{isEN ? d.en : d.tr}</option>
            ))}
          </select>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} {isEN ? 'quotes' : 'teklif'}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['No', isEN ? 'Company' : 'Firma', isEN ? 'Job' : 'İş', isEN ? 'Qty' : 'Adet',
                    isEN ? 'Sale' : 'Satış', isEN ? 'Unit' : 'Birim', isEN ? 'Date' : 'Tarih',
                    isEN ? 'Status' : 'Durum'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 text-sm font-medium text-slate-700">#{r.teklif_no}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{r.firma_adi}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{r.is_adi}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{formatNumber(r.adet)}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-slate-900">
                      {r.satis_tutari != null ? `${formatNumber(Math.round(r.satis_tutari))} ₺` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">
                      {r.birim_fiyat != null
                        ? Number(r.birim_fiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                        : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-3 py-2.5">
                      {isAdmin ? (
                        <select
                          value={r.durum}
                          onChange={(e) => setDurum(r, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400"
                        >
                          {DURUMLAR.map((d) => (
                            <option key={d.value} value={d.value}>{isEN ? d.en : d.tr}</option>
                          ))}
                        </select>
                      ) : durumBadge(r.durum)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                      {isEN ? 'No quotes yet' : 'Henüz teklif yok'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
