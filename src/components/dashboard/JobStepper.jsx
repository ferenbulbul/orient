import { useLanguage } from '../../context/LanguageContext'
import StepItem from './StepItem'
import ShipmentList from './ShipmentList'

const PHASE_LABELS = {
  'Baskı Öncesi': { tr: 'Baskı Öncesi', en: 'Prepress' },
  'Baskı': { tr: 'Baskı', en: 'Printing' },
  'Mücellit': { tr: 'Mücellit', en: 'Bindery' },
  'Lojistik': { tr: 'Lojistik', en: 'Logistics' },
}

const PHASE_COLORS_BY_NAME = {
  'Baskı Öncesi': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Baskı': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Mücellit': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Lojistik': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
}

const DEFAULT_COLORS = { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500' }

export default function JobStepper({
  steps = [],
  canEdit = false,
  canUntoggle = false,
  onToggleStep,
  job,
  shipments = [],
  onAddShipment,
  onDeleteShipment,
  onForceCompleteShipment,
}) {
  const { isEN } = useLanguage()

  const totalShipped = shipments.reduce((sum, s) => sum + s.adet, 0)

  // Group steps by phase (derive from actual step data)
  const phaseMap = new Map()
  steps.forEach((step) => {
    if (!phaseMap.has(step.phase)) {
      phaseMap.set(step.phase, { phase: step.phase, phaseName: step.phase_name, steps: [] })
    }
    phaseMap.get(step.phase).steps.push(step)
  })

  const phases = Array.from(phaseMap.values())
    .sort((a, b) => a.phase - b.phase)
    .map((p) => {
      const sorted = p.steps.sort((a, b) => a.step_order - b.step_order)
      const completed = sorted.filter((s) => s.durum === 'tamamlandi').length
      const total = sorted.length
      const isComplete = total > 0 && completed === total
      return { ...p, steps: sorted, completed, total, isComplete }
    })

  // Phase is locked if previous phase is not complete
  const isPhaseUnlocked = (phaseNum) => {
    if (phaseNum === 1) return true
    const prevPhase = phases.find((p) => p.phase === phaseNum - 1)
    return prevPhase?.isComplete ?? false
  }

  return (
    <div className="flex flex-col gap-6">
      {phases.map(({ phase, phaseName, steps: phaseSteps, completed, total, isComplete }) => {
        const unlocked = isPhaseUnlocked(phase)
        const colors = PHASE_COLORS_BY_NAME[phaseName] || DEFAULT_COLORS
        const label = isEN ? (PHASE_LABELS[phaseName]?.en || phaseName) : (PHASE_LABELS[phaseName]?.tr || phaseName)

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
              {phaseSteps.map((step) => {
                const isShipmentStep = step.step_name === 'Sevkiyat'

                return (
                  <StepItem
                    key={step.id}
                    step={step}
                    canEdit={canEdit}
                    canUntoggle={canUntoggle}
                    isLocked={!unlocked}
                    onToggle={onToggleStep}
                    isShipmentStep={isShipmentStep}
                    shipmentProgress={isShipmentStep ? { shipped: totalShipped, total: job?.adet || 0 } : null}
                    onAddShipment={isShipmentStep ? onAddShipment : undefined}
                    onForceComplete={isShipmentStep ? onForceCompleteShipment : undefined}
                  />
                )
              })}
            </div>

            {/* Shipment list for Lojistik phase */}
            {phaseName === 'Lojistik' && shipments.length > 0 && (
              <ShipmentList
                shipments={shipments}
                jobAdet={job?.adet || 0}
                canDelete={canUntoggle}
                onDelete={onDeleteShipment}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
