import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

export default function DepoHareketPage() {
  const { isAdmin } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const musteriId = searchParams.get('mid')
  const cins = searchParams.get('cins')
  const grammage = searchParams.get('gr') ? parseInt(searchParams.get('gr'), 10) : null
  const en = searchParams.get('en') ? parseInt(searchParams.get('en'), 10) : null
  const boy = searchParams.get('boy') ? parseInt(searchParams.get('boy'), 10) : null

  const isPaperMode = !!(cins && grammage && en && boy)

  // Filter params (customer mode only)
  const fCins = searchParams.get('fcins') || ''
  const fGr = searchParams.get('fgr') || ''
  const fEbat = searchParams.get('febat') || ''

  const [movements, setMovements] = useState([])
  const [cariName, setCariName] = useState('')
  const [loading, setLoading] = useState(true)

  const updateParams = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    if (!musteriId) {
      navigate('/panel/depo-stok', { replace: true })
      return
    }

    const fetchData = async () => {
      let entriesQuery = supabase.from('paper_entries').select('*').eq('musteri_id', musteriId)
      let exitsQuery = supabase.from('paper_exits').select('*').eq('musteri_id', musteriId)

      if (isPaperMode) {
        entriesQuery = entriesQuery.eq('paper_type_name', cins).eq('grammage', grammage).eq('en', en).eq('boy', boy)
        exitsQuery = exitsQuery.eq('paper_type_name', cins).eq('grammage', grammage).eq('en', en).eq('boy', boy)
      }

      const [entriesRes, exitsRes, profileRes] = await Promise.all([
        entriesQuery.order('created_at', { ascending: false }),
        exitsQuery.order('created_at', { ascending: false }),
        supabase.from('profiles').select('full_name, company_name').eq('id', musteriId).single(),
      ])

      const entryList = (entriesRes.data || []).map((e) => ({ ...e, direction: 'entry' }))
      const exitList = (exitsRes.data || []).map((e) => ({ ...e, direction: 'exit' }))
      const all = [...entryList, ...exitList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setMovements(all)
      setCariName(profileRes.data?.company_name || profileRes.data?.full_name || '-')
      setLoading(false)
    }

    fetchData()
  }, [musteriId, cins, grammage, en, boy, navigate])

  const handleDelete = async (id, direction) => {
    const table = direction === 'exit' ? 'paper_exits' : 'paper_entries'
    await supabase.from(table).delete().eq('id', id)
    setMovements((prev) => prev.filter((m) => !(m.id === id && m.direction === direction)))
  }

  // Unique filter values (customer mode)
  const allTypes = [...new Set(movements.map((m) => m.paper_type_name))].filter(Boolean).sort()
  const allGrammages = [...new Set(movements.map((m) => m.grammage))].sort((a, b) => a - b)
  const allEbatlar = [...new Set(movements.map((m) => `${m.en}x${m.boy}`))].sort()

  // Filter movements in customer mode
  const filteredMovements = !isPaperMode
    ? movements.filter((m) => {
        if (fCins && m.paper_type_name !== fCins) return false
        if (fGr && m.grammage !== parseInt(fGr, 10)) return false
        if (fEbat && `${m.en}x${m.boy}` !== fEbat) return false
        return true
      })
    : movements

  const activeFilterCount = (!isPaperMode ? [fCins, fGr, fEbat].filter(Boolean).length : 0)

  // Ozet hesaplama
  const totalEntry = filteredMovements.filter((m) => m.direction === 'entry').reduce((s, m) => s + m.tabaka, 0)
  const totalExit = filteredMovements.filter((m) => m.direction === 'exit').reduce((s, m) => s + m.tabaka, 0)
  const totalEntryKg = filteredMovements.filter((m) => m.direction === 'entry').reduce((s, m) => s + Number(m.kg), 0)
  const totalExitKg = filteredMovements.filter((m) => m.direction === 'exit').reduce((s, m) => s + Number(m.kg), 0)
  const netTabaka = totalEntry - totalExit
  const netKg = totalEntryKg - totalExitKg

  // Kumulatif bakiye hesapla (eskiden yeniye) - sadece paper modda anlamli
  const movementsWithBalance = (() => {
    const sorted = [...filteredMovements].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    let runningTabaka = 0
    let runningKg = 0
    const result = sorted.map((m) => {
      if (m.direction === 'entry') {
        runningTabaka += m.tabaka
        runningKg += Number(m.kg)
      } else {
        runningTabaka -= m.tabaka
        runningKg -= Number(m.kg)
      }
      return { ...m, balanceTabaka: runningTabaka, balanceKg: runningKg }
    })
    return result.reverse()
  })()

  const colCount = (isPaperMode ? 8 : 10) + (isAdmin ? 1 : 0)

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
      <div className="mx-auto max-w-6xl">
        {/* Geri butonu */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {isEN ? 'Back' : 'Geri'}
        </button>

        {/* Baslik karti */}
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">{cariName}</h1>
          {isPaperMode && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{cins}</span>
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{grammage} gr</span>
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{en}x{boy}</span>
            </div>
          )}

          {/* Ozet */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl bg-green-50 p-3">
              <p className="text-xs font-medium text-green-600">{isEN ? 'Total Entry' : 'Toplam Giris'}</p>
              <p className="mt-0.5 text-lg font-bold text-green-700">{formatNumber(totalEntry)}</p>
              <p className="text-xs text-green-600">{formatNumber(Math.round(totalEntryKg * 100) / 100)} kg</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-xs font-medium text-red-500">{isEN ? 'Total Exit' : 'Toplam Cikis'}</p>
              <p className="mt-0.5 text-lg font-bold text-red-600">{formatNumber(totalExit)}</p>
              <p className="text-xs text-red-500">{formatNumber(Math.round(totalExitKg * 100) / 100)} kg</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{isEN ? 'Net Sheets' : 'Net Tabaka'}</p>
              <p className={`mt-0.5 text-lg font-bold ${netTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(netTabaka)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{isEN ? 'Net KG' : 'Net KG'}</p>
              <p className={`mt-0.5 text-lg font-bold ${netKg < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(Math.round(netKg * 100) / 100)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{isEN ? 'Movements' : 'Hareket Sayisi'}</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">{filteredMovements.length}</p>
            </div>
          </div>
        </div>

        {/* Filtreler (sadece musteri modda) */}
        {!isPaperMode && (
          <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[140px]">
                <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Type' : 'Cins'}</label>
                <select value={fCins} onChange={(e) => updateParams('fcins', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
                  <option value="">{isEN ? 'All' : 'Tümü'}</option>
                  {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Grammage' : 'Gramaj'}</label>
                <select value={fGr} onChange={(e) => updateParams('fgr', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
                  <option value="">{isEN ? 'All' : 'Tümü'}</option>
                  {allGrammages.map((g) => <option key={g} value={g}>{g} gr</option>)}
                </select>
              </div>
              <div className="min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Size' : 'Ebat'}</label>
                <select value={fEbat} onChange={(e) => updateParams('febat', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
                  <option value="">{isEN ? 'All' : 'Tümü'}</option>
                  {allEbatlar.map((eb) => <option key={eb} value={eb}>{eb}</option>)}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev)
                      next.delete('fcins')
                      next.delete('fgr')
                      next.delete('febat')
                      return next
                    })
                  }}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {isEN ? 'Clear Filters' : 'Temizle'} ({activeFilterCount})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hareket tablosu */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-700">{isEN ? 'Movement History' : 'Hareket Gecmisi'}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Date' : 'Tarih'}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Time' : 'Saat'}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Direction' : 'Tur'}</th>
                  {!isPaperMode && (
                    <>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Type' : 'Cins'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Gr</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Size' : 'Ebat'}</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Job Order' : 'Is Emri No'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Sheets' : 'Tabaka'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">KG</th>
                  {isPaperMode && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Balance' : 'Bakiye'}</th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Notes' : 'Not'}</th>
                  {isAdmin && <th className="px-4 py-3 w-10" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movementsWithBalance.length === 0 ? (
                  <tr><td colSpan={colCount} className="px-4 py-12 text-center text-sm text-slate-400">{isEN ? 'No movements yet' : 'Henuz hareket yok'}</td></tr>
                ) : (
                  <>
                    {movementsWithBalance.map((m) => {
                      const isExit = m.direction === 'exit'
                      const date = new Date(m.created_at)
                      return (
                        <tr key={`${m.direction}-${m.id}`} className="transition hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                            {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                            {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            {isExit
                              ? <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{isEN ? 'Exit' : 'Cikis'}</span>
                              : <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{isEN ? 'Entry' : 'Giris'}</span>
                            }
                          </td>
                          {!isPaperMode && (
                            <>
                              <td className="px-4 py-3 text-slate-700">{m.paper_type_name}</td>
                              <td className="px-4 py-3 text-slate-600">{m.grammage}</td>
                              <td className="px-4 py-3 text-slate-600">{m.en}x{m.boy}</td>
                            </>
                          )}
                          <td className="px-4 py-3 text-slate-600">{m.is_emri_no || '\u2014'}</td>
                          <td className={`px-4 py-3 text-right tabular-nums font-medium ${isExit ? 'text-red-600' : 'text-green-700'}`}>
                            {isExit ? '-' : '+'}{formatNumber(m.tabaka)}
                          </td>
                          <td className={`px-4 py-3 text-right tabular-nums font-semibold ${isExit ? 'text-red-600' : 'text-green-700'}`}>
                            {isExit ? '-' : '+'}{formatNumber(Math.round(Number(m.kg) * 100) / 100)}
                          </td>
                          {isPaperMode && (
                            <td className={`px-4 py-3 text-right tabular-nums font-bold ${m.balanceTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                              {formatNumber(m.balanceTabaka)}
                            </td>
                          )}
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{m.notes || '\u2014'}</td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => handleDelete(m.id, m.direction)} className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                    {/* Toplam satiri */}
                    <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                      <td className="px-4 py-3 text-slate-900" colSpan={isPaperMode ? 4 : 7}>{isEN ? 'TOTAL' : 'TOPLAM'}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${netTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(netTabaka)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${netKg < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(Math.round(netKg * 100) / 100)}</td>
                      {isPaperMode && <td className={`px-4 py-3 text-right tabular-nums ${netTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(netTabaka)}</td>}
                      <td />
                      {isAdmin && <td />}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
