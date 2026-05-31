import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import { compressImageFile } from '../../lib/imageCompression'

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function ShipmentForm({ jobId, jobNo, musteriName, jobAdet, shippedSoFar, onSuccess, onClose }) {
  const { profile } = useAuth()
  const { isEN } = useLanguage()
  const remaining = jobAdet - shippedSoFar

  const [adet, setAdet] = useState(remaining > 0 ? String(remaining) : '')
  const [file, setFile] = useState(null)
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError(isEN ? 'Only PDF, PNG, JPG files are allowed.' : 'Sadece PDF, PNG, JPG dosyaları yüklenebilir.')
      return
    }
    if (selected.size > MAX_SIZE) {
      setError(isEN ? 'File size must be under 10MB.' : 'Dosya boyutu 10MB altında olmalıdır.')
      return
    }
    setError('')
    const compressed = await compressImageFile(selected)
    setFile(compressed)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numAdet = parseInt(adet, 10)

    if (!numAdet || numAdet <= 0) {
      setError(isEN ? 'Please enter a valid quantity.' : 'Geçerli bir adet girin.')
      return
    }
    if (numAdet > remaining) {
      setError(isEN ? `Cannot exceed remaining quantity (${remaining}).` : `Kalan adetten (${remaining}) fazla girilemez.`)
      return
    }
    if (!file) {
      setError(isEN ? 'Waybill file is required.' : 'İrsaliye dosyası zorunludur.')
      return
    }

    setUploading(true)
    setError('')

    // 1. Dosyayı Storage'a yükle
    const fileExt = file.name.split('.').pop()
    const safeName = `sevkiyat_${jobNo}_${musteriName}_${numAdet}adet`.replace(/[^a-zA-Z0-9_-]/g, '_')
    const filePath = `${jobId}/${safeName}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('irsaliyeler')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setError(isEN ? `File upload failed: ${uploadError.message}` : `Dosya yükleme başarısız: ${uploadError.message}`)
      setUploading(false)
      return
    }

    // 2. Shipment kaydı oluştur
    const { error: insertError } = await supabase
      .from('shipments')
      .insert({
        job_id: jobId,
        adet: numAdet,
        irsaliye_path: filePath,
        irsaliye_original_name: `sevkiyat_${jobNo}_${musteriName}_${numAdet}adet.${fileExt}`,
        notes: notes.trim() || null,
        created_by: profile.id,
      })

    if (insertError) {
      console.error('Shipment insert error:', insertError)
      // Yüklenen dosyayı temizle
      await supabase.storage.from('irsaliyeler').remove([filePath])
      setError(isEN ? 'Failed to save shipment.' : 'Sevkiyat kaydı oluşturulamadı.')
      setUploading(false)
      return
    }

    setUploading(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {isEN ? 'Add Shipment' : 'Sevkiyat Ekle'}
          </h3>
        </div>

        {/* Info bar */}
        <div className="mb-5 flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs">
          <div className="text-center">
            <p className="font-medium text-slate-500">{isEN ? 'Total' : 'Toplam'}</p>
            <p className="text-sm font-bold text-slate-900">{formatNumber(jobAdet)}</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-500">{isEN ? 'Shipped' : 'Sevk Edilen'}</p>
            <p className="text-sm font-bold text-blue-600">{formatNumber(shippedSoFar)}</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-500">{isEN ? 'Remaining' : 'Kalan'}</p>
            <p className="text-sm font-bold text-orange-600">{formatNumber(remaining > 0 ? remaining : 0)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Adet */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isEN ? 'Quantity' : 'Adet'} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={adet}
              onChange={(e) => setAdet(e.target.value)}
              min="1"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              placeholder={isEN ? 'Enter quantity' : 'Adet girin'}
            />
          </div>

          {/* İrsaliye dosyası */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isEN ? 'Waybill (PDF/Image)' : 'İrsaliye (PDF/Görsel)'} <span className="text-red-500">*</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 transition hover:border-slate-400">
              <svg className="h-5 w-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="truncate text-sm text-slate-600">
                {file ? file.name : (isEN ? 'Choose file...' : 'Dosya seçin...')}
              </span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Notlar */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isEN ? 'Notes (optional)' : 'Notlar (isteğe bağlı)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              placeholder={isEN ? 'e.g. First batch to Istanbul' : 'ör. İstanbul\'a ilk parti'}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {isEN ? 'Cancel' : 'İptal'}
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              {uploading ? '...' : isEN ? 'Add Shipment' : 'Sevkiyat Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
