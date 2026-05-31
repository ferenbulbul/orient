import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import CustomerSelect from '../../components/dashboard/CustomerSelect'

export default function JobCreate() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { isEN } = useLanguage()
  const [form, setForm] = useState({
    is_tipi: 'baski_cilt',
    is_emri_no: '',
    is_adi: '',
    adet: 1,
    adetDisplay: '1',
    kalip_adedi: null,
    kalipAdediDisplay: '',
    musteri_id: null,
    notes: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdetChange = (value) => {
    // Sadece rakam kabul et
    const raw = value.replace(/\D/g, '')
    const num = raw ? parseInt(raw, 10) : 0
    setForm((prev) => ({
      ...prev,
      adet: num || 1,
      adetDisplay: raw ? formatNumber(num) : '',
    }))
  }

  const handleKalipAdediChange = (value) => {
    const raw = value.replace(/\D/g, '')
    const num = raw ? parseInt(raw, 10) : 0
    setForm((prev) => ({
      ...prev,
      kalip_adedi: num || 1,
      kalipAdediDisplay: raw ? formatNumber(num) : '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.musteri_id) {
      setError(isEN ? 'Please select a customer' : 'Lütfen bir müşteri seçin')
      return
    }
    if (!form.is_emri_no.trim()) {
      setError(isEN ? 'Job number is required' : 'İş emri no gerekli')
      return
    }
    if (!form.is_adi.trim()) {
      setError(isEN ? 'Job name is required' : 'İş adı gerekli')
      return
    }

    setSubmitting(true)

    const { data, error: insertError } = await supabase
      .from('jobs')
      .insert({
        is_tipi: form.is_tipi,
        is_emri_no: form.is_emri_no.trim(),
        is_adi: form.is_adi.trim(),
        adet: form.adet,
        kalip_adedi: form.kalip_adedi || null,
        musteri_id: form.musteri_id,
        created_by: profile.id,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()

    if (insertError) {
      setError(
        insertError.message.includes('unique')
          ? isEN
            ? 'This job number already exists'
            : 'Bu iş emri no zaten mevcut'
          : insertError.message
      )
      setSubmitting(false)
      return
    }

    navigate(`/panel/is/${data.id}`)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        {/* Back */}
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

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-6 text-xl font-bold text-slate-900">
            {isEN ? 'Create New Job' : 'Yeni İş Emri Oluştur'}
          </h1>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Customer */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {isEN ? 'Customer' : 'Müşteri'} *
              </label>
              <CustomerSelect
                value={form.musteri_id}
                onChange={(id) => handleChange('musteri_id', id)}
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {isEN ? 'Job Type' : 'İş Tipi'} *
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'baski_cilt', label: isEN ? 'Print + Binding' : 'Baskı Cilt' },
                  { value: 'baski', label: isEN ? 'Print' : 'Baskı' },
                  { value: 'mucellit', label: isEN ? 'Bindery' : 'Mücellit' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('is_tipi', opt.value)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      form.is_tipi === opt.value
                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Number */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {isEN ? 'Job Number' : 'İş Emri No'} *
              </label>
              <input
                type="text"
                required
                value={form.is_emri_no}
                onChange={(e) => handleChange('is_emri_no', e.target.value)}
                placeholder={isEN ? 'e.g. IE-2024-001' : 'örn. IE-2024-001'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Job Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {isEN ? 'Job Name' : 'İş Adı'} *
              </label>
              <input
                type="text"
                required
                value={form.is_adi}
                onChange={(e) => handleChange('is_adi', e.target.value)}
                placeholder={isEN ? 'e.g. ABC Company Catalog' : 'örn. ABC Firma Kataloğu'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {isEN ? 'Quantity' : 'Adet'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.adetDisplay}
                onChange={(e) => handleAdetChange(e.target.value)}
                placeholder="1.000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Kalıp Adedi */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {isEN ? 'Mold Quantity' : 'Kalıp Adedi'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.kalipAdediDisplay}
                onChange={(e) => handleKalipAdediChange(e.target.value)}
                placeholder={isEN ? 'Optional' : 'İsteğe bağlı'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {isEN ? 'Notes' : 'Notlar'}
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={isEN ? 'Optional notes...' : 'İsteğe bağlı notlar...'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting
                ? isEN ? 'Creating...' : 'Oluşturuluyor...'
                : isEN ? 'Create Job' : 'İş Emri Oluştur'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
