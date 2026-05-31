import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function PaperReportsPage() {
  const { isEN } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [top10Year, setTop10Year] = useState(new Date().getFullYear())
  const [top10Month, setTop10Month] = useState(new Date().getMonth())
  const [paperExits, setPaperExits] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const monthNames = isEN ? MONTHS_EN : MONTHS_TR

  // Drill state from URL
  const selectedMonth = searchParams.has('m') ? Number(searchParams.get('m')) : null
  const selectedCid = searchParams.get('cid') || null
  const drillLevel = selectedCid ? 3 : selectedMonth != null ? 2 : 1

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('paper_exits')
          .select('*, musteri:profiles!paper_exits_musteri_id_fkey(company_name)')
          .order('created_at', { ascending: false })
        if (!error) setPaperExits(data || [])
      } catch (err) {
        console.error('Paper exits fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const availableYears = useMemo(() => {
    const years = new Set(paperExits.map((e) => new Date(e.created_at).getFullYear()))
    years.add(currentYear)
    return [...years].sort((a, b) => a - b)
  }, [paperExits, currentYear])

  // --- Yearly summary ---
  const yearlySummary = useMemo(() => {
    const yearExits = paperExits.filter((e) => new Date(e.created_at).getFullYear() === selectedYear)
    const firms = new Set(yearExits.map((e) => e.musteri_id))
    return {
      exitCount: yearExits.length,
      totalTabaka: yearExits.reduce((s, e) => s + (e.tabaka || 0), 0),
      totalKg: yearExits.reduce((s, e) => s + Number(e.kg || 0), 0),
      firmCount: firms.size,
    }
  }, [paperExits, selectedYear])

  // --- Monthly stats ---
  const monthlyStats = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const monthExits = paperExits.filter((e) => {
        const d = new Date(e.created_at)
        return d.getFullYear() === selectedYear && d.getMonth() === monthIdx
      })
      const firms = new Set(monthExits.map((e) => e.musteri_id))
      return {
        month: monthIdx,
        exitCount: monthExits.length,
        totalTabaka: monthExits.reduce((s, e) => s + (e.tabaka || 0), 0),
        totalKg: monthExits.reduce((s, e) => s + Number(e.kg || 0), 0),
        firmCount: firms.size,
        isCurrent: selectedYear === currentYear && monthIdx === currentMonth,
      }
    })
  }, [paperExits, selectedYear, currentYear, currentMonth])

  // --- Top 10 firms by KG (yearly) ---
  const yearlyTop10 = useMemo(() => {
    const yearExits = paperExits.filter((e) => new Date(e.created_at).getFullYear() === top10Year)
    const map = {}
    yearExits.forEach((e) => {
      const id = e.musteri_id
      if (!map[id]) map[id] = { id, company_name: e.musteri?.company_name || '-', exitCount: 0, totalTabaka: 0, totalKg: 0 }
      map[id].exitCount++
      map[id].totalTabaka += e.tabaka || 0
      map[id].totalKg += Number(e.kg || 0)
    })
    return Object.values(map).sort((a, b) => b.totalKg - a.totalKg).slice(0, 10)
  }, [paperExits, top10Year])

  // --- Top 10 firms by KG (monthly) ---
  const monthlyTop10 = useMemo(() => {
    const monthExits = paperExits.filter((e) => {
      const d = new Date(e.created_at)
      return d.getFullYear() === top10Year && d.getMonth() === top10Month
    })
    const map = {}
    monthExits.forEach((e) => {
      const id = e.musteri_id
      if (!map[id]) map[id] = { id, company_name: e.musteri?.company_name || '-', exitCount: 0, totalTabaka: 0, totalKg: 0 }
      map[id].exitCount++
      map[id].totalTabaka += e.tabaka || 0
      map[id].totalKg += Number(e.kg || 0)
    })
    return Object.values(map).sort((a, b) => b.totalKg - a.totalKg).slice(0, 10)
  }, [paperExits, top10Year, top10Month])

  // --- Month customers ---
  const monthCustomers = useMemo(() => {
    if (selectedMonth == null) return []
    const monthExits = paperExits.filter((e) => {
      const d = new Date(e.created_at)
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
    })
    const map = {}
    monthExits.forEach((e) => {
      const id = e.musteri_id
      if (!map[id]) map[id] = { id, company_name: e.musteri?.company_name || '-', exitCount: 0, totalTabaka: 0, totalKg: 0 }
      map[id].exitCount++
      map[id].totalTabaka += e.tabaka || 0
      map[id].totalKg += Number(e.kg || 0)
    })
    return Object.values(map).sort((a, b) => b.totalKg - a.totalKg)
  }, [paperExits, selectedMonth, selectedYear])

  // --- Firm detail ---
  const firmDetail = useMemo(() => {
    if (!selectedCid) return []
    let exits = paperExits.filter((e) => e.musteri_id === selectedCid)
    if (selectedMonth != null) {
      exits = exits.filter((e) => {
        const d = new Date(e.created_at)
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
      })
    }
    return exits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [paperExits, selectedCid, selectedMonth, selectedYear])

  const firmName = useMemo(() => {
    if (!selectedCid) return '-'
    const exit = paperExits.find((e) => e.musteri_id === selectedCid)
    return exit?.musteri?.company_name || '-'
  }, [paperExits, selectedCid])

  // --- Navigation ---
  const goToMonth = (monthIdx) => setSearchParams({ m: String(monthIdx) })
  const goToCustomer = (customer) => setSearchParams({ m: String(selectedMonth), cid: customer.id })
  const goBackToMonths = () => setSearchParams({})
  const goBackToCustomers = () => setSearchParams({ m: String(selectedMonth) })

  const handleYearChange = (direction) => {
    const idx = availableYears.indexOf(selectedYear)
    const nextIdx = idx + direction
    if (nextIdx >= 0 && nextIdx < availableYears.length) {
      setSelectedYear(availableYears[nextIdx])
      setSearchParams({})
    }
  }

  // ===================== RENDER =====================

  const renderBreadcrumb = () => {
    if (drillLevel === 1) return null
    return (
      <nav className="mb-4 flex items-center gap-1.5 text-sm">
        <button type="button" onClick={goBackToMonths} className="font-medium text-slate-500 transition hover:text-slate-900">{selectedYear}</button>
        {selectedMonth != null && (
          <>
            <span className="text-slate-300">/</span>
            {drillLevel === 2 ? (
              <span className="font-semibold text-slate-900">{monthNames[selectedMonth]}</span>
            ) : (
              <button type="button" onClick={goBackToCustomers} className="font-medium text-slate-500 transition hover:text-slate-900">{monthNames[selectedMonth]}</button>
            )}
          </>
        )}
        {selectedCid && drillLevel === 3 && (
          <>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{firmName}</span>
          </>
        )}
      </nav>
    )
  }

  const renderYearSelector = () => {
    const canPrev = availableYears.indexOf(selectedYear) > 0
    const canNext = availableYears.indexOf(selectedYear) < availableYears.length - 1
    return (
      <div className="mb-5 flex items-center justify-center gap-3">
        <button type="button" onClick={() => handleYearChange(-1)} disabled={!canPrev}
          className={`rounded-lg p-2 transition ${canPrev ? 'text-slate-600 hover:bg-slate-100' : 'cursor-default text-slate-200'}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <span className="min-w-[4rem] text-center text-lg font-bold text-slate-900">{selectedYear}</span>
        <button type="button" onClick={() => handleYearChange(1)} disabled={!canNext}
          className={`rounded-lg p-2 transition ${canNext ? 'text-slate-600 hover:bg-slate-100' : 'cursor-default text-slate-200'}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>
    )
  }

  const renderSummaryCards = () => {
    const s = yearlySummary
    const items = [
      { label: isEN ? 'Total Exits' : 'Toplam Çıkış', value: formatNumber(s.exitCount), color: 'text-slate-900' },
      { label: isEN ? 'Total Sheets' : 'Toplam Tabaka', value: formatNumber(s.totalTabaka), color: 'text-blue-600' },
      { label: isEN ? 'Total KG' : 'Toplam KG', value: formatNumber(Math.round(s.totalKg)), color: 'text-emerald-600' },
      { label: isEN ? 'Companies' : 'Firma Sayısı', value: formatNumber(s.firmCount), color: 'text-purple-600' },
    ]
    return (
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white px-3 py-3 text-center shadow-sm">
            <p className={`text-lg font-bold tabular-nums ${item.color}`}>{item.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>
    )
  }

  const renderTop10 = (title, data) => (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      {data.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">{isEN ? 'No data' : 'Veri yok'}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 w-10">#</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Company' : 'Firma'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Sheets' : 'Tabaka'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">KG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((c, i) => (
                <tr key={c.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{c.company_name || '-'}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{formatNumber(c.totalTabaka)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-slate-900">{formatNumber(Math.round(c.totalKg))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // --- Level 1: Months table + top 10 ---
  const renderMonthsTable = () => (
    <>
      {renderYearSelector()}
      {renderSummaryCards()}

      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Month' : 'Ay'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Exits' : 'Çıkış'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Sheets' : 'Tabaka'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">KG</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Companies' : 'Firma'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {monthlyStats.map((stat) => {
              const hasData = stat.exitCount > 0
              return (
                <tr
                  key={stat.month}
                  onClick={() => hasData && goToMonth(stat.month)}
                  className={`transition ${hasData ? 'cursor-pointer hover:bg-slate-50' : 'opacity-40'} ${stat.isCurrent ? 'bg-slate-900/[0.03] font-medium' : ''}`}
                >
                  <td className={`px-4 py-3 font-semibold ${stat.isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                    {monthNames[stat.month]}
                    {stat.isCurrent && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(stat.exitCount)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-blue-600">{formatNumber(stat.totalTabaka)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-emerald-600">{formatNumber(Math.round(stat.totalKg))}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-purple-600">{formatNumber(stat.firmCount)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700">{isEN ? 'Total' : 'Toplam'}</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatNumber(yearlySummary.exitCount)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-blue-600">{formatNumber(yearlySummary.totalTabaka)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-600">{formatNumber(Math.round(yearlySummary.totalKg))}</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-purple-600">{formatNumber(yearlySummary.firmCount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Top 10 selectors */}
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <span className="text-sm font-semibold text-slate-700">Top 10</span>
        <select value={top10Year} onChange={(e) => setTop10Year(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
          {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={top10Month} onChange={(e) => setTop10Month(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
          {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {renderTop10(
          isEN ? `${top10Year} — Top 10 by KG` : `${top10Year} — En Çok Çıkış Yapan 10 Firma`,
          yearlyTop10
        )}
        {renderTop10(
          isEN ? `${monthNames[top10Month]} ${top10Year} — Top 10 by KG` : `${monthNames[top10Month]} ${top10Year} — En Çok Çıkış Yapan 10 Firma`,
          monthlyTop10
        )}
      </div>
    </>
  )

  // --- Level 2: Customer table ---
  const renderCustomerTable = () => {
    if (monthCustomers.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-slate-500">{isEN ? 'No paper exits this month' : 'Bu ayda kağıt çıkışı yok'}</p>
        </div>
      )
    }
    const totals = monthCustomers.reduce(
      (acc, c) => ({ exitCount: acc.exitCount + c.exitCount, totalTabaka: acc.totalTabaka + c.totalTabaka, totalKg: acc.totalKg + c.totalKg }),
      { exitCount: 0, totalTabaka: 0, totalKg: 0 }
    )
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ minWidth: 550 }}>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Company' : 'Firma'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Exits' : 'Çıkış'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Sheets' : 'Tabaka'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">KG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthCustomers.map((c) => (
                <tr key={c.id} onClick={() => goToCustomer(c)} className="cursor-pointer transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.company_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(c.exitCount)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-blue-600">{formatNumber(c.totalTabaka)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-emerald-600">{formatNumber(Math.round(c.totalKg))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700">{isEN ? 'Total' : 'Toplam'}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatNumber(totals.exitCount)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-blue-600">{formatNumber(totals.totalTabaka)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-600">{formatNumber(Math.round(totals.totalKg))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  // --- Level 3: Firm detail ---
  const renderFirmDetail = () => {
    if (firmDetail.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-slate-500">{isEN ? 'No paper exits' : 'Kağıt çıkışı yok'}</p>
        </div>
      )
    }
    const totals = firmDetail.reduce(
      (acc, e) => ({ tabaka: acc.tabaka + (e.tabaka || 0), kg: acc.kg + Number(e.kg || 0) }),
      { tabaka: 0, kg: 0 }
    )
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ minWidth: 650 }}>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Date' : 'Tarih'}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Paper' : 'Kağıt'}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Size' : 'Ebat'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Sheets' : 'Tabaka'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">KG</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Order' : 'İş Emri'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {firmDetail.map((e) => (
                <tr key={e.id} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {new Date(e.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-slate-900">{e.paper_type_name} {e.grammage}gr</td>
                  <td className="px-4 py-3 text-slate-600">{e.en}x{e.boy}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-blue-600">{formatNumber(e.tabaka)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-emerald-600">{formatNumber(Math.round(Number(e.kg)))}</td>
                  <td className="px-4 py-3 text-slate-500">{e.is_emri_no || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700" colSpan={3}>{isEN ? 'Total' : 'Toplam'}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-blue-600">{formatNumber(totals.tabaka)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-600">{formatNumber(Math.round(totals.kg))}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{isEN ? 'Paper Exit Reports' : 'Kağıt Çıkışı Raporları'}</h1>
          <p className="mt-1 text-sm text-slate-500">{isEN ? 'Monthly paper exit reports by sheets and weight' : 'Aylık kağıt çıkışı tabaka ve kilogram raporları'}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : (
          <div>
            {renderBreadcrumb()}
            {drillLevel === 1 && renderMonthsTable()}
            {drillLevel === 2 && renderCustomerTable()}
            {drillLevel === 3 && renderFirmDetail()}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
