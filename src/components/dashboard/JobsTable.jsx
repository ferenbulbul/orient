import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber, formatPrice } from '../../lib/formatters'
import StatusBadge from './StatusBadge'

const STEP_DEFS = [
  { name: 'Doküman Onay', abbr: 'DO' },
  { name: 'Kağıt', abbr: 'KA' },
  { name: 'Bandrol', abbr: 'BA' },
  { name: 'Kapak Baskı', abbr: 'KB' },
  { name: 'İç Baskı', abbr: 'İB' },
  { name: 'Fason', abbr: 'FA' },
  { name: 'Kırım', abbr: 'KR' },
  { name: 'Cilt', abbr: 'Cİ' },
  { name: 'Sevkiyat', abbr: 'SE' },
]

const JOB_TYPE_LABELS = {
  baski: { tr: 'Baskı', en: 'Print' },
  baski_cilt: { tr: 'Baskı Cilt', en: 'Print+Bind' },
  mucellit: { tr: 'Mücellit', en: 'Bindery' },
}

const COLUMN_WIDTHS = {
  jobNo: 120,
  jobName: 220,
  customer: 170,
  jobType: 110,
  qty: 120,
  kalipAdedi: 100,
  due: 140,
  price: 130,
  step: 46,
  status: 140,
}

const MIN_COLUMN_WIDTHS = {
  jobNo: 90,
  jobName: 140,
  customer: 120,
  jobType: 80,
  qty: 90,
  kalipAdedi: 80,
  due: 100,
  price: 100,
  status: 110,
  step: 36,
}

const ALL_COLUMN_WIDTHS = {
  jobNo: COLUMN_WIDTHS.jobNo,
  jobName: COLUMN_WIDTHS.jobName,
  customer: COLUMN_WIDTHS.customer,
  jobType: COLUMN_WIDTHS.jobType,
  qty: COLUMN_WIDTHS.qty,
  kalipAdedi: COLUMN_WIDTHS.kalipAdedi,
  due: COLUMN_WIDTHS.due,
  price: COLUMN_WIDTHS.price,
  status: COLUMN_WIDTHS.status,
}

const ALL_STEP_COLUMN_KEYS = STEP_DEFS.map((s) => `step-${s.abbr}`)
const ALL_STEP_WIDTHS = Object.fromEntries(ALL_STEP_COLUMN_KEYS.map((k) => [k, COLUMN_WIDTHS.step]))
const DEFAULT_COLUMN_WIDTHS = {
  ...ALL_COLUMN_WIDTHS,
  ...ALL_STEP_WIDTHS,
}

const ALL_MIN_WIDTHS = {
  jobNo: MIN_COLUMN_WIDTHS.jobNo,
  jobName: MIN_COLUMN_WIDTHS.jobName,
  customer: MIN_COLUMN_WIDTHS.customer,
  jobType: MIN_COLUMN_WIDTHS.jobType,
  qty: MIN_COLUMN_WIDTHS.qty,
  kalipAdedi: MIN_COLUMN_WIDTHS.kalipAdedi,
  due: MIN_COLUMN_WIDTHS.due,
  price: MIN_COLUMN_WIDTHS.price,
  status: MIN_COLUMN_WIDTHS.status,
}
const ALL_STEP_MIN_WIDTHS = Object.fromEntries(ALL_STEP_COLUMN_KEYS.map((k) => [k, MIN_COLUMN_WIDTHS.step]))
const MIN_WIDTHS = {
  ...ALL_MIN_WIDTHS,
  ...ALL_STEP_MIN_WIDTHS,
}

const PER_PAGE = 50

function isOverdue(job) {
  if (!job.teslim_tarihi || job.durum === 'tamamlandi') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(job.teslim_tarihi) < today
}

