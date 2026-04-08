import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import JobsTable, { isOverdue } from '../../components/dashboard/JobsTable'

const DURUM_OPTIONS = [
  { value: '', label: { tr: 'Tümü', en: 'All' } },
  { value: 'baski_oncesi', label: { tr: 'Baskı Öncesi', en: 'Prepress' } },
  { value: 'baskida', label: { tr: 'Baskıda', en: 'Printing' } },
  { value: 'mucellit', label: { tr: 'Mücellit', en: 'Bindery' } },
  { value: 'lojistik', label: { tr: 'Lojistik', en: 'Logistics' } },
  { value: 'tamamlandi', label: { tr: 'Tamamlandı', en: 'Completed' } },
  { value: '__overdue', label: { tr: 'Gecikmiş', en: 'Overdue' } },
]

export default function StaffDashboard() {
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [durumFilter, setDurumFilter] = useState('')
  const [musteriFilter, setMusteriFilter] = useState('')
  const [page, setPage] = useState(1)

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

  useEffect(() => { setPage(1) }, [durumFilter, musteriFilter, search])

  const customers = useMemo(() => {
    const map = {}
    jobs.forEach((j) => {
      const id = j.musteri_id
      if (!id || map[id]) return
      map[id] = { id, name: j.musteri?.company_name || j.musteri?.full_name || '-' }
    })
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  }, [jobs])

  const filtered = jobs.filter((job) => {
    const matchSearch =
      !search ||
      job.is_emri_no.toLowerCase().includes(search.toLowerCase()) ||
      job.is_adi.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false

    if (musteriFilter && job.musteri_id !== musteriFilter) return false

    if (durumFilter === '__overdue') return isOverdue(job)
    if (durumFilter === 'tamamlandi') return job.durum === 'tamamlandi'
    if (durumFilter) return job.durum === durumFilter
    return job.durum !== 'tamamlandi'
  })

  const stats = {
    total: jobs.filter((j) => j.durum !== 'tamamlandi').length,
    baskiOncesi: jobs.filter((j) => j.durum === 'baski_oncesi').length,
    baskida: jobs.filter((j) => j.durum === 'baskida').length,
    mucellit: jobs.filter((j) => j.durum === 'mucellit').length,
    lojistik: jobs.filter((j) => j.durum === 'lojistik').length,
    tamamlandi: jobs.filter((j) => j.durum === 'tamamlandi').length,
    overdue: jobs.filter((j) => isOverdue(j)).length,
  }

  const handleStatClick = (filterValue) => {
    setDurumFilter((prev) => (prev === filterValue ? '' : filterValue))
  }

  const statItems = [
    { label: isEN ? 'Active' : 'Aktif', value: stats.total, color: 'bg-slate-900 text-white', activeRing: 'ring-slate-900', filter: '' },
    { label: isEN ? 'Prepress' : 'Baskı Öncesi', value: stats.baskiOncesi, color: 'bg-blue-50 text-blue-700', activeRing: 'ring-blue-400', filter: 'baski_oncesi' },
    { label: isEN ? 'Printing' : 'Baskıda', value: stats.baskida, color: 'bg-amber-50 text-amber-700', activeRing: 'ring-amber-400', filter: 'baskida' },
    { label: isEN ? 'Bindery' : 'Mücellit', value: stats.mucellit, color: 'bg-purple-50 text-purple-700', activeRing: 'ring-purple-400', filter: 'mucellit' },
    { label: isEN ? 'Logistics' : 'Lojistik', value: stats.lojistik, color: 'bg-orange-50 text-orange-700', activeRing: 'ring-orange-400', filter: 'lojistik' },
    { label: isEN ? 'Done' : 'Tamamlandı', value: stats.tamamlandi, color: 'bg-green-50 text-green-700', activeRing: 'ring-green-400', filter: 'tamamlandi' },
    { label: isEN ? 'Overdue' : 'Gecikmiş', value: stats.overdue, color: 'bg-red-50 text-red-700', activeRing: 'ring-red-400', filter: '__overdue' },
  ]

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEN ? 'All Jobs' : 'Tüm İşler'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isEN ? 'Manage and track all print jobs' : 'Tüm baskı işlerini yönetin'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/panel/yeni-is')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isEN ? 'New Job' : 'Yeni İş Emri'}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-7">
          {statItems.map((stat) => {
            const isActive = durumFilter === stat.filter
            return (
              <button
                key={stat.label}
                type="button"
                onClick={() => handleStatClick(stat.filter)}
                className={`rounded-2xl px-4 py-3 text-center transition ${stat.color} ${
                  isActive ? `ring-2 ${stat.activeRing} scale-[1.03]` : 'hover:scale-[1.02]'
                }`}
              >
                <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
                <p className="text-xs font-medium opacity-80">{stat.label}</p>
              </button>
            )
          })}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder={isEN ? 'Search job number or name...' : 'İş emri no veya adı ara...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <select
            value={musteriFilter}
            onChange={(e) => setMusteriFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">{isEN ? 'All Customers' : 'Tüm Müşteriler'}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={durumFilter}
            onChange={(e) => setDurumFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {DURUM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {isEN ? opt.label.en : opt.label.tr}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : (
          <JobsTable
            jobs={filtered}
            page={page}
            onPageChange={setPage}
            showCustomer
            showPrice={false}
            onJobClick={(id) => navigate(`/panel/is/${id}`)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
