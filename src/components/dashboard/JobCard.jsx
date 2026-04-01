import { useLanguage } from '../../context/LanguageContext'
import StatusBadge from './StatusBadge'

export default function JobCard({ job, showCustomer = false, onClick }) {
  const { isEN } = useLanguage()
  const steps = job.job_steps || []
  const completedSteps = steps.filter((s) => s.durum === 'tamamlandi').length
  const totalSteps = steps.length || 7
  const progress = Math.round((completedSteps / totalSteps) * 100)

  const teslimTarihi = job.teslim_tarihi
    ? new Date(job.teslim_tarihi).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  const customerName =
    job.musteri?.company_name || job.musteri?.full_name || ''

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-slate-200 hover:shadow-md"
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
          {job.is_emri_no}
        </span>
        <StatusBadge durum={job.durum} isEN={isEN} />
      </div>

      {/* Job name */}
      <h3 className="mb-1 text-base font-semibold text-slate-900 group-hover:text-slate-700">
        {job.is_adi}
      </h3>

      {/* Meta */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>{isEN ? 'Qty' : 'Adet'}: {job.adet}</span>
        {teslimTarihi && (
          <span>{isEN ? 'Due' : 'Teslim'}: {teslimTarihi}</span>
        )}
        {showCustomer && customerName && (
          <span>{customerName}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-auto">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>
            {completedSteps}/{totalSteps} {isEN ? 'steps' : 'adım'}
          </span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </button>
  )
}
