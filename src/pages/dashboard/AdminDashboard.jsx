import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber, formatPrice } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StatusBadge from '../../components/dashboard/StatusBadge'

const DURUM_OPTIONS = [
  { value: '', label: { tr: 'Tümü', en: 'All' } },
  { value: 'baski_oncesi', label: { tr: 'Baskı Öncesi', en: 'Prepress' } },
  { value: 'baskida', label: { tr: 'Baskıda', en: 'Printing' } },
  { value: 'mucellit', label: { tr: 'Mücellit', en: 'Bindery' } },
  { value: 'lojistik', label: { tr: 'Lojistik', en: 'Logistics' } },
  { value: 'tamamlandi', label: { tr: 'Tamamlandı', en: 'Completed' } },
]

// Durum sıralama: tamamlandı en sonda
const DURUM_ORDER = {
  baski_oncesi: 0,
  baskida: 1,
  mucellit: 2,
  lojistik: 3,
  tamamlandi: 4,
}

export default function AdminDashboard() {
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

  const filtered = jobs
    .filter((job) => {
      const matchSearch =
        !search ||
        job.is_emri_no.toLowerCase().includes(search.toLowerCase()) ||
        job.is_adi.toLowerCase().includes(search.toLowerCase())
      const matchDurum = !durumFilter || job.durum === durumFilter
      return matchSearch && matchDurum
    })
    .sort((a, b) => (DURUM_ORDER[a.durum] ?? 99) - (DURUM_ORDER[b.durum] ?? 99))

  const stats = {
    total: jobs.length,
    baskiOncesi: jobs.filter((j) => j.durum === 'baski_oncesi').length,
    baskida: jobs.filter((j) => j.durum === 'baskida').length,
    mucellit: jobs.filter((j) => j.durum === 'mucellit').length,
    lojistik: jobs.filter((j) => j.durum === 'lojistik').length,
    tamamlandi: jobs.filter((j) => j.durum === 'tamamlandi').length,
  }

  const handleStatClick = (filterValue) => {
    setDurumFilter((prev) => (prev === filterValue ? '' : filterValue))
  }

  const statItems = [
    { label: isEN ? 'Total' : 'Toplam', value: stats.total, color: 'bg-slate-900 text-white', activeRing: 'ring-slate-900', filter: '' },
    { label: isEN ? 'Prepress' : 'Baskı Öncesi', value: stats.baskiOncesi, color: 'bg-blue-50 text-blue-700', activeRing: 'ring-blue-400', filter: 'baski_oncesi' },
    { label: isEN ? 'Printing' : 'Baskıda', value: stats.baskida, color: 'bg-amber-50 text-amber-700', activeRing: 'ring-amber-400', filter: 'baskida' },
    { label: isEN ? 'Bindery' : 'Mücellit', value: stats.mucellit, color: 'bg-purple-50 text-purple-700', activeRing: 'ring-purple-400', filter: 'mucellit' },
    { label: isEN ? 'Logistics' : 'Lojistik', value: stats.lojistik, color: 'bg-orange-50 text-orange-700', activeRing: 'ring-orange-400', filter: 'lojistik' },
    { label: isEN ? 'Done' : 'Tamamlandı', value: stats.tamamlandi, color: 'bg-green-50 text-green-700', activeRing: 'ring-green-400', filter: 'tamamlandi' },
  ]

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEN ? 'Admin Panel' : 'Admin Paneli'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isEN ? 'Full control over jobs and users' : 'İş ve kullanıcı yönetimi'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/panel/kullanicilar')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {isEN ? 'Users' : 'Kullanıcılar'}
            </button>
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
        </div>

        {/* Stats — clickable filters */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
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

        {/* Job table */}
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
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[14.28%]" />
                  <col className="w-[14.28%]" />
                  <col className="w-[14.28%]" />
                  <col className="w-[14.28%]" />
                  <col className="w-[14.28%]" />
                  <col className="w-[14.28%]" />
                  <col className="w-[14.28%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {isEN ? 'Job No' : 'İş Emri No'}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {isEN ? 'Job Name' : 'İş Adı'}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {isEN ? 'Customer' : 'Müşteri'}
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
                  {filtered.map((job) => {
                    const customerName = job.musteri?.company_name || job.musteri?.full_name || '-'
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
                        <td className="truncate px-4 py-3 font-medium text-slate-900">
                          {job.is_adi}
                        </td>
                        <td className="truncate px-4 py-3 text-slate-600">
                          {customerName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
                          {formatNumber(job.adet)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {teslim}
                        </td>
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
        )}
      </div>
    </DashboardLayout>
  )
}
