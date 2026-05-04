import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

export default function DepoStokPage() {
  const { isAdmin } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()

  const [entries, setEntries] = useState([])
  const [exits, setExits] = useState([])
  const [loading, setLoading] = useState(true)

  // URL'den state oku — filtreler ve seçili cari URL'de saklanır
  const [searchParams, setSearchParams] = useSearchParams()

  const viewTab = searchParams.get('tab') || 'cariler'
  const searchTerm = searchParams.get('q') || ''
  const filterType = searchParams.get('cins') || ''
  const filterGrammage = searchParams.get('gr') || ''
  const filterEbat = searchParams.get('ebat') || ''

  // URL parametrelerini güncelleme yardımcısı
  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
      })
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    const fetchData = async () => {
      const [entriesRes, exitsRes] = await Promise.all([
        supabase
          .from('paper_entries')
          .select('*, musteri:profiles!paper_entries_musteri_id_fkey(full_name, company_name), paper_type:paper_types!paper_entries_paper_type_id_fkey(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('paper_exits')
          .select('*, musteri:profiles!paper_exits_musteri_id_fkey(full_name, company_name), paper_type:paper_types!paper_exits_paper_type_id_fkey(name)')
          .order('created_at', { ascending: false }),
      ])

      if (!entriesRes.error) setEntries(entriesRes.data || [])
      if (!exitsRes.error) setExits(exitsRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Benzersiz kağıt cinsleri, gramajları ve ebatları (filtre için)
  const allPaperTypes = [...new Set([...entries, ...exits].map((e) => e.paper_type_name))].sort((a, b) => a.localeCompare(b, 'tr'))
  const allGrammages = [...new Set([...entries, ...exits].map((e) => e.grammage))].sort((a, b) => a - b)
  const allEbatlar = [...new Set([...entries, ...exits].map((e) => `${e.en}x${e.boy}`))].sort()

  // Stok kimliği: kağıt cinsi + gramaj + ebat üçlüsü (genel özet kartları için)
  const stockIdentities = (() => {
    const groups = {}

    entries.forEach((e) => {
      const ebat = `${e.en}x${e.boy}`
      const key = `${e.paper_type_name}_${e.grammage}_${ebat}`
      if (!groups[key]) groups[key] = { type: e.paper_type_name, grammage: e.grammage, en: e.en, boy: e.boy, ebat, totalTabaka: 0, totalKg: 0 }
      groups[key].totalTabaka += e.tabaka
      groups[key].totalKg += Number(e.kg)
    })

    exits.forEach((e) => {
      const ebat = `${e.en}x${e.boy}`
      const key = `${e.paper_type_name}_${e.grammage}_${ebat}`
      if (!groups[key]) groups[key] = { type: e.paper_type_name, grammage: e.grammage, en: e.en, boy: e.boy, ebat, totalTabaka: 0, totalKg: 0 }
      groups[key].totalTabaka -= e.tabaka
      groups[key].totalKg -= Number(e.kg)
    })

    return Object.values(groups).sort((a, b) => a.type.localeCompare(b.type, 'tr') || a.grammage - b.grammage || a.ebat.localeCompare(b.ebat))
  })()

  const totalTabaka = stockIdentities.reduce((s, p) => s + p.totalTabaka, 0)
  const totalKg = stockIdentities.reduce((s, p) => s + p.totalKg, 0)

  // Düz satır: Müşteri + kağıt cinsi + gramaj + ebat bazında giriş/çıkış/net
  const flatRows = (() => {
    const groups = {}

    entries.forEach((e) => {
      const ebat = `${e.en}x${e.boy}`
      const key = `${e.musteri_id}_${e.paper_type_name}_${e.grammage}_${ebat}`
      if (!groups[key]) {
        groups[key] = {
          key,
          musteri_id: e.musteri_id,
          cari: e.musteri?.company_name || e.musteri?.full_name || '-',
          type: e.paper_type_name,
          grammage: e.grammage,
          en: e.en,
          boy: e.boy,
          ebat,
          entryTabaka: 0,
          exitTabaka: 0,
          entryKg: 0,
          exitKg: 0,
        }
      }
      groups[key].entryTabaka += e.tabaka
      groups[key].entryKg += Number(e.kg)
    })

    exits.forEach((e) => {
      const ebat = `${e.en}x${e.boy}`
      const key = `${e.musteri_id}_${e.paper_type_name}_${e.grammage}_${ebat}`
      if (!groups[key]) {
        groups[key] = {
          key,
          musteri_id: e.musteri_id,
          cari: e.musteri?.company_name || e.musteri?.full_name || '-',
          type: e.paper_type_name,
          grammage: e.grammage,
          en: e.en,
          boy: e.boy,
          ebat,
          entryTabaka: 0,
          exitTabaka: 0,
          entryKg: 0,
          exitKg: 0,
        }
      }
      groups[key].exitTabaka += e.tabaka
      groups[key].exitKg += Number(e.kg)
    })

    return Object.values(groups).sort((a, b) => a.cari.localeCompare(b.cari, 'tr'))
  })()

  // Filtrelenmiş düz satırlar
  const filteredFlatRows = (() => {
    let result = flatRows
    if (filterType) result = result.filter((r) => r.type === filterType)
    if (filterGrammage) result = result.filter((r) => r.grammage === parseInt(filterGrammage, 10))
    if (filterEbat) result = result.filter((r) => r.ebat === filterEbat)
    if (searchTerm) result = result.filter((r) => r.cari.toLowerCase().includes(searchTerm.toLowerCase()))
    return result
  })()

  // Filtrelenmiş toplamlar
  const flatTotals = {
    entryTabaka: filteredFlatRows.reduce((s, r) => s + r.entryTabaka, 0),
    exitTabaka: filteredFlatRows.reduce((s, r) => s + r.exitTabaka, 0),
    netTabaka: filteredFlatRows.reduce((s, r) => s + (r.entryTabaka - r.exitTabaka), 0),
    netKg: filteredFlatRows.reduce((s, r) => s + (r.entryKg - r.exitKg), 0),
  }

  // Carileri grupla (giriş - çıkış = net stok)
  const cariList = (() => {
    const groups = {}

    entries.forEach((e) => {
      const id = e.musteri_id
      if (!groups[id]) {
        groups[id] = { id, name: e.musteri?.company_name || e.musteri?.full_name || '-', totalTabaka: 0, totalKg: 0, entryCount: 0, lastActivity: e.created_at }
      }
      groups[id].totalTabaka += e.tabaka
      groups[id].totalKg += Number(e.kg)
      groups[id].entryCount += 1
    })

    exits.forEach((e) => {
      const id = e.musteri_id
      if (!groups[id]) {
        groups[id] = { id, name: e.musteri?.company_name || e.musteri?.full_name || '-', totalTabaka: 0, totalKg: 0, entryCount: 0, lastActivity: e.created_at }
      }
      groups[id].totalTabaka -= e.tabaka
      groups[id].totalKg -= Number(e.kg)
      groups[id].entryCount += 1
      if (e.created_at > groups[id].lastActivity) groups[id].lastActivity = e.created_at
    })

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  })()

  const filteredCariList = searchTerm
    ? cariList.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : cariList

  // Filtrelenmiş cari toplamları
  const cariTotals = {
    totalTabaka: filteredCariList.reduce((s, c) => s + c.totalTabaka, 0),
    totalKg: filteredCariList.reduce((s, c) => s + c.totalKg, 0),
  }

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
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">{isEN ? 'Warehouse Stock Status' : 'Depo Stok Durumu'}</h1>
          <p className="mt-1 text-sm text-slate-500">{isEN ? 'Click a customer to view stock movements' : 'Stok hareketlerini görmek için bir cariye tıklayın'}</p>
        </div>

        <div>
            {/* Genel özet kartları */}
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">{isEN ? 'Customers' : 'Toplam Cari'}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{cariList.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">{isEN ? 'Net Sheets' : 'Net Tabaka'}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(totalTabaka)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">{isEN ? 'Net KG' : 'Net KG'}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(Math.round(totalKg * 100) / 100)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">{isEN ? 'Stock Items' : 'Stok Kalemi'}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{stockIdentities.length}</p>
              </div>
            </div>

            {/* Tab seçimi: Cariler / Kağıtlar */}
            <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => updateParams({ tab: '', q: '' })} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${viewTab === 'cariler' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {isEN ? 'By Customer' : 'Cariler'}
              </button>
              <button type="button" onClick={() => updateParams({ tab: 'kagitlar', cari: '', q: '' })} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${viewTab === 'kagitlar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {isEN ? 'By Paper Type' : 'Kağıt Cinsleri'}
              </button>
            </div>

            {/* ===== TAB: Cariler ===== */}
            {viewTab === 'cariler' && (
              <>
                {/* Arama */}
                <div className="mb-4">
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" value={searchTerm} onChange={(e) => updateParams({ q: e.target.value })} placeholder={isEN ? 'Search customer...' : 'Cari ara...'} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400" />
                  </div>
                </div>

                {/* Cari tablosu */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Customer' : 'Cari'}</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Movements' : 'Hareket'}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Net Sheets' : 'Net Tabaka'}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Net KG' : 'Net KG'}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Last Activity' : 'Son Hareket'}</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Detail' : 'Detay'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCariList.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">{searchTerm ? (isEN ? 'No customers found' : 'Cari bulunamadı') : (isEN ? 'No stock data yet' : 'Henüz stok verisi yok')}</td></tr>
                        ) : (
                          <>
                            {filteredCariList.map((cari) => (
                              <tr key={cari.id} className="transition hover:bg-slate-50">
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                      {cari.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-slate-900">{cari.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{cari.entryCount}</span>
                                </td>
                                <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${cari.totalTabaka < 0 ? 'text-red-600' : 'text-slate-700'}`}>{formatNumber(cari.totalTabaka)}</td>
                                <td className={`px-4 py-2.5 text-right tabular-nums font-bold ${cari.totalKg < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(Math.round(cari.totalKg * 100) / 100)}</td>
                                <td className="px-4 py-2.5 text-right text-slate-500">{new Date(cari.lastActivity).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</td>
                                <td className="px-4 py-2.5 text-center">
                                  <button type="button" onClick={() => navigate(`/panel/depo-stok/hareket?mid=${cari.id}`)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800">
                                    {isEN ? 'CLICK' : 'TIKLA'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {/* Toplam satırı */}
                            <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                              <td className="px-4 py-3 text-slate-900" colSpan={2}>{isEN ? 'TOTAL' : 'TOPLAM'}</td>
                              <td className={`px-4 py-3 text-right tabular-nums ${cariTotals.totalTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(cariTotals.totalTabaka)}</td>
                              <td className={`px-4 py-3 text-right tabular-nums ${cariTotals.totalKg < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(Math.round(cariTotals.totalKg * 100) / 100)}</td>
                              <td />
                              <td />
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ===== TAB: Kağıt Cinsleri (Düz Tablo) ===== */}
            {viewTab === 'kagitlar' && (
              <>
                {/* Filtreler + Arama */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[200px] flex-1">
                    <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" value={searchTerm} onChange={(e) => updateParams({ q: e.target.value })} placeholder={isEN ? 'Search customer...' : 'Cari ara...'} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400" />
                  </div>
                  <select value={filterType} onChange={(e) => updateParams({ cins: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                    <option value="">{isEN ? 'All Types' : 'Tüm Cinsler'}</option>
                    {allPaperTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                  <select value={filterGrammage} onChange={(e) => updateParams({ gr: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                    <option value="">{isEN ? 'All Grammages' : 'Tüm Gramajlar'}</option>
                    {allGrammages.map((g) => (<option key={g} value={g}>{g} gr</option>))}
                  </select>
                  <select value={filterEbat} onChange={(e) => updateParams({ ebat: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                    <option value="">{isEN ? 'All Sizes' : 'Tüm Ebatlar'}</option>
                    {allEbatlar.map((eb) => (<option key={eb} value={eb}>{eb}</option>))}
                  </select>
                  {(filterType || filterGrammage || filterEbat || searchTerm) && (
                    <button type="button" onClick={() => updateParams({ cins: '', gr: '', ebat: '', q: '' })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
                      {isEN ? 'Clear' : 'Temizle'}
                    </button>
                  )}
                </div>

                {/* Aktif filtre badge'leri */}
                {(filterType || filterGrammage || filterEbat) && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">{isEN ? 'Filtered:' : 'Filtre:'}</span>
                    {filterType && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {filterType}
                        <button type="button" onClick={() => updateParams({ cins: '' })} className="ml-0.5 text-slate-400 hover:text-slate-600">&times;</button>
                      </span>
                    )}
                    {filterGrammage && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {filterGrammage} gr
                        <button type="button" onClick={() => updateParams({ gr: '' })} className="ml-0.5 text-slate-400 hover:text-slate-600">&times;</button>
                      </span>
                    )}
                    {filterEbat && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {filterEbat}
                        <button type="button" onClick={() => updateParams({ ebat: '' })} className="ml-0.5 text-slate-400 hover:text-slate-600">&times;</button>
                      </span>
                    )}
                  </div>
                )}

                {/* Düz stok tablosu */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Customer' : 'Cari'}</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Width' : 'En'}</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Height' : 'Boy'}</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Type' : 'Kağıt Cinsi'}</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Grammage' : 'Gramaj'}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-green-600">{isEN ? 'Entry' : 'Giriş'}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-red-500">{isEN ? 'Exit' : 'Çıkış'}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Net Sheets' : 'Net Tabaka'}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Net KG' : 'Net KG'}</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Detail' : 'Detay'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFlatRows.length === 0 ? (
                          <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-400">{isEN ? 'No stock data' : 'Stok verisi yok'}</td></tr>
                        ) : (
                          <>
                            {filteredFlatRows.map((row) => {
                              const netTabaka = row.entryTabaka - row.exitTabaka
                              const netKg = row.entryKg - row.exitKg
                              return (
                                <tr key={row.key} className="transition hover:bg-slate-50">
                                  <td className="px-4 py-2.5 font-medium text-slate-900">{row.cari}</td>
                                  <td className="px-4 py-2.5 text-slate-600">{row.en}</td>
                                  <td className="px-4 py-2.5 text-slate-600">{row.boy}</td>
                                  <td className="px-4 py-2.5 text-slate-700">{row.type}</td>
                                  <td className="px-4 py-2.5 text-slate-600">{row.grammage}</td>
                                  <td className="px-4 py-2.5 text-right tabular-nums text-green-700">{formatNumber(row.entryTabaka)}</td>
                                  <td className="px-4 py-2.5 text-right tabular-nums text-red-600">{formatNumber(row.exitTabaka)}</td>
                                  <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${netTabaka < 0 ? 'text-red-600' : 'text-slate-700'}`}>{formatNumber(netTabaka)}</td>
                                  <td className={`px-4 py-2.5 text-right tabular-nums font-bold ${netKg < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(Math.round(netKg * 100) / 100)}</td>
                                  <td className="px-4 py-2.5 text-center">
                                    <button type="button" onClick={() => navigate(`/panel/depo-stok/hareket?mid=${row.musteri_id}&cins=${encodeURIComponent(row.type)}&gr=${row.grammage}&en=${row.en}&boy=${row.boy}`)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800">
                                      {isEN ? 'CLICK' : 'TIKLA'}
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                            {/* Toplam satırı */}
                            <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                              <td className="px-4 py-3 text-slate-900" colSpan={5}>{isEN ? 'TOTAL' : 'TOPLAM'}</td>
                              <td className="px-4 py-3 text-right tabular-nums text-green-700">{formatNumber(flatTotals.entryTabaka)}</td>
                              <td className="px-4 py-3 text-right tabular-nums text-red-600">{formatNumber(flatTotals.exitTabaka)}</td>
                              <td className={`px-4 py-3 text-right tabular-nums ${flatTotals.netTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(flatTotals.netTabaka)}</td>
                              <td className={`px-4 py-3 text-right tabular-nums ${flatTotals.netKg < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(Math.round(flatTotals.netKg * 100) / 100)}</td>
                              <td />
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

      </div>
    </DashboardLayout>
  )
}
