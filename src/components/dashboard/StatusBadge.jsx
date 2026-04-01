const STATUS_CONFIG = {
  baski_oncesi: {
    label: { tr: 'Baskı Öncesi', en: 'Prepress' },
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  baskida: {
    label: { tr: 'Baskıda', en: 'Printing' },
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  mucellit: {
    label: { tr: 'Mücellit', en: 'Bindery' },
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  lojistik: {
    label: { tr: 'Lojistik', en: 'Logistics' },
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  tamamlandi: {
    label: { tr: 'Tamamlandı', en: 'Completed' },
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
}

export default function StatusBadge({ durum, isEN = false }) {
  const config = STATUS_CONFIG[durum] || STATUS_CONFIG.baski_oncesi

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {isEN ? config.label.en : config.label.tr}
    </span>
  )
}

export { STATUS_CONFIG }
