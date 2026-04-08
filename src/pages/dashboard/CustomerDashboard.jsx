import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
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

export default function CustomerDashboard() {
  const { profile } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [durumFilter, setDurumFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false)
      return
    }
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, job_steps(*)')
        .eq('musteri_id', profile.id)
        .order('created_at', { ascending: false })

      if (!error) setJobs(data || [])
      setLoading(false)
    }
    fetchJobs()
  }, [profile?.id])

  useEffect(() => { setPage(1) }, [durumFilter, search])

  const filtered = jobs.filter((job) => {
    const matchSearch =
      !search ||
      job.is_emri_no.toLowerCase().includes(search.toLowerCase()) ||
      job.is_adi.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEN ? 'My Jobs' : 'İşlerim'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEN ? 'Track the progress of your print jobs' : 'Baskı işlerinizin durumunu takip edin'}
          </p>
        </div>

        {!loading && jobs.length > 0 && (
          <>
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
          </>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">{isEN ? 'No jobs yet' : 'Henüz iş kaydı yok'}</p>
          </div>
        ) : (
          <JobsTable
            jobs={filtered}
            page={page}
            onPageChange={setPage}
            showCustomer={false}
            showPrice={false}
            onJobClick={(id) => navigate(`/panel/is/${id}`)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
