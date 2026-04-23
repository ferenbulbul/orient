import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'

export default function ShipmentItem({ shipment, index, canDelete = false, onDelete }) {
  const { isEN } = useLanguage()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    const { data, error } = await supabase.storage
      .from('irsaliyeler')
      .createSignedUrl(shipment.irsaliye_path, 3600)

    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
    setDownloading(false)
  }

  const createdAt = new Date(shipment.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
      {/* Index badge */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
        {index + 1}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {formatNumber(shipment.adet)} {isEN ? 'pcs' : 'adet'}
          </span>
          {shipment.notes && (
            <span className="truncate text-xs text-slate-400">— {shipment.notes}</span>
          )}
        </div>
        <p className="text-xs text-slate-400">{createdAt}</p>
      </div>

      {/* İrsaliye download */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
        title={shipment.irsaliye_original_name || 'İrsaliye'}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        {isEN ? 'Waybill' : 'İrsaliye'}
      </button>

      {/* Delete */}
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete?.(shipment)}
          className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
          title={isEN ? 'Delete' : 'Sil'}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
