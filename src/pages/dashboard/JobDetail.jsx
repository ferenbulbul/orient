import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { sendStepEmail, sendJobCompletedEmail } from '../../lib/email'
import { formatNumber, formatPrice } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StatusBadge from '../../components/dashboard/StatusBadge'
import JobStepper from '../../components/dashboard/JobStepper'

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { profile, isAdmin, isStaffOrAdmin, canEditJobs, canViewPrice } = useAuth()
  const { isEN } = useLanguage()
  const [job, setJob] = useState(null)
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [teslimTarihi, setTeslimTarihi] = useState('')
  const [savingDate, setSavingDate] = useState(false)
  const [fiyatRaw, setFiyatRaw] = useState(null) // raw number
  const [fiyatDisplay, setFiyatDisplay] = useState('')
  const [savingFiyat, setSavingFiyat] = useState(false)

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, musteri:profiles!jobs_musteri_id_fkey(full_name, company_name, phone, email)')
      .eq('id', jobId)
      .single()

    if (error || !data) {
      navigate('/panel', { replace: true })
      return
    }
    setJob(data)
    setTeslimTarihi(data.teslim_tarihi || '')
    setFiyatRaw(data.fiyat)
    setFiyatDisplay(data.fiyat != null ? formatNumber(data.fiyat) : '')

    const { data: stepsData } = await supabase
      .from('job_steps')
      .select('*')
      .eq('job_id', jobId)
      .order('phase')
      .order('step_order')

    setSteps(stepsData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchJob()
  }, [jobId])

  // Phase 1 tamamlandı mı kontrolü (teslim tarihi kısıtlaması için)
  const phase1Steps = steps.filter((s) => s.phase === 1)
  const isPhase1Complete = phase1Steps.length > 0 && phase1Steps.every((s) => s.durum === 'tamamlandi')

  const handleToggleStep = async (step) => {
    // Geri alma (tamamlandi → bekliyor) sadece admin yapabilir
    if (step.durum === 'tamamlandi' && !isAdmin) return

    const newDurum = step.durum === 'tamamlandi' ? 'bekliyor' : 'tamamlandi'
    const updates = {
      durum: newDurum,
      completed_at: newDurum === 'tamamlandi' ? new Date().toISOString() : null,
      completed_by: newDurum === 'tamamlandi' ? profile.id : null,
    }

    const { error } = await supabase
      .from('job_steps')
      .update(updates)
      .eq('id', step.id)

    if (error) {
      console.error('Step update error:', error)
      return
    }

    // Refresh data
    await fetchJob()

    // Mail gönder (sadece tamamlama durumunda)
    if (newDurum === 'tamamlandi' && job?.musteri?.email) {
      const { data: freshSteps } = await supabase
        .from('job_steps')
        .select('*')
        .eq('job_id', jobId)

      const allSteps = freshSteps || []
      const completedCount = allSteps.filter((s) => s.durum === 'tamamlandi').length
      const totalCount = allSteps.length
      const allDone = completedCount === totalCount

      if (allDone) {
        // Tüm iş tamamlandı maili
        sendJobCompletedEmail({
          email: job.musteri.email,
          name: job.musteri.full_name,
          jobNo: job.is_emri_no,
          jobName: job.is_adi,
        })
      } else {
        // Adım tamamlandı maili
        sendStepEmail({
          email: job.musteri.email,
          name: job.musteri.full_name,
          jobNo: job.is_emri_no,
          jobName: job.is_adi,
          stepName: step.step_name,
          phaseName: step.phase_name,
          progress: `${completedCount}/${totalCount}`,
        })
      }
    }
  }

  const handleSaveTeslimTarihi = async () => {
    if (!teslimTarihi) return
    setSavingDate(true)
    await supabase
      .from('jobs')
      .update({ teslim_tarihi: teslimTarihi })
      .eq('id', jobId)
    setJob((prev) => ({ ...prev, teslim_tarihi: teslimTarihi }))
    setSavingDate(false)
  }

  const handleFiyatChange = (value) => {
    // Virgül ve noktaları temizle, sadece rakam ve ondalık virgül kabul et
    const cleaned = value.replace(/\./g, '').replace(',', '.')
    const num = cleaned ? parseFloat(cleaned) : null
    setFiyatRaw(num)
    // Display: sadece rakamları al ve formatla
    const raw = value.replace(/[^\d]/g, '')
    setFiyatDisplay(raw ? formatNumber(parseInt(raw, 10)) : '')
  }

  const handleSaveFiyat = async () => {
    setSavingFiyat(true)
    await supabase
      .from('jobs')
      .update({ fiyat: fiyatRaw })
      .eq('id', jobId)
    setJob((prev) => ({ ...prev, fiyat: fiyatRaw }))
    setSavingFiyat(false)
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
      <div className="mx-auto max-w-3xl">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/panel')}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {isEN ? 'Back to jobs' : 'İşlere dön'}
        </button>

        {/* Job header card */}
        <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="mb-2 inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {job.is_emri_no}
              </span>
              <h1 className="text-xl font-bold text-slate-900">{job.is_adi}</h1>
            </div>
            <StatusBadge durum={job.durum} isEN={isEN} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-500">
                {isEN ? 'Customer' : 'Müşteri'}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {job.musteri?.full_name || '-'}
              </p>
              {job.musteri?.company_name && (
                <p className="text-xs text-slate-500">{job.musteri.company_name}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {isEN ? 'Quantity' : 'Adet'}
              </p>
              <p className="text-sm font-semibold text-slate-900">{formatNumber(job.adet)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {isEN ? 'Created' : 'Oluşturulma'}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(job.created_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {isEN ? 'Delivery Date' : 'Teslim Tarihi'}
              </p>
              {canEditJobs ? (
                isPhase1Complete ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={teslimTarihi}
                      onChange={(e) => setTeslimTarihi(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm outline-none focus:border-slate-400"
                    />
                    {teslimTarihi !== (job.teslim_tarihi || '') && (
                      <button
                        type="button"
                        onClick={handleSaveTeslimTarihi}
                        disabled={savingDate}
                        className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-800"
                      >
                        {savingDate ? '...' : isEN ? 'Save' : 'Kaydet'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-400">
                      {job.teslim_tarihi
                        ? new Date(job.teslim_tarihi).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                    <p className="mt-1 text-xs text-amber-600">
                      {isEN
                        ? 'Complete Phase 1 to edit delivery date'
                        : 'Teslim tarihi düzenlemek için Baskı Öncesi aşamasını tamamlayın'}
                    </p>
                  </div>
                )
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {job.teslim_tarihi
                    ? new Date(job.teslim_tarihi).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </p>
              )}
            </div>
          </div>

          {/* Fiyat alanı — sadece admin ve moderatör görebilir */}
          {canViewPrice && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">
                {isEN ? 'Price' : 'Fiyat'}
              </p>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={fiyatDisplay}
                    onChange={(e) => handleFiyatChange(e.target.value)}
                    placeholder="0"
                    className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-slate-400"
                  />
                  <span className="text-sm text-slate-500">TL</span>
                  {fiyatRaw !== job.fiyat && (
                    <button
                      type="button"
                      onClick={handleSaveFiyat}
                      disabled={savingFiyat}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                    >
                      {savingFiyat ? '...' : isEN ? 'Save' : 'Kaydet'}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {job.fiyat != null ? formatPrice(job.fiyat) : '-'}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">
                {isEN ? 'Notes' : 'Notlar'}
              </p>
              <p className="text-sm text-slate-700">{job.notes}</p>
            </div>
          )}
        </div>

        {/* Job Stepper */}
        <div className="mb-4">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            {isEN ? 'Production Steps' : 'Üretim Adımları'}
          </h2>
          <JobStepper
            steps={steps}
            canEdit={canEditJobs}
            canUntoggle={isAdmin}
            onToggleStep={handleToggleStep}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
