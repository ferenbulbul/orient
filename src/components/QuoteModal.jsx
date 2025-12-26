import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { sendQuoteRequest } from '../lib/email'

const INITIAL_FORM = {
  productType: 'Kitap',
  quantity: '',
  pageCount: '',
  size: '',
  paper: '',
  color: 'Çalışma Rengi',
  binding: 'Sert Kapak',
  sample: 'Baskı',
  notes: '',
  name: '',
  email: '',
  phone: '',
}

const PRODUCTS = ['Kitap', 'Katalog', 'Takvim', 'Ajanda', 'Karton Çanta', 'Dergi']
const COLORS = ['Çalışma Rengi', 'Diğer']
const BINDINGS = ['Sert Kapak', 'Amerikan Cilt', 'Tel Dikiş', 'Diğer']
const SAMPLE_TYPES = ['Baskı', 'PDF']

function QuoteModal({ isOpen, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM)
      setSending(false)
      setStatus(null)
    }
  }, [isOpen])

  const targetElement = useMemo(() => {
    if (typeof document === 'undefined') return null
    return document.body
  }, [])

  if (!isOpen || !targetElement) {
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (sending) return
    setSending(true)
    setStatus(null)
    try {
      await sendQuoteRequest(form)
      setStatus({ type: 'success', message: 'Talebiniz başarıyla iletildi.' })
      setForm(INITIAL_FORM)
      setSending(false)
      setTimeout(() => {
        onClose()
        setStatus(null)
      }, 1500)
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Gönderimde bir sorun oluştu. Lütfen tekrar deneyin.',
      })
      setSending(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm transition"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-[0_40px_90px_rgba(15,23,42,0.3)] animate-[scaleIn_0.25s_ease]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#c1121f]">Teklif Formu</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0b1220]">Teklif İste</h2>
            <p className="mt-2 text-sm text-slate-600">
              Projenize en uygun baskı ve üretim planını birlikte oluşturalım.
            </p>
          </div>
          <button
            type="button"
            className="text-slate-400 transition hover:text-slate-600"
            onClick={onClose}
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              Ürün *
              <select
                name="productType"
                value={form.productType}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
              >
                {PRODUCTS.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              Ürün Adedi *
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              Sayfa Sayısı *
              <input
                type="number"
                name="pageCount"
                min="1"
                value={form.pageCount}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              Ölçü (mm) *
              <input
                type="text"
                name="size"
                value={form.size}
                onChange={handleChange}
                required
                placeholder="210 x 297"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              Kağıt &amp; Gramaj *
              <input
                type="text"
                name="paper"
                value={form.paper}
                onChange={handleChange}
                required
                placeholder="115 gr Mat Kuşe"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <fieldset className="rounded-3xl border border-slate-100 p-4">
              <legend className="px-2 text-sm font-semibold text-[#0b1220]">İç Sayfa Rengi *</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {COLORS.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${
                      form.color === option ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={option}
                      checked={form.color === option}
                      onChange={handleChange}
                      className="text-rose-600 focus:ring-rose-500"
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="rounded-3xl border border-slate-100 p-4">
              <legend className="px-2 text-sm font-semibold text-[#0b1220]">Ciltleme *</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {BINDINGS.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${
                      form.binding === option ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="binding"
                      value={option}
                      checked={form.binding === option}
                      onChange={handleChange}
                      className="text-rose-600 focus:ring-rose-500"
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <fieldset className="rounded-3xl border border-slate-100 p-4">
              <legend className="px-2 text-sm font-semibold text-[#0b1220]">Numune *</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {SAMPLE_TYPES.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${
                      form.sample === option ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sample"
                      value={option}
                      checked={form.sample === option}
                      onChange={handleChange}
                      className="text-rose-600 focus:ring-rose-500"
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              Açıklama
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Projenize dair ek notları paylaşabilirsiniz."
              />
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              İsim Soyisim *
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              E-posta *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0b1220]">
              Telefon *
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
          </div>

          {status && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-400"
            >
              {sending ? 'Gönderiliyor...' : 'Teklif Talebi Gönder'}
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300"
              onClick={onClose}
              disabled={sending}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>,
    targetElement,
  )
}

export default QuoteModal