export default function JobsTable({ jobs, page, onPageChange, showCustomer = true, showPrice = true, onJobClick, totalCount }) {
  const { isEN } = useLanguage()
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS)
  const dragStateRef = useRef({ key: null, startX: 0, startWidth: 0 })

  const totalItems = totalCount ?? jobs.length
  const totalPages = Math.ceil(totalItems / PER_PAGE)
  const paginated = totalCount != null ? jobs : jobs.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Tablodaki işlerin sahip olduğu adımlara göre sütunları filtrele
  const visibleStepDefs = useMemo(() => {
    const stepNames = new Set()
    jobs.forEach((job) => {
      (job.job_steps || []).forEach((s) => stepNames.add(s.step_name))
    })
    return STEP_DEFS.filter((def) => stepNames.has(def.name))
  }, [jobs])

  const visibleStepKeys = useMemo(() => visibleStepDefs.map((s) => `step-${s.abbr}`), [visibleStepDefs])

  const visibleColumns = useMemo(() => {
    const cols = ['jobNo', 'jobName']
    if (showCustomer) cols.push('customer')
    cols.push('jobType', 'qty', 'kalipAdedi', 'due')
    if (showPrice) cols.push('price')
    cols.push(...visibleStepKeys, 'status')
    return cols
  }, [showCustomer, showPrice, visibleStepKeys])

  const baseWidth = visibleColumns.reduce((sum, key) => sum + (columnWidths[key] || 0), 0)

  useEffect(() => {
    function onMouseMove(e) {
      const { key, startX, startWidth } = dragStateRef.current
      if (!key) return
      const delta = e.clientX - startX
      const min = MIN_WIDTHS[key] || 80
      const next = Math.max(min, startWidth + delta)
      setColumnWidths((prev) => ({ ...prev, [key]: next }))
    }

    function onMouseUp() {
      if (!dragStateRef.current.key) return
      dragStateRef.current = { key: null, startX: 0, startWidth: 0 }
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  function startResize(e, key) {
    e.preventDefault()
    e.stopPropagation()
    dragStateRef.current = {
      key,
      startX: e.clientX,
      startWidth: columnWidths[key] || 100,
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  function renderResizeHandle(columnKey) {
    return (
      <span
        role="separator"
        aria-label="Resize column"
        onMouseDown={(e) => startResize(e, columnKey)}
        className="group absolute -right-1 top-0 z-10 flex h-full w-2 cursor-col-resize select-none items-center justify-center"
      >
        <span className="h-4/5 w-px bg-slate-300 transition-colors group-hover:bg-slate-500" />
      </span>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
        <p className="text-sm text-slate-500">{isEN ? 'No jobs found' : 'İş bulunamadı'}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="mx-auto w-full table-fixed text-left text-sm" style={{ minWidth: baseWidth }}>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="relative whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.jobNo }}>
                <span>{isEN ? 'Job No' : 'İş Emri No'}</span>
                {renderResizeHandle('jobNo')}
              </th>
              <th className="relative px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.jobName }}>
                <span>{isEN ? 'Job Name' : 'İş Adı'}</span>
                {renderResizeHandle('jobName')}
              </th>
              {showCustomer && (
                <th className="relative px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.customer }}>
                  <span>{isEN ? 'Customer' : 'Müşteri'}</span>
                  {renderResizeHandle('customer')}
                </th>
              )}
              <th className="relative whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.jobType }}>
                <span>{isEN ? 'Type' : 'Tip'}</span>
                {renderResizeHandle('jobType')}
              </th>
              <th className="relative whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.qty }}>
                <span>{isEN ? 'Qty' : 'Adet'}</span>
                {renderResizeHandle('qty')}
              </th>
              <th className="relative whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.kalipAdedi }}>
                <span>{isEN ? 'Mold' : 'Kalıp'}</span>
                {renderResizeHandle('kalipAdedi')}
              </th>
              <th className="relative whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.due }}>
                <span>{isEN ? 'Due' : 'Teslim'}</span>
                {renderResizeHandle('due')}
              </th>
              {showPrice && (
                <th className="relative whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.price }}>
                  <span>{isEN ? 'Price' : 'Fiyat'}</span>
                  {renderResizeHandle('price')}
                </th>
              )}
              {visibleStepDefs.map((s) => (
                <th
                  key={s.abbr}
                  className="relative px-1 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  style={{ width: columnWidths[`step-${s.abbr}`] }}
                  title={s.name}
                >
                  <span>{s.abbr}</span>
                  {renderResizeHandle(`step-${s.abbr}`)}
                </th>
              ))}
              <th className="relative whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ width: columnWidths.status }}>
                <span>{isEN ? 'Status' : 'Durum'}</span>
                {renderResizeHandle('status')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((job) => {
              const customerName = job.musteri?.company_name || '-'
              const overdue = isOverdue(job)
              const teslim = job.teslim_tarihi
                ? new Date(job.teslim_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                : '-'
              const steps = job.job_steps || []

              return (
                <tr
                  key={job.id}
                  onClick={() => onJobClick(job.id)}
                  className={`cursor-pointer transition hover:bg-slate-50 ${overdue ? 'border-l-2 border-l-red-400 bg-red-50/30' : ''}`}
                >
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                      {job.is_emri_no}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-3 py-2.5 font-medium text-slate-900">
                    {job.is_adi}
                  </td>
                  {showCustomer && (
                    <td className="max-w-[170px] truncate px-3 py-2.5 text-slate-600">{customerName}</td>
                  )}
                  <td className="whitespace-nowrap px-3 py-2.5 text-center">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {(isEN ? JOB_TYPE_LABELS[job.is_tipi || 'baski_cilt']?.en : JOB_TYPE_LABELS[job.is_tipi || 'baski_cilt']?.tr) || '-'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-center tabular-nums text-slate-700">
                    {formatNumber(job.adet)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-center tabular-nums text-slate-700">
                    {job.kalip_adedi != null ? formatNumber(job.kalip_adedi) : '-'}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-2.5 text-center ${overdue ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                    {teslim}
                  </td>
                  {showPrice && (
                    <td className="whitespace-nowrap px-3 py-2.5 text-left tabular-nums font-medium text-slate-700">
                      {job.fiyat != null ? formatPrice(job.fiyat) : '-'}
                    </td>
                  )}
                  {visibleStepDefs.map((def) => {
                    const step = steps.find((s) => s.step_name === def.name)
                    const done = step?.durum === 'tamamlandi'
                    return (
                      <td key={def.abbr} className="px-1 py-2.5 text-center" style={{ width: columnWidths[`step-${def.abbr}`] }}>
                        {!step ? (
                          <span className="text-slate-200">—</span>
                        ) : done ? (
                          <svg className="mx-auto h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
                        )}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2.5">
                    <StatusBadge durum={job.durum} isEN={isEN} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-500">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalItems)} / {totalItems}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className={`rounded-lg px-2.5 py-1.5 text-sm transition ${page === 1 ? 'cursor-default text-slate-300' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="px-2 text-xs font-medium text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className={`rounded-lg px-2.5 py-1.5 text-sm transition ${page === totalPages ? 'cursor-default text-slate-300' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { isOverdue, STEP_DEFS }
