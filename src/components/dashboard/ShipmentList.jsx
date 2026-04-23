import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import ShipmentItem from './ShipmentItem'

export default function ShipmentList({ shipments, jobAdet, canDelete = false, onDelete }) {
  const { isEN } = useLanguage()
  const totalShipped = shipments.reduce((sum, s) => sum + s.adet, 0)
  const progress = jobAdet > 0 ? Math.min(100, Math.round((totalShipped / jobAdet) * 100)) : 0

  return (
    <div className="mt-2 px-3 pb-3">
      {/* Progress bar */}
      <div className="mb-3 rounded-xl bg-white p-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">
            {formatNumber(totalShipped)} / {formatNumber(jobAdet)} {isEN ? 'shipped' : 'sevk edildi'}
          </span>
          <span className="font-bold text-orange-600">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress >= 100 ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Shipment items */}
      <div className="flex flex-col gap-1">
        {shipments.map((shipment, i) => (
          <ShipmentItem
            key={shipment.id}
            shipment={shipment}
            index={i}
            canDelete={canDelete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
