import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber, formatPrice } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import JobsTable from '../../components/dashboard/JobsTable'

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function ReportsPage() {
  const { isEN } = useLanguage()
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [detailTab, setDetailTab] = useState('month')
  const [detailPage, setDetailPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchPage, setSearchPage] = useState(1)
  const [top10Year, setTop10Year] = useState(new Date().getFullYear())
  const [top10Month, setTop10Month] = useState(new Date().getMonth())
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state: { label, filterFn } veya null
  const [jobsModal, setJobsModal] = useState(null)
  const [modalPage, setModalPage] = useState(1)

  // Derive drill state from URL
  const activeTab = searchParams.get('tab') || 'monthly'
  const selectedMonth = searchParams.has('m') ? Number(searchParams.get('m')) : null
  const selectedCid = searchParams.get('cid') || null
  const drillLevel = activeTab === 'monthly' ? (selectedCid ? 3 : selectedMonth != null ? 2 : 1) : 1

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*, job_steps(*), musteri:profiles!jobs_musteri_id_fkey(full_name, company_name)')
          .order('created_at', { ascending: false })
        if (!error) setJobs(data || [])
      } catch (err) {
        console.error('Jobs fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const availableYears = useMemo(() => {
    const years = new Set(jobs.map((j) => new Date(j.created_at).getFullYear()))
    years.add(currentYear)
    return [...years].sort((a, b) => a - b)
  }, [jobs, currentYear])

  // --- Yearly summary ---
  const yearlySummary = useMemo(() => {
    const yearJobs = jobs.filter((j) => new Date(j.created_at).getFullYear() === selectedYear)
    const completed = yearJobs.filter((j) => j.durum === 'tamamlandi').length
    const customerIds = new Set(yearJobs.map((j) => j.musteri_id))
    return {
      total: yearJobs.length,
      completed,
      ongoing: yearJobs.length - completed,
      revenue: yearJobs.reduce((sum, j) => sum + (j.fiyat || 0), 0),
      kalipAdedi: yearJobs.reduce((sum, j) => sum + (j.kalip_adedi || 0), 0),
      customerCount: customerIds.size,
      completionRate: yearJobs.length > 0 ? Math.round((completed / yearJobs.length) * 100) : 0,
    }
  }, [jobs, selectedYear])

  // --- Monthly stats ---
  const monthlyStats = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const monthJobs = jobs.filter((j) => {
        const d = new Date(j.created_at)
        return d.getFullYear() === selectedYear && d.getMonth() === monthIdx
      })
      const completed = monthJobs.filter((j) => j.durum === 'tamamlandi').length
      const customerIds = new Set(monthJobs.map((j) => j.musteri_id))
      return {
        month: monthIdx,
        total: monthJobs.length,
        completed,
        ongoing: monthJobs.length - completed,
        revenue: monthJobs.reduce((sum, j) => sum + (j.fiyat || 0), 0),
        kalipAdedi: monthJobs.reduce((sum, j) => sum + (j.kalip_adedi || 0), 0),
        customerCount: customerIds.size,
        completionRate: monthJobs.length > 0 ? Math.round((completed / monthJobs.length) * 100) : 0,
        isCurrent: selectedYear === currentYear && monthIdx === currentMonth,
      }
    })
  }, [jobs, selectedYear, currentYear, currentMonth])

  // --- Top 10 customers by revenue (year) ---
  const yearlyTop10 = useMemo(() => {
    const yearJobs = jobs.filter((j) => new Date(j.created_at).getFullYear() === top10Year)
    const map = {}
    yearJobs.forEach((j) => {
      const id = j.musteri_id
      if (!map[id]) {
        map[id] = { id, full_name: j.musteri?.full_name || '-', company_name: j.musteri?.company_name || '', jobCount: 0, revenue: 0 }
      }
      map[id].jobCount++
      map[id].revenue += j.fiyat || 0
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }, [jobs, top10Year])

  // --- Top 10 customers by revenue (selected month) ---
  const monthlyTop10 = useMemo(() => {
    const monthJobs = jobs.filter((j) => {
      const d = new Date(j.created_at)
      return d.getFullYear() === top10Year && d.getMonth() === top10Month
    })
    const map = {}
    monthJobs.forEach((j) => {
      const id = j.musteri_id
      if (!map[id]) {
        map[id] = { id, full_name: j.musteri?.full_name || '-', company_name: j.musteri?.company_name || '', jobCount: 0, revenue: 0 }
      }
      map[id].jobCount++
      map[id].revenue += j.fiyat || 0
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }, [jobs, top10Year, top10Month])

  // --- Customer from URL ---
  const customerFromUrl = useMemo(() => {
    if (!selectedCid) return null
    const job = jobs.find((j) => j.musteri_id === selectedCid)
    if (!job) return null
    return { id: selectedCid, full_name: job.musteri?.full_name || '-', company_name: job.musteri?.company_name || '' }
  }, [jobs, selectedCid])

  const selectedCustomer = activeTab === 'monthly' ? customerFromUrl : null
  const searchCustomer = activeTab === 'search' ? customerFromUrl : null

  // --- Customers for selected month ---
  const monthCustomers = useMemo(() => {
    if (selectedMonth == null) return []
    const monthJobs = jobs.filter((j) => {
      const d = new Date(j.created_at)
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
    })
    const map = {}
    monthJobs.forEach((j) => {
      const id = j.musteri_id
      if (!map[id]) {
        map[id] = { id, full_name: j.musteri?.full_name || '-', company_name: j.musteri?.company_name || '', jobCount: 0, completed: 0, ongoing: 0, totalAmount: 0 }
      }
      map[id].jobCount++
      if (j.durum === 'tamamlandi') map[id].completed++
      else map[id].ongoing++
      map[id].totalAmount += j.fiyat || 0
    })
    Object.values(map).forEach((c) => {
      c.hasOngoingFromOtherMonths = jobs.some(
        (j) => j.musteri_id === c.id && j.durum !== 'tamamlandi' &&
          (() => { const d = new Date(j.created_at); return !(d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) })()
      )
    })
    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount)
  }, [jobs, selectedMonth, selectedYear])

  const monthCustomersTotals = useMemo(() => {
    return monthCustomers.reduce(
      (acc, c) => ({ jobCount: acc.jobCount + c.jobCount, completed: acc.completed + c.completed, ongoing: acc.ongoing + c.ongoing, totalAmount: acc.totalAmount + c.totalAmount }),
      { jobCount: 0, completed: 0, ongoing: 0, totalAmount: 0 }
    )
  }, [monthCustomers])

  // --- Customer detail ---
  const customerDetailJobs = useMemo(() => {
    if (!selectedCustomer) return { monthJobs: [], allJobs: [] }
    const allJobs = jobs.filter((j) => j.musteri_id === selectedCustomer.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const monthJobs = selectedMonth != null
      ? allJobs.filter((j) => { const d = new Date(j.created_at); return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth })
      : []
    return { monthJobs, allJobs }
  }, [jobs, selectedCustomer, selectedMonth, selectedYear])

  // --- Search ---
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const map = {}
    jobs.forEach((j) => {
      const id = j.musteri_id
      const name = j.musteri?.full_name || ''
      const company = j.musteri?.company_name || ''
      if (!name.toLowerCase().includes(q) && !company.toLowerCase().includes(q)) return
      if (!map[id]) { map[id] = { id, full_name: name, company_name: company, jobCount: 0 } }
      map[id].jobCount++
    })
    return Object.values(map).sort((a, b) => b.jobCount - a.jobCount)
  }, [jobs, searchQuery])

  const searchCustomerJobs = useMemo(() => {
    if (!searchCustomer) return []
    return jobs.filter((j) => j.musteri_id === searchCustomer.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [jobs, searchCustomer])

  // --- Navigation (URL-based for browser back support) ---
  const goToMonth = (monthIdx) => {
    setSearchParams({ m: String(monthIdx) })
    setDetailTab('month'); setDetailPage(1)
  }
  const goToCustomer = (customer) => {
    setSearchParams({ m: String(selectedMonth), cid: customer.id })
    setDetailTab('month'); setDetailPage(1)
  }
  const goBackToMonths = () => { setSearchParams({}) }
  const goBackToCustomers = () => { setSearchParams({ m: String(selectedMonth) }) }

  const handleTabChange = (tab) => {
    if (tab === 'monthly') { setSearchParams({}); setSearchQuery('') }
    else { setSearchParams({ tab: 'search' }) }
  }

  const handleYearChange = (direction) => {
    const idx = availableYears.indexOf(selectedYear)
    const nextIdx = idx + direction
    if (nextIdx >= 0 && nextIdx < availableYears.length) {
      setSelectedYear(availableYears[nextIdx])
      setSearchParams({})
    }
  }

  const monthNames = isEN ? MONTHS_EN : MONTHS_TR

  const openJobsModal = (label, filterFn) => {
    setJobsModal({ label, filterFn })
    setModalPage(1)
  }

  // --- Top 10 table renderer ---
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
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Jobs' : 'İş'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Revenue' : 'Kazanç'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((c, i) => (
                <tr key={c.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{c.company_name || '-'}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{formatNumber(c.jobCount)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-slate-900">{formatPrice(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // --- Breadcrumb ---
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
        {selectedCustomer && drillLevel === 3 && (
          <>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{selectedCustomer.company_name || '-'}</span>
          </>
        )}
      </nav>
    )
  }

  // --- Year selector ---
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

  // --- Yearly summary ---
  const renderYearlySummary = () => {
    const s = yearlySummary
    const y = selectedYear
    const items = [
      {
        label: isEN ? 'Total Jobs' : 'Toplam İş', value: formatNumber(s.total), color: 'text-slate-900',
        clickable: s.total > 0,
        onClick: () => openJobsModal(
          `${y} — ${isEN ? 'All Jobs' : 'Tüm İşler'}`,
          (j) => new Date(j.created_at).getFullYear() === y
        ),
      },
      {
        label: isEN ? 'Completed' : 'Tamamlanan', value: formatNumber(s.completed), color: 'text-green-600',
        clickable: s.completed > 0,
        onClick: () => openJobsModal(
          `${y} — ${isEN ? 'Completed' : 'Tamamlanan'}`,
          (j) => new Date(j.created_at).getFullYear() === y && j.durum === 'tamamlandi'
        ),
      },
      {
        label: isEN ? 'Ongoing' : 'Devam Eden', value: formatNumber(s.ongoing), color: 'text-amber-600',
        clickable: s.ongoing > 0,
        onClick: () => openJobsModal(
          `${y} — ${isEN ? 'Ongoing' : 'Devam Eden'}`,
          (j) => new Date(j.created_at).getFullYear() === y && j.durum !== 'tamamlandi'
        ),
      },
      { label: isEN ? 'Customers' : 'Müşteri', value: formatNumber(s.customerCount), color: 'text-blue-600' },
      { label: isEN ? 'Completion' : 'Tamamlanma', value: `%${s.completionRate}`, color: 'text-purple-600' },
      { label: isEN ? 'Revenue' : 'Toplam Kazanç', value: formatPrice(s.revenue), color: 'text-slate-900' },
    ]
    return (
      <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={!item.clickable}
            onClick={item.onClick}
            className={`rounded-2xl border border-slate-100 bg-white px-3 py-3 text-center shadow-sm transition ${
              item.clickable ? 'cursor-pointer hover:border-slate-300 hover:shadow-md active:scale-[0.97]' : ''
            }`}
          >
            <p className={`text-lg font-bold tabular-nums ${item.color}`}>{item.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{item.label}</p>
          </button>
        ))}
      </div>
    )
  }

  // --- Level 1: Months table + top 10 ---
  const renderMonthsTable = () => (
    <>
      {renderYearSelector()}
      {renderYearlySummary()}

      {/* Months table */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Month' : 'Ay'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Jobs' : 'İş'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Done' : 'Biten'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Ongoing' : 'Devam'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Clients' : 'Müşteri'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">%</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Mold' : 'Kalıp'}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Revenue' : 'Kazanç'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {monthlyStats.map((stat) => {
              const hasJobs = stat.total > 0
              return (
                <tr
                  key={stat.month}
                  onClick={() => hasJobs && goToMonth(stat.month)}
                  className={`transition ${hasJobs ? 'cursor-pointer hover:bg-slate-50' : 'opacity-40'} ${stat.isCurrent ? 'bg-slate-900/[0.03] font-medium' : ''}`}
                >
                  <td className={`px-4 py-3 font-semibold ${stat.isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                    {monthNames[stat.month]}
                    {stat.isCurrent && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                    {stat.total > 0 ? (
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); openJobsModal(`${monthNames[stat.month]} ${selectedYear} — ${isEN ? 'All Jobs' : 'Tüm İşler'}`, (j) => { const d = new Date(j.created_at); return d.getFullYear() === selectedYear && d.getMonth() === stat.month }) }} className="rounded-lg px-1.5 py-0.5 transition hover:bg-slate-100 hover:underline">{formatNumber(stat.total)}</button>
                    ) : formatNumber(stat.total)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-green-600">
                    {stat.completed > 0 ? (
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); openJobsModal(`${monthNames[stat.month]} ${selectedYear} — ${isEN ? 'Completed' : 'Tamamlanan'}`, (j) => { const d = new Date(j.created_at); return d.getFullYear() === selectedYear && d.getMonth() === stat.month && j.durum === 'tamamlandi' }) }} className="rounded-lg px-1.5 py-0.5 transition hover:bg-green-50 hover:underline">{formatNumber(stat.completed)}</button>
                    ) : formatNumber(stat.completed)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-600">
                    {stat.ongoing > 0 ? (
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); openJobsModal(`${monthNames[stat.month]} ${selectedYear} — ${isEN ? 'Ongoing' : 'Devam Eden'}`, (j) => { const d = new Date(j.created_at); return d.getFullYear() === selectedYear && d.getMonth() === stat.month && j.durum !== 'tamamlandi' }) }} className="rounded-lg px-1.5 py-0.5 transition hover:bg-amber-50 hover:underline">{formatNumber(stat.ongoing)}</button>
                    ) : formatNumber(stat.ongoing)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-blue-600">{formatNumber(stat.customerCount)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-purple-600">{stat.completionRate}%</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(stat.kalipAdedi)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">{formatPrice(stat.revenue)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700">{isEN ? 'Total' : 'Toplam'}</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">
                {yearlySummary.total > 0 ? (
                  <button type="button" onClick={() => openJobsModal(`${selectedYear} — ${isEN ? 'All Jobs' : 'Tüm İşler'}`, (j) => new Date(j.created_at).getFullYear() === selectedYear)} className="rounded-lg px-1.5 py-0.5 transition hover:bg-slate-200 hover:underline">{formatNumber(yearlySummary.total)}</button>
                ) : formatNumber(yearlySummary.total)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-green-600">
                {yearlySummary.completed > 0 ? (
                  <button type="button" onClick={() => openJobsModal(`${selectedYear} — ${isEN ? 'Completed' : 'Tamamlanan'}`, (j) => new Date(j.created_at).getFullYear() === selectedYear && j.durum === 'tamamlandi')} className="rounded-lg px-1.5 py-0.5 transition hover:bg-green-100 hover:underline">{formatNumber(yearlySummary.completed)}</button>
                ) : formatNumber(yearlySummary.completed)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-amber-600">
                {yearlySummary.ongoing > 0 ? (
                  <button type="button" onClick={() => openJobsModal(`${selectedYear} — ${isEN ? 'Ongoing' : 'Devam Eden'}`, (j) => new Date(j.created_at).getFullYear() === selectedYear && j.durum !== 'tamamlandi')} className="rounded-lg px-1.5 py-0.5 transition hover:bg-amber-100 hover:underline">{formatNumber(yearlySummary.ongoing)}</button>
                ) : formatNumber(yearlySummary.ongoing)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-blue-600">{formatNumber(yearlySummary.customerCount)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-purple-600">{yearlySummary.completionRate}%</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-700">{formatNumber(yearlySummary.kalipAdedi)}</td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatPrice(yearlySummary.revenue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Top 10 — year/month selectors */}
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

      {/* Top 10 tables */}
      <div className="grid gap-8 lg:grid-cols-2">
        {renderTop10(
          isEN ? `${top10Year} — Top 10 Companies` : `${top10Year} — En Çok Kazandıran 10 Firma`,
          yearlyTop10
        )}
        {renderTop10(
          isEN ? `${monthNames[top10Month]} ${top10Year} — Top 10 Companies` : `${monthNames[top10Month]} ${top10Year} — En Çok Kazandıran 10 Firma`,
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
          <p className="text-sm text-slate-500">{isEN ? 'No customers this month' : 'Bu ayda müşteri yok'}</p>
        </div>
      )
    }
    const totals = monthCustomersTotals
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ minWidth: 650 }}>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Company' : 'Firma'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Jobs' : 'İş Sayısı'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Done' : 'Tamamlanan'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Ongoing' : 'Devam Eden'}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Amount' : 'Toplam Tutar'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthCustomers.map((c) => (
                <tr key={c.id} onClick={() => goToCustomer(c)} className="cursor-pointer transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <span className="flex items-center gap-1.5">
                      {c.company_name || '-'}
                      {c.hasOngoingFromOtherMonths && <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" title={isEN ? 'Has ongoing jobs from other months' : 'Başka aylarda devam eden işi var'} />}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(c.jobCount)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-green-600">{formatNumber(c.completed)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-600">{formatNumber(c.ongoing)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-700">{formatPrice(c.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700">{isEN ? 'Total' : 'Toplam'}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatNumber(totals.jobCount)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-green-600">{formatNumber(totals.completed)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-amber-600">{formatNumber(totals.ongoing)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatPrice(totals.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  // --- Level 3: Customer detail with tabs ---
  const renderCustomerDetail = () => {
    const { monthJobs, allJobs } = customerDetailJobs
    const hasMonthJobs = selectedMonth != null && monthJobs.length > 0
    const activeJobs = hasMonthJobs && detailTab === 'month' ? monthJobs : allJobs

    return (
      <div>
        {hasMonthJobs && (
          <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => { setDetailTab('month'); setDetailPage(1) }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${detailTab === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {monthNames[selectedMonth]}
              <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{monthJobs.length}</span>
            </button>
            <button type="button" onClick={() => { setDetailTab('all'); setDetailPage(1) }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${detailTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {isEN ? 'All Jobs' : 'Tüm İşler'}
              <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{allJobs.length}</span>
            </button>
          </div>
        )}
        <JobsTable
          jobs={activeJobs}
          page={detailPage}
          onPageChange={setDetailPage}
          showCustomer={false}
          showPrice
          onJobClick={(id) => navigate(`/panel/is/${id}`)}
        />
      </div>
    )
  }

  // --- Search tab ---
  const renderSearchTab = () => {
    if (searchCustomer) {
      return (
        <div>
          <nav className="mb-4 flex items-center gap-1.5 text-sm">
            <button type="button" onClick={() => { setSearchParams({ tab: 'search' }); setSearchPage(1) }} className="font-medium text-slate-500 transition hover:text-slate-900">{isEN ? 'Search' : 'Arama'}</button>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{searchCustomer.company_name || '-'}</span>
          </nav>
          <JobsTable
            jobs={searchCustomerJobs}
            page={searchPage}
            onPageChange={setSearchPage}
            showCustomer={false}
            showPrice
            onJobClick={(id) => navigate(`/panel/is/${id}`)}
          />
        </div>
      )
    }
    return (
      <div>
        <input type="text" placeholder={isEN ? 'Search customer name or company...' : 'Müşteri adı veya firma ara...'}
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">{isEN ? 'No customers found' : 'Müşteri bulunamadı'}</p>
          </div>
        )}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((c) => (
              <button key={c.id} type="button" onClick={() => { setSearchParams({ tab: 'search', cid: c.id }); setSearchPage(1) }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-200 hover:shadow-md">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{c.company_name || '-'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{c.jobCount} {isEN ? 'jobs' : 'iş'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{isEN ? 'Reports' : 'Raporlar'}</h1>
          <p className="mt-1 text-sm text-slate-500">{isEN ? 'Monthly job and revenue reports' : 'Aylık iş ve kazanç raporları'}</p>
        </div>

        <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => handleTabChange('monthly')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {isEN ? 'Monthly Report' : 'Aylık Rapor'}
          </button>
          <button type="button" onClick={() => handleTabChange('search')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === 'search' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {isEN ? 'Search Customer' : 'Müşteri Ara'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : activeTab === 'monthly' ? (
          <div>
            {renderBreadcrumb()}
            {drillLevel === 1 && renderMonthsTable()}
            {drillLevel === 2 && renderCustomerTable()}
            {drillLevel === 3 && renderCustomerDetail()}
          </div>
        ) : (
          renderSearchTab()
        )}
      </div>

      {/* İş Listesi Modalı */}
      {jobsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setJobsModal(null)}>
          <div className="flex max-h-[85vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl" onClick={(ev) => ev.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{jobsModal.label}</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatNumber(jobs.filter(jobsModal.filterFn).length)} {isEN ? 'jobs' : 'iş'}
                </p>
              </div>
              <button type="button" onClick={() => setJobsModal(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Tablo */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <JobsTable
                jobs={jobs.filter(jobsModal.filterFn)}
                page={modalPage}
                onPageChange={setModalPage}
                showCustomer
                showPrice
                onJobClick={(id) => { setJobsModal(null); navigate(`/panel/is/${id}`) }}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
