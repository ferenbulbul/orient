import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { sendQuoteRequest } from '../lib/email'

const INITIAL_FORM = {
  productType: 'Kitap',
  quantity: '',
  pageCount: '',
  size: '',

  innerPaper: '',
  coverPaper: '',

  innerColorFront: '',
  innerColorBack: '',
  coverColorFront: '',
  coverColorBack: '',

  laminations: [],
  binding: '',

  notes: '',

  company: '',
  name: '',
  email: '',
  phone: '',
}

const PRODUCTS = ['Kitap', 'Katalog', 'Takvim', 'Ajanda', 'Karton Çanta', 'Dergi']

const INNER_PAPERS = [
  '1. Hamur',
  'İvory',
  'Parlak Kuşe',
  'Mat Kuşe',
  'Kitap Kağıdı',
  'Şamua',
]

const COVER_PAPERS = [
  'Bristol',
  'Parlak Kuşe',
  'Mat Kuşe',
  'Krome Karton',
]

const LAMINATIONS = [
  'Mat Selefon',
  'Parlak Selefon',
  'Emboss Lak',
  'Lokal Lak',
]

const BINDINGS = [
  'Amerikan',
  'Tel Dikiş',
  'İplik Amerikan',
  'Sert Kapak',
]

function QuoteModal({ isOpen, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => e.key === 'Escape' && onClose()
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
      setStatus(null)
      setSending(false)
    }
  }, [isOpen])

  const targetElement = useMemo(() => document.body, [])
  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleLamination = (item) => {
    setForm((prev) => ({
      ...prev,
      laminations: prev.laminations.includes(item)
        ? prev.laminations.filter((i) => i !== item)
        : [...prev.laminations, item],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setStatus(null)

    try {
      await sendQuoteRequest(form)
      setStatus({ type: 'success', message: 'Talebiniz başarıyla alındı.' })
      setForm(INITIAL_FORM)
      setTimeout(onClose, 1200)
    } catch {
      setStatus({ type: 'error', message: 'Gönderim başarısız.' })
    } finally {
      setSending(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-[0_40px_90px_rgba(15,23,42,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-rose-600">
            Teklif Formu
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            Hızlı Teklif Al
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* BASIC INFO */}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Ürün *
              <select
                name="productType"
                value={form.productType}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              >
                {PRODUCTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Ürün Adedi *
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Sayfa Sayısı *
              <input
                type="number"
                name="pageCount"
                value={form.pageCount}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Ölçü (mm) *
              <input
                type="text"
                name="size"
                placeholder="210 x 297"
                value={form.size}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              />
            </label>
          </div>

          {/* PAPERS */}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold">
              İç Kağıt *
              <select
                name="innerPaper"
                value={form.innerPaper}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              >
                <option value="">Seçiniz</option>
                {INNER_PAPERS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Kapak Kağıdı *
              <select
                name="coverPaper"
                value={form.coverPaper}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              >
                <option value="">Seçiniz</option>
                {COVER_PAPERS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          {/* COLORS */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold">İç Renk</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="innerColorFront"
                  placeholder="Ön"
                  value={form.innerColorFront}
                  onChange={handleChange}
                  className="rounded-xl border px-4 py-3"
                />
                <input
                  name="innerColorBack"
                  placeholder="Arka"
                  value={form.innerColorBack}
                  onChange={handleChange}
                  className="rounded-xl border px-4 py-3"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Kapak Renk</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="coverColorFront"
                  placeholder="Ön"
                  value={form.coverColorFront}
                  onChange={handleChange}
                  className="rounded-xl border px-4 py-3"
                />
                <input
                  name="coverColorBack"
                  placeholder="Arka"
                  value={form.coverColorBack}
                  onChange={handleChange}
                  className="rounded-xl border px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* LAMINATION */}
          <div>
            <p className="mb-3 text-sm font-semibold">Kaplama / Laminasyon</p>
            <div className="flex flex-wrap gap-3">
              {LAMINATIONS.map((l) => (
                <label key={l} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.laminations.includes(l)}
                    onChange={() => toggleLamination(l)}
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* BINDING */}
          <div>
            <p className="mb-3 text-sm font-semibold">Cilt *</p>
            <div className="flex flex-wrap gap-3">
              {BINDINGS.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="binding"
                    value={b}
                    checked={form.binding === b}
                    onChange={handleChange}
                    required
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>

          {/* NOTES */}
          <textarea
            name="notes"
            placeholder="İşinize dair ek bilgiler veriniz."
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border px-4 py-3"
          />

          {/* CONTACT */}
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              name="company"
              placeholder="Firma"
              value={form.company}
              onChange={handleChange}
              className="rounded-xl border px-4 py-3"
            />
            <input
              name="name"
              placeholder="Ad Soyad *"
              value={form.name}
              onChange={handleChange}
              required
              className="rounded-xl border px-4 py-3"
            />
            <input
              type="email"
              name="email"
              placeholder="E-posta *"
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-xl border px-4 py-3"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefon *"
              value={form.phone}
              onChange={handleChange}
              required
              className="rounded-xl border px-4 py-3"
            />
          </div>

          {status && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {status.message}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending}
              className="flex-1 rounded-xl bg-rose-600 px-6 py-3 font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
            >
              {sending ? 'Gönderiliyor…' : 'Teklif Talebi Gönder'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-3 font-semibold text-slate-700"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>,
    targetElement
  )
}

export default QuoteModal
