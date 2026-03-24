import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { sendQuoteRequest } from '../lib/email'
import { useLanguage } from '../context/LanguageContext'

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
  const { isEN } = useLanguage()
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
  const products = isEN ? ['Book', 'Catalog', 'Calendar', 'Planner', 'Paper Bag', 'Magazine'] : PRODUCTS
  const innerPapers = isEN ? ['Woodfree', 'Ivory', 'Gloss Coated', 'Matte Coated', 'Book Paper', 'Chamois'] : INNER_PAPERS
  const coverPapers = isEN ? ['Bristol', 'Gloss Coated', 'Matte Coated', 'Chrome Cardboard'] : COVER_PAPERS
  const laminations = isEN ? ['Matte Lamination', 'Gloss Lamination', 'Emboss Varnish', 'Spot Varnish'] : LAMINATIONS
  const bindings = isEN ? ['Perfect Binding', 'Wire Stitch', 'Thread + Perfect', 'Hard Cover'] : BINDINGS

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
      setStatus({ type: 'success', message: isEN ? 'Your request has been received successfully.' : 'Talebiniz başarıyla alındı.' })
      setForm(INITIAL_FORM)
      setTimeout(onClose, 1200)
    } catch {
      setStatus({ type: 'error', message: isEN ? 'Submission failed.' : 'Gönderim başarısız.' })
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
            {isEN ? 'Quote Form' : 'Teklif Formu'}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            {isEN ? 'Get a Quick Quote' : 'Hızlı Teklif Al'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* BASIC INFO */}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold">
              {isEN ? 'Product *' : 'Ürün *'}
              <select
                name="productType"
                value={form.productType}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              >
                {products.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              {isEN ? 'Quantity *' : 'Ürün Adedi *'}
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
              {isEN ? 'Page Count *' : 'Sayfa Sayısı *'}
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
              {isEN ? 'Size (mm) *' : 'Ölçü (mm) *'}
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
              {isEN ? 'Inner Paper *' : 'İç Kağıt *'}
              <select
                name="innerPaper"
                value={form.innerPaper}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              >
                <option value="">{isEN ? 'Select' : 'Seçiniz'}</option>
                {innerPapers.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              {isEN ? 'Cover Paper *' : 'Kapak Kağıdı *'}
              <select
                name="coverPaper"
                value={form.coverPaper}
                onChange={handleChange}
                required
                className="rounded-xl border px-4 py-3"
              >
                <option value="">{isEN ? 'Select' : 'Seçiniz'}</option>
                {coverPapers.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          {/* COLORS */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold">{isEN ? 'Inner Colors' : 'İç Renk'}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="innerColorFront"
                  placeholder={isEN ? "Front" : "Ön"}
                  value={form.innerColorFront}
                  onChange={handleChange}
                  className="rounded-xl border px-4 py-3"
                />
                <input
                  name="innerColorBack"
                  placeholder={isEN ? "Back" : "Arka"}
                  value={form.innerColorBack}
                  onChange={handleChange}
                  className="rounded-xl border px-4 py-3"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">{isEN ? 'Cover Colors' : 'Kapak Renk'}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="coverColorFront"
                  placeholder={isEN ? "Front" : "Ön"}
                  value={form.coverColorFront}
                  onChange={handleChange}
                  className="rounded-xl border px-4 py-3"
                />
                <input
                  name="coverColorBack"
                  placeholder={isEN ? "Back" : "Arka"}
                  value={form.coverColorBack}
                  onChange={handleChange}
                  className="rounded-xl border px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* LAMINATION */}
          <div>
            <p className="mb-3 text-sm font-semibold">{isEN ? 'Coating / Lamination' : 'Kaplama / Laminasyon'}</p>
            <div className="flex flex-wrap gap-3">
              {laminations.map((l) => (
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
            <p className="mb-3 text-sm font-semibold">{isEN ? 'Binding *' : 'Cilt *'}</p>
            <div className="flex flex-wrap gap-3">
              {bindings.map((b) => (
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
            placeholder={isEN ? "Provide additional details about your project." : "İşinize dair ek bilgiler veriniz."}
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border px-4 py-3"
          />

          {/* CONTACT */}
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              name="company"
              placeholder={isEN ? "Company" : "Firma"}
              value={form.company}
              onChange={handleChange}
              className="rounded-xl border px-4 py-3"
            />
            <input
              name="name"
              placeholder={isEN ? "Full Name *" : "Ad Soyad *"}
              value={form.name}
              onChange={handleChange}
              required
              className="rounded-xl border px-4 py-3"
            />
            <input
              type="email"
              name="email"
              placeholder={isEN ? "E-mail *" : "E-posta *"}
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-xl border px-4 py-3"
            />
            <input
              type="tel"
              name="phone"
              placeholder={isEN ? "Phone *" : "Telefon *"}
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
              {sending ? (isEN ? 'Sending…' : 'Gönderiliyor…') : (isEN ? 'Send Quote Request' : 'Teklif Talebi Gönder')}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-3 font-semibold text-slate-700"
            >
              {isEN ? 'Cancel' : 'İptal'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    targetElement
  )
}

export default QuoteModal
