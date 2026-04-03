import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber, formatPrice } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import JobCard from '../../components/dashboard/JobCard'

const DURUM_OPTIONS = [
  { value: '', label: { tr: 'Tümü', en: 'All' } },
  { value: 'baski_oncesi', label: { tr: 'Baskı Öncesi', en: 'Prepress' } },
  { value: 'baskida', label: { tr: 'Baskıda', en: 'Printing' } },
  { value: 'mucellit', label: { tr: 'Mücellit', en: 'Bindery' } },
  { value: 'lojistik', label: { tr: 'Lojistik', en: 'Logistics' } },
  { value: 'tamamlandi', label: { tr: 'Tamamlandı', en: 'Completed' } },
]

export default function ModeratorDashboard() {
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [durumFilter, setDurumFilter] = useState('')

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

  const filtered = jobs.filter((job) => {
    const matchSearch =
      !search ||
      job.is_emri_no.toLowerCase().includes(search.toLowerCase()) ||
      job.is_adi.toLowerCase().includes(search.toLowerCase())
    const matchDurum = !durumFilter || job.durum === durumFilter
    return matchSearch && matchDurum
  })

  const stats = {
    total: jobs.length,
    baskiOncesi: jobs.filter((j) => j.durum === 'baski_oncesi').length,
    baskida: jobs.filter((j) => j.durum === 'baskida').length,
    mucellit: jobs.filter((j) => j.durum === 'mucellit').length,
    lojistik: jobs.filter((j) => j.durum === 'lojistik').length,
    tamamlandi: jobs.filter((j) => j.durum === 'tamamlandi').length,
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEN ? 'All Jobs' : 'Tüm İşler'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEN ? 'View and track all print jobs' : 'Tüm baskı işlerini görüntüleyin'}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {[
            { label: isEN ? 'Total' : 'Toplam', value: formatNumber(stats.total), color: 'bg-slate-900 text-white' },
            { label: isEN ? 'Prepress' : 'Baskı Öncesi', value: formatNumber(stats.baskiOncesi), color: 'bg-blue-50 text-blue-700' },
            { label: isEN ? 'Printing' : 'Baskıda', value: formatNumber(stats.baskida), color: 'bg-amber-50 text-amber-700' },
            { label: isEN ? 'Bindery' : 'Mücellit', value: formatNumber(stats.mucellit), color: 'bg-purple-50 text-purple-700' },
            { label: isEN ? 'Logistics' : 'Lojistik', value: formatNumber(stats.lojistik), color: 'bg-orange-50 text-orange-700' },
            { label: isEN ? 'Done' : 'Tamamlandı', value: formatNumber(stats.tamamlandi), color: 'bg-green-50 text-green-700' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl px-4 py-3 text-center ${stat.color}`}
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
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

        {/* Job list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              {isEN ? 'No jobs found' : 'İş bulunamadı'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                showCustomer
                showPrice
                onClick={() => navigate(`/panel/is/${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
