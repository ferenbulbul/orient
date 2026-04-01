import { useLanguage } from '../../context/LanguageContext'
import StepItem from './StepItem'

const PHASE_LABELS = {
  1: { tr: 'Baskı Öncesi', en: 'Prepress' },
  2: { tr: 'Baskı', en: 'Printing' },
  3: { tr: 'Mücellit', en: 'Bindery' },
  4: { tr: 'Lojistik', en: 'Logistics' },
}

const PHASE_COLORS = {
  1: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  2: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  3: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  4: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
}

const ALL_PHASES = [1, 2, 3, 4]

export default function JobStepper({ steps = [], canEdit = false, onToggleStep }) {
  const { isEN } = useLanguage()

  // Group steps by phase
  const phases = ALL_PHASES.map((phase) => {
    const phaseSteps = steps
      .filter((s) => s.phase === phase)
      .sort((a, b) => a.step_order - b.step_order)
    const completed = phaseSteps.filter((s) => s.durum === 'tamamlandi').length
    const total = phaseSteps.length
    const isComplete = total > 0 && completed === total
    return { phase, steps: phaseSteps, completed, total, isComplete }
  }).filter((p) => p.total > 0) // Sadece adımı olan fazları göster

  // Phase is locked if previous phase is not complete
  const isPhaseUnlocked = (phaseNum) => {
    if (phaseNum === 1) return true
    const prevPhase = phases.find((p) => p.phase === phaseNum - 1)
    return prevPhase?.isComplete ?? false
  }

  return (
    <div className="flex flex-col gap-6">
      {phases.map(({ phase, steps: phaseSteps, completed, total, isComplete }) => {
        const unlocked = isPhaseUnlocked(phase)
        const colors = PHASE_COLORS[phase] || PHASE_COLORS[1]
        const label = isEN ? PHASE_LABELS[phase]?.en : PHASE_LABELS[phase]?.tr

        return (
          <div
            key={phase}
            className={`rounded-2xl border ${unlocked ? colors.border : 'border-slate-200'} ${
              unlocked ? colors.bg : 'bg-slate-50'
            } overflow-hidden transition`}
          >
            {/* Phase header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                    unlocked ? colors.dot : 'bg-slate-300'
                  }`}
                >
                  {phase}
                </div>
                <div>
                  <h3
                    className={`text-sm font-semibold ${
                      unlocked ? colors.text : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {completed}/{total} {isEN ? 'completed' : 'tamamlandı'}
                  </p>
                </div>
              </div>

              {/* Phase status */}
              {!unlocked && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  {isEN ? 'Locked' : 'Kilitli'}
                </div>
              )}
              {isComplete && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isEN ? 'Complete' : 'Tamamlandı'}
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-1 px-3 pb-3">
              {phaseSteps.map((step) => (
                <StepItem
                  key={step.id}
                  step={step}
                  canEdit={canEdit}
                  isLocked={!unlocked}
                  onToggle={onToggleStep}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
