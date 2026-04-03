import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber, formatPrice } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StatusBadge from '../../components/dashboard/StatusBadge'

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function ReportsPage() {
  const { isEN } = useLanguage()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('monthly')
  const [drillLevel, setDrillLevel] = useState(1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [detailTab, setDetailTab] = useState('month') // 'month' | 'all'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCustomer, setSearchCustomer] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

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

  // Available years from job data
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
      customerCount: customerIds.size,
      completionRate: yearJobs.length > 0 ? Math.round((completed / yearJobs.length) * 100) : 0,
    }
  }, [jobs, selectedYear])

  // --- Monthly stats: 12 months for selected year ---
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
        customerCount: customerIds.size,
        completionRate: monthJobs.length > 0 ? Math.round((completed / monthJobs.length) * 100) : 0,
        isCurrent: selectedYear === currentYear && monthIdx === currentMonth,
      }
    })
  }, [jobs, selectedYear, currentYear, currentMonth])

  // --- Customers for selected month ---
  const monthCustomers = useMemo(() => {
    if (selectedMonth == null) return []

    const monthJobs = jobs.filter((j) => {
      const d = new Date(j.created_at)
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
    })

    const customerMap = {}
    monthJobs.forEach((j) => {
      const id = j.musteri_id
      if (!customerMap[id]) {
        customerMap[id] = {
          id,
          full_name: j.musteri?.full_name || '-',
          company_name: j.musteri?.company_name || '',
          jobCount: 0,
          completed: 0,
          ongoing: 0,
          totalAmount: 0,
        }
      }
      customerMap[id].jobCount++
      if (j.durum === 'tamamlandi') customerMap[id].completed++
      else customerMap[id].ongoing++
      customerMap[id].totalAmount += j.fiyat || 0
    })

    // Check if customer has ongoing jobs from other months
    Object.values(customerMap).forEach((c) => {
      c.hasOngoingFromOtherMonths = jobs.some(
        (j) =>
          j.musteri_id === c.id &&
          j.durum !== 'tamamlandi' &&
          (() => {
            const d = new Date(j.created_at)
            return !(d.getFullYear() === selectedYear && d.getMonth() === selectedMonth)
          })()
      )
    })

    return Object.values(customerMap).sort((a, b) => b.totalAmount - a.totalAmount)
  }, [jobs, selectedMonth, selectedYear])

  // --- Month customers totals (for footer) ---
  const monthCustomersTotals = useMemo(() => {
    return monthCustomers.reduce(
      (acc, c) => ({
        jobCount: acc.jobCount + c.jobCount,
        completed: acc.completed + c.completed,
        ongoing: acc.ongoing + c.ongoing,
        totalAmount: acc.totalAmount + c.totalAmount,
      }),
      { jobCount: 0, completed: 0, ongoing: 0, totalAmount: 0 }
    )
  }, [monthCustomers])

  // --- Customer detail: month jobs + all jobs ---
  const customerDetailJobs = useMemo(() => {
    if (!selectedCustomer) return { monthJobs: [], allJobs: [] }

    const allJobs = jobs
      .filter((j) => j.musteri_id === selectedCustomer.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const monthJobs =
      selectedMonth != null
        ? allJobs.filter((j) => {
            const d = new Date(j.created_at)
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth
          })
        : []

    return { monthJobs, allJobs }
  }, [jobs, selectedCustomer, selectedMonth, selectedYear])

  // --- Search results ---
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const q = searchQuery.toLowerCase()
    const customerMap = {}

    jobs.forEach((j) => {
      const id = j.musteri_id
      const name = j.musteri?.full_name || ''
      const company = j.musteri?.company_name || ''

      if (!name.toLowerCase().includes(q) && !company.toLowerCase().includes(q)) return

      if (!customerMap[id]) {
        customerMap[id] = { id, full_name: name, company_name: company, jobCount: 0 }
      }
      customerMap[id].jobCount++
    })

    return Object.values(customerMap).sort((a, b) => b.jobCount - a.jobCount)
  }, [jobs, searchQuery])

  // --- Search customer jobs ---
  const searchCustomerJobs = useMemo(() => {
    if (!searchCustomer) return []
    return jobs
      .filter((j) => j.musteri_id === searchCustomer.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [jobs, searchCustomer])

  // --- Navigation helpers ---
  const goToMonth = (monthIdx) => {
    setSelectedMonth(monthIdx)
    setSelectedCustomer(null)
    setDetailTab('month')
    setDrillLevel(2)
  }

  const goToCustomer = (customer) => {
    setSelectedCustomer(customer)
    setDetailTab('month')
    setDrillLevel(3)
  }

  const goBackToMonths = () => {
    setDrillLevel(1)
    setSelectedMonth(null)
    setSelectedCustomer(null)
  }

  const goBackToCustomers = () => {
    setDrillLevel(2)
    setSelectedCustomer(null)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'monthly') {
      setSearchQuery('')
      setSearchCustomer(null)
    } else {
      setDrillLevel(1)
      setSelectedMonth(null)
      setSelectedCustomer(null)
    }
  }

  const handleYearChange = (direction) => {
    const idx = availableYears.indexOf(selectedYear)
    const nextIdx = idx + direction
    if (nextIdx >= 0 && nextIdx < availableYears.length) {
      setSelectedYear(availableYears[nextIdx])
      setDrillLevel(1)
      setSelectedMonth(null)
      setSelectedCustomer(null)
    }
  }

  // --- Reusable job table ---
  const renderJobsTable = (jobList) => {
    if (jobList.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-100 bg-white py-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">{isEN ? 'No jobs found' : 'İş bulunamadı'}</p>
        </div>
      )
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[25%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Job No' : 'İş Emri No'}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Job Name' : 'İş Adı'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Qty' : 'Adet'}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Delivery' : 'Teslim'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Price' : 'Fiyat'}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Status' : 'Durum'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobList.map((job) => {
                const teslim = job.teslim_tarihi
                  ? new Date(job.teslim_tarihi).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : '-'
                return (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/panel/is/${job.id}`)}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                        {job.is_emri_no}
                      </span>
                    </td>
                    <td className="truncate px-4 py-3 font-medium text-slate-900">{job.is_adi}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(job.adet)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{teslim}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-medium text-slate-700">
                      {job.fiyat != null ? formatPrice(job.fiyat) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge durum={job.durum} isEN={isEN} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // --- Breadcrumb ---
  const renderBreadcrumb = () => {
    if (drillLevel === 1) return null
    const monthNames = isEN ? MONTHS_EN : MONTHS_TR

    return (
      <nav className="mb-4 flex items-center gap-1.5 text-sm">
        <button type="button" onClick={goBackToMonths} className="font-medium text-slate-500 transition hover:text-slate-900">
          {selectedYear}
        </button>
        {selectedMonth != null && (
          <>
            <span className="text-slate-300">/</span>
            {drillLevel === 2 ? (
              <span className="font-semibold text-slate-900">{monthNames[selectedMonth]}</span>
            ) : (
              <button type="button" onClick={goBackToCustomers} className="font-medium text-slate-500 transition hover:text-slate-900">
                {monthNames[selectedMonth]}
              </button>
            )}
          </>
        )}
        {selectedCustomer && drillLevel === 3 && (
          <>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{selectedCustomer.full_name}</span>
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
        <button
          type="button"
          onClick={() => handleYearChange(-1)}
          disabled={!canPrev}
          className={`rounded-lg p-2 transition ${canPrev ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'cursor-default text-slate-200'}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="min-w-[4rem] text-center text-lg font-bold text-slate-900">{selectedYear}</span>
        <button
          type="button"
          onClick={() => handleYearChange(1)}
          disabled={!canNext}
          className={`rounded-lg p-2 transition ${canNext ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'cursor-default text-slate-200'}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    )
  }

  // --- Yearly summary card ---
  const renderYearlySummary = () => {
    const s = yearlySummary
    const items = [
      { label: isEN ? 'Total Jobs' : 'Toplam İş', value: formatNumber(s.total), color: 'text-slate-900' },
      { label: isEN ? 'Completed' : 'Tamamlanan', value: formatNumber(s.completed), color: 'text-green-600' },
      { label: isEN ? 'Ongoing' : 'Devam Eden', value: formatNumber(s.ongoing), color: 'text-amber-600' },
      { label: isEN ? 'Customers' : 'Müşteri', value: formatNumber(s.customerCount), color: 'text-blue-600' },
      { label: isEN ? 'Completion' : 'Tamamlanma', value: `%${s.completionRate}`, color: 'text-purple-600' },
      { label: isEN ? 'Revenue' : 'Toplam Kazanç', value: formatPrice(s.revenue), color: 'text-slate-900' },
    ]

    return (
      <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white px-3 py-3 text-center shadow-sm">
            <p className={`text-lg font-bold tabular-nums ${item.color}`}>{item.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>
    )
  }

  // --- Render Level 1: Month cards ---
  const renderMonthCards = () => {
    const monthNames = isEN ? MONTHS_EN : MONTHS_TR

    return (
      <>
        {renderYearSelector()}
        {renderYearlySummary()}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {monthlyStats.map((stat) => {
            const hasJobs = stat.total > 0
            return (
              <button
                key={stat.month}
                type="button"
                onClick={() => hasJobs && goToMonth(stat.month)}
                disabled={!hasJobs}
                className={`rounded-2xl p-4 text-left transition ${
                  stat.isCurrent
                    ? hasJobs
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800'
                      : 'bg-slate-900 text-white opacity-50'
                    : hasJobs
                      ? 'border border-slate-100 bg-white shadow-sm hover:border-slate-200 hover:shadow-md'
                      : 'border border-slate-100 bg-white opacity-50 cursor-default'
                }`}
              >
                {/* Month name + completion rate */}
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${stat.isCurrent ? 'text-white' : 'text-slate-900'}`}>
                    {monthNames[stat.month]}
                  </p>
                  {hasJobs && (
                    <span className={`text-xs font-bold ${stat.isCurrent ? 'text-slate-400' : 'text-slate-400'}`}>
                      %{stat.completionRate}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  <div>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${stat.isCurrent ? 'text-slate-400' : 'text-slate-400'}`}>
                      {isEN ? 'Total' : 'Toplam'}
                    </p>
                    <p className={`text-lg font-bold ${stat.isCurrent ? 'text-white' : 'text-slate-900'}`}>
                      {formatNumber(stat.total)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${stat.isCurrent ? 'text-green-300' : 'text-green-600'}`}>
                      {isEN ? 'Done' : 'Biten'}
                    </p>
                    <p className={`text-lg font-bold ${stat.isCurrent ? 'text-green-300' : 'text-green-600'}`}>
                      {formatNumber(stat.completed)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${stat.isCurrent ? 'text-amber-300' : 'text-amber-600'}`}>
                      {isEN ? 'Ongoing' : 'Devam'}
                    </p>
                    <p className={`text-lg font-bold ${stat.isCurrent ? 'text-amber-300' : 'text-amber-600'}`}>
                      {formatNumber(stat.ongoing)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${stat.isCurrent ? 'text-blue-300' : 'text-blue-600'}`}>
                      {isEN ? 'Clients' : 'Müşteri'}
                    </p>
                    <p className={`text-lg font-bold ${stat.isCurrent ? 'text-blue-300' : 'text-blue-600'}`}>
                      {formatNumber(stat.customerCount)}
                    </p>
                  </div>
                </div>

                {/* Revenue at bottom */}
                {hasJobs && (
                  <div className={`mt-2 border-t pt-2 ${stat.isCurrent ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className={`text-xs font-bold tabular-nums ${stat.isCurrent ? 'text-white' : 'text-slate-900'}`}>
                      {formatPrice(stat.revenue)}
                    </p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </>
    )
  }

  // --- Render Level 2: Customer table ---
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
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Customer' : 'Müşteri Adı'}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Company' : 'Firma'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Jobs' : 'İş Sayısı'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Done' : 'Tamamlanan'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Ongoing' : 'Devam Eden'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isEN ? 'Total Amount' : 'Toplam Tutar'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthCustomers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => goToCustomer(c)}
                  className="cursor-pointer transition hover:bg-slate-50"
                >
                  <td className="truncate px-4 py-3 font-medium text-slate-900">
                    <span className="flex items-center gap-1.5">
                      {c.full_name}
                      {c.hasOngoingFromOtherMonths && (
                        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" title={isEN ? 'Has ongoing jobs from other months' : 'Başka aylarda devam eden işi var'} />
                      )}
                    </span>
                  </td>
                  <td className="truncate px-4 py-3 text-slate-600">{c.company_name || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(c.jobCount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-green-600">
                    {formatNumber(c.completed)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-amber-600">
                    {formatNumber(c.ongoing)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-medium text-slate-700">
                    {formatPrice(c.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals footer */}
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700" colSpan={2}>
                  {isEN ? 'Total' : 'Toplam'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-sm font-bold text-slate-900">
                  {formatNumber(totals.jobCount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-sm font-bold text-green-600">
                  {formatNumber(totals.completed)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-sm font-bold text-amber-600">
                  {formatNumber(totals.ongoing)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-sm font-bold text-slate-900">
                  {formatPrice(totals.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  // --- Render Level 3: Customer job detail with tabs ---
  const renderCustomerDetail = () => {
    const { monthJobs, allJobs } = customerDetailJobs
    const hasMonthJobs = selectedMonth != null && monthJobs.length > 0
    const monthNames = isEN ? MONTHS_EN : MONTHS_TR

    return (
      <div>
        {/* Detail tabs */}
        {hasMonthJobs && (
          <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setDetailTab('month')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                detailTab === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isEN ? `${monthNames[selectedMonth]} Jobs` : `${monthNames[selectedMonth]} İşleri`}
              <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                {monthJobs.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDetailTab('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                detailTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isEN ? 'All Jobs' : 'Tüm İşler'}
              <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                {allJobs.length}
              </span>
            </button>
          </div>
        )}

        {/* Show the active tab's table */}
        {hasMonthJobs && detailTab === 'month'
          ? renderJobsTable(monthJobs)
          : renderJobsTable(allJobs)
        }
      </div>
    )
  }

  // --- Render Search tab ---
  const renderSearchTab = () => {
    if (searchCustomer) {
      return (
        <div>
          <nav className="mb-4 flex items-center gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => setSearchCustomer(null)}
              className="font-medium text-slate-500 transition hover:text-slate-900"
            >
              {isEN ? 'Search' : 'Arama'}
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{searchCustomer.full_name}</span>
          </nav>
          {renderJobsTable(searchCustomerJobs)}
        </div>
      )
    }

    return (
      <div>
        <input
          type="text"
          placeholder={isEN ? 'Search customer name or company...' : 'Müşteri adı veya firma ara...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />

        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">{isEN ? 'No customers found' : 'Müşteri bulunamadı'}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSearchCustomer(c)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-200 hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{c.full_name}</p>
                  {c.company_name && (
                    <p className="text-xs text-slate-500">{c.company_name}</p>
                  )}
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {c.jobCount} {isEN ? 'jobs' : 'iş'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEN ? 'Reports' : 'Raporlar'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEN ? 'Monthly job and revenue reports' : 'Aylık iş ve kazanç raporları'}
          </p>
        </div>

        {/* Tab bar */}
        <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleTabChange('monthly')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {isEN ? 'Monthly Report' : 'Aylık Rapor'}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('search')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'search'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {isEN ? 'Search Customer' : 'Müşteri Ara'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : activeTab === 'monthly' ? (
          <div>
            {renderBreadcrumb()}
            {drillLevel === 1 && renderMonthCards()}
            {drillLevel === 2 && renderCustomerTable()}
            {drillLevel === 3 && renderCustomerDetail()}
          </div>
        ) : (
          renderSearchTab()
        )}
      </div>
    </DashboardLayout>
  )
}
