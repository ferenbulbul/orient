import { useLanguage } from '../../context/LanguageContext'

export default function StepItem({
  step,
  canEdit = false,
  canUntoggle = false,
  isLocked = false,
  onToggle,
}) {
  const { isEN } = useLanguage()
  const isCompleted = step.durum === 'tamamlandi'

  // Tıklanabilirlik: edit yetkisi var + kilitli değil + (tamamlanmamış VEYA geri alma yetkisi var)
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
