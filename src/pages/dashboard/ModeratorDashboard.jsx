import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

export default function ModeratorDashboard() {
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [completedCount, setCompletedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const durumFilter = searchParams.get('durum') || ''
  const musteriFilter = searchParams.get('musteri') || ''
  const page = parseInt(searchParams.get('sayfa'), 10) || 1

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value)
        else next.delete(key)
      })
      return next
    })
  }, [setSearchParams])

  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const [completedJobs, setCompletedJobs] = useState([])
  const [completedTotal, setCompletedTotal] = useState(0)
  const [completedLoading, setCompletedLoading] = useState(false)

  // Debounce search for server-side queries
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Fetch active jobs + completed count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, countRes] = await Promise.all([
          supabase
            .from('jobs')
            .select('*, job_steps(*), musteri:profiles!jobs_musteri_id_fkey(full_name, company_name)')
            .neq('durum', 'tamamlandi')
            .order('created_at', { ascending: false }),
          supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('durum', 'tamamlandi'),
        ])
        if (!jobsRes.error) setJobs(jobsRes.data || [])
        setCompletedCount(countRes.count || 0)
      } catch (err) {
        console.error('Jobs fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch completed jobs with server-side pagination + search
  useEffect(() => {
    if (durumFilter !== 'tamamlandi') {
      setCompletedJobs([])
      setCompletedTotal(0)
      return
    }

    const fetchCompleted = async () => {
      setCompletedLoading(true)
      try {
        let query = supabase
          .from('jobs')
          .select('*, job_steps(*), musteri:profiles!jobs_musteri_id_fkey(full_name, company_name)', { count: 'exact' })
          .eq('durum', 'tamamlandi')
          .order('created_at', { ascending: false })

        if (debouncedSearch) {
          query = query.or(`is_emri_no.ilike.%${debouncedSearch}%,is_adi.ilike.%${debouncedSearch}%`)
        }
        if (musteriFilter) {
          query = query.eq('musteri_id', musteriFilter)
        }

        const from = (page - 1) * 50
        query = query.range(from, from + 49)

        const { data, count, error } = await query
        if (!error) {
          setCompletedJobs(data || [])
          setCompletedTotal(count || 0)
        }
      } catch (err) {
        console.error('Completed fetch error:', err)
      } finally {
        setCompletedLoading(false)
      }
    }
    fetchCompleted()
  }, [durumFilter, debouncedSearch, musteriFilter, page])

  const customers = useMemo(() => {
    const map = {}
    jobs.forEach((j) => {
      const id = j.musteri_id
      if (!id || map[id]) return
      map[id] = { id, name: j.musteri?.company_name || j.musteri?.full_name || '-' }
    })
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  }, [jobs])

  const isCompletedMode = durumFilter === 'tamamlandi'

  const filtered = isCompletedMode
    ? []
    : jobs.filter((job) => {
        if (search) {
          const q = search.toLowerCase()
          const match =
            job.is_emri_no.toLowerCase().includes(q) ||
            job.is_adi.toLowerCase().includes(q) ||
            (job.musteri?.company_name || '').toLowerCase().includes(q) ||
            (job.musteri?.full_name || '').toLowerCase().includes(q)
          if (!match) return false
        }

        if (musteriFilter && job.musteri_id !== musteriFilter) return false

        if (durumFilter === '__overdue') return isOverdue(job)
        if (durumFilter) return job.durum === durumFilter
        return true
      })

  const displayJobs = isCompletedMode ? completedJobs : filtered
  const displayLoading = isCompletedMode ? completedLoading : loading

  const stats = {
    total: jobs.length,
    baskiOncesi: jobs.filter((j) => j.durum === 'baski_oncesi').length,
    baskida: jobs.filter((j) => j.durum === 'baskida').length,
    mucellit: jobs.filter((j) => j.durum === 'mucellit').length,
    lojistik: jobs.filter((j) => j.durum === 'lojistik').length,
    tamamlandi: completedCount,
    overdue: jobs.filter((j) => isOverdue(j)).length,
  }

  const handleStatClick = (filterValue) => {
    const newValue = durumFilter === filterValue ? '' : filterValue
    updateParams({ durum: newValue, sayfa: '' })
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
            {isEN ? 'All Jobs' : 'Tüm İşler'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEN ? 'View and track all print jobs' : 'Tüm baskı işlerini görüntüleyin'}
          </p>
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
            onChange={(e) => updateParams({ q: e.target.value, sayfa: '' })}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <select
            value={musteriFilter}
            onChange={(e) => updateParams({ musteri: e.target.value, sayfa: '' })}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">{isEN ? 'All Customers' : 'Tüm Müşteriler'}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={durumFilter}
            onChange={(e) => updateParams({ durum: e.target.value, sayfa: '' })}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {DURUM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {isEN ? opt.label.en : opt.label.tr}
              </option>
            ))}
          </select>
        </div>

        {displayLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : (
          <JobsTable
            jobs={displayJobs}
            page={page}
            onPageChange={(p) => updateParams({ sayfa: p > 1 ? String(p) : '' })}
            showCustomer
            showPrice
            onJobClick={(id) => navigate(`/panel/is/${id}`)}
            totalCount={isCompletedMode ? completedTotal : undefined}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
