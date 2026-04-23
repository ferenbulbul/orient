import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'

export default function StepItem({
  step,
  canEdit = false,
  canUntoggle = false,
  isLocked = false,
  onToggle,
  // Shipment mode props
  isShipmentStep = false,
  shipmentProgress = null, // { shipped, total }
  onAddShipment,
  onForceComplete,
}) {
  const { isEN } = useLanguage()
  const isCompleted = step.durum === 'tamamlandi'

  // Shipment mode — Sevkiyat adımı
  if (isShipmentStep) {
    const shipped = shipmentProgress?.shipped || 0
    const total = shipmentProgress?.total || 0
    const canAdd = canEdit && !isLocked && !isCompleted
    const [showConfirm, setShowConfirm] = useState(false)

    return (
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
          isLocked ? 'opacity-50' : ''
        } ${isCompleted ? 'bg-green-50' : 'bg-white'}`}
      >
        {/* Truck icon */}
        <div
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${
            isLocked
              ? 'bg-slate-200 text-slate-400'
              : isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-orange-100 text-orange-600'
          }`}
        >
          {isLocked ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          ) : isCompleted ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          )}
        </div>

        {/* Step info */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${
              isCompleted ? 'text-green-700' : isLocked ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            {step.step_name}
          </p>
          {!isLocked && (
            <p className="text-xs text-slate-400">
              {formatNumber(shipped)} / {formatNumber(total)} {isEN ? 'shipped' : 'sevk edildi'}
            </p>
          )}
        </div>

        {/* Parçala + Tamamla buttons or status */}
        {isCompleted ? (
          <span className="text-xs font-medium text-green-600">
            {isEN ? 'Done' : 'Tamam'}
          </span>
        ) : canAdd ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddShipment}
              className="flex items-center gap-1.5 rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {isEN ? 'Add Shipment' : 'Parçala'}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {isEN ? 'Complete' : 'Tamamla'}
            </button>
          </div>
        ) : null}

        {/* Tamamla onay modalı */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowConfirm(false)}>
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">
                {isEN ? 'Complete Shipment?' : 'Sevkiyatı Tamamla?'}
              </h3>
              <div className="mb-4 rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">{isEN ? 'Total Quantity' : 'Toplam Adet'}</span>
                  <span className="font-bold text-slate-900">{formatNumber(total)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">{isEN ? 'Shipped So Far' : 'Sevk Edilen'}</span>
                  <span className="font-bold text-blue-600">{formatNumber(shipped)}</span>
                </div>
                {shipped < total && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isEN ? 'Remaining' : 'Kalan'}</span>
                    <span className="font-bold text-orange-600">{formatNumber(total - shipped)}</span>
                  </div>
                )}
              </div>
              {shipped < total && (
                <p className="mb-4 text-xs text-amber-600">
                  {isEN
                    ? 'Not all items have been shipped yet. Are you sure you want to mark this as complete?'
                    : 'Henüz tüm adet sevk edilmedi. Yine de tamamlamak istiyor musunuz?'}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {isEN ? 'Cancel' : 'İptal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false)
                    onForceComplete?.()
                  }}
                  className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  {isEN ? 'Complete' : 'Tamamla'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Normal step mode
  const isClickable = canEdit && !isLocked && (!isCompleted || canUntoggle)

  const completedAt = step.completed_at
    ? new Date(step.completed_at).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
        isLocked ? 'opacity-50' : ''
      } ${isCompleted ? 'bg-green-50' : 'bg-white'}`}
    >
      {/* Checkbox / Icon */}
      {isClickable ? (
        <button
          type="button"
          onClick={() => onToggle?.(step)}
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition ${
            isCompleted
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          {isCompleted && (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>
      ) : (
        <div
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${
            isLocked
              ? 'bg-slate-200 text-slate-400'
              : isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-slate-100 text-slate-400'
          }`}
        >
          {isLocked ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          ) : isCompleted ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          )}
        </div>
      )}

      {/* Step info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isCompleted ? 'text-green-700' : isLocked ? 'text-slate-400' : 'text-slate-700'
          }`}
        >
          {step.step_name}
        </p>
        {completedAt && (
          <p className="text-xs text-slate-400">{completedAt}</p>
        )}
      </div>

      {/* Status indicator */}
      {isCompleted && (
        <span className="text-xs font-medium text-green-600">
          {isEN ? 'Done' : 'Tamam'}
        </span>
      )}
    </div>
  )
}
