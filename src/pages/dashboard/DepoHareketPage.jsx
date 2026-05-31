import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function DepoHareketPage() {
  const { isAdmin } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const musteriId = searchParams.get('mid')
  const cins = searchParams.get('cins')
  const grammage = searchParams.get('gr') ? parseInt(searchParams.get('gr'), 10) : null
  const en = searchParams.get('en') ? parseInt(searchParams.get('en'), 10) : null
  const boy = searchParams.get('boy') ? parseInt(searchParams.get('boy'), 10) : null

  const isPaperMode = !!(cins && grammage && en && boy)

  // Filter params (customer mode only)
  const fCins = searchParams.get('fcins') || ''
  const fGr = searchParams.get('fgr') || ''
  const fEbat = searchParams.get('febat') || ''

  const [movements, setMovements] = useState([])
  const [cariName, setCariName] = useState('')
  const [loading, setLoading] = useState(true)

  // Edit modal state
  const [editingMove, setEditingMove] = useState(null) // { ...movement, direction }
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)
  const [editIrsaliyeFile, setEditIrsaliyeFile] = useState(null)
  const [editFileError, setEditFileError] = useState('')
  const [paperTypes, setPaperTypes] = useState([])
  const [paperGrammages, setPaperGrammages] = useState([])

  const updateParams = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    if (!musteriId) {
      navigate('/panel/depo-stok', { replace: true })
      return
    }

    const fetchData = async () => {
      let entriesQuery = supabase.from('paper_entries').select('*').eq('musteri_id', musteriId)
      let exitsQuery = supabase.from('paper_exits').select('*').eq('musteri_id', musteriId)

      if (isPaperMode) {
        entriesQuery = entriesQuery.eq('paper_type_name', cins).eq('grammage', grammage).eq('en', en).eq('boy', boy)
        exitsQuery = exitsQuery.eq('paper_type_name', cins).eq('grammage', grammage).eq('en', en).eq('boy', boy)
      }

      const [entriesRes, exitsRes, profileRes, typesRes, gramRes] = await Promise.all([
        entriesQuery.order('created_at', { ascending: false }),
        exitsQuery.order('created_at', { ascending: false }),
        supabase.from('profiles').select('full_name, company_name').eq('id', musteriId).single(),
        supabase.from('paper_types').select('*').order('name'),
        supabase.from('paper_grammages').select('*').order('value'),
      ])

      const entryList = (entriesRes.data || []).map((e) => ({ ...e, direction: 'entry' }))
      const exitList = (exitsRes.data || []).map((e) => ({ ...e, direction: 'exit' }))
      const all = [...entryList, ...exitList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setMovements(all)
      setCariName(profileRes.data?.company_name || '-')
      setPaperTypes(typesRes.data || [])
      setPaperGrammages(gramRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [musteriId, cins, grammage, en, boy, navigate])

  const handleDelete = async (id, direction) => {
    if (!window.confirm(isEN ? 'Are you sure you want to delete this movement?' : 'Bu hareketi silmek istediğinize emin misiniz?')) return
    const table = direction === 'exit' ? 'paper_exits' : 'paper_entries'
    await supabase.from(table).delete().eq('id', id)
    setMovements((prev) => prev.filter((m) => !(m.id === id && m.direction === direction)))
  }

  // --- Düzenleme fonksiyonları ---
  const handleStartEdit = (m) => {
    setEditingMove(m)
    setEditForm({
      paper_type_id: m.paper_type_id || '',
      paper_type_name: m.paper_type_name || '',
      grammage: String(m.grammage || ''),
      en: String(m.en || ''),
      boy: String(m.boy || ''),
      tabaka: String(m.tabaka || ''),
      notes: m.notes || '',
      is_emri_no: m.is_emri_no || '',
    })
    setEditIrsaliyeFile(null)
    setEditFileError('')
  }

  const handleEditFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setEditFileError(isEN ? 'Only PDF, PNG, JPG allowed.' : 'Sadece PDF, PNG, JPG yüklenebilir.')
      return
    }
    if (selected.size > MAX_SIZE) {
      setEditFileError(isEN ? 'Max 10MB.' : 'Maksimum 10MB.')
      return
    }
    setEditFileError('')
    setEditIrsaliyeFile(selected)
  }

  const editCalculatedKg = (() => {
    const w = parseInt(editForm.en, 10) || 0
    const h = parseInt(editForm.boy, 10) || 0
    const gr = parseInt(editForm.grammage, 10) || 0
    const tb = parseInt(editForm.tabaka, 10) || 0
    if (w && h && gr && tb) return (w * h * gr * tb) / 10000
    return 0
  })()

  const handleUpdateMove = async (e) => {
    e.preventDefault()
    if (!editingMove || !editForm.grammage || !editForm.en || !editForm.boy || !editForm.tabaka) return

    setEditSaving(true)
    const isEntry = editingMove.direction === 'entry'
    const table = isEntry ? 'paper_entries' : 'paper_exits'
    const selectedType = paperTypes.find((t) => t.id === editForm.paper_type_id)

    let irsaliyePath = editingMove.irsaliye_path || null
    let irsaliyeOriginalName = editingMove.irsaliye_original_name || null

    // Yeni irsaliye yüklendiyse (sadece giriş)
    if (isEntry && editIrsaliyeFile) {
      const fileExt = editIrsaliyeFile.name.split('.').pop()
      const safeName = `${selectedType?.name || 'paper'}-${editForm.grammage}gr`.replace(/[^a-zA-Z0-9_-]/g, '_')
      const newPath = `paper-entries/${musteriId}/${safeName}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('irsaliyeler')
        .upload(newPath, editIrsaliyeFile)

      if (uploadError) {
        setEditFileError(isEN ? `Upload failed: ${uploadError.message}` : `Yükleme başarısız: ${uploadError.message}`)
        setEditSaving(false)
        return
      }

      if (editingMove.irsaliye_path) {
        await supabase.storage.from('irsaliyeler').remove([editingMove.irsaliye_path])
      }

      irsaliyePath = newPath
      irsaliyeOriginalName = editIrsaliyeFile.name
    }

    const updateData = {
      paper_type_id: editForm.paper_type_id || null,
      paper_type_name: selectedType?.name || editForm.paper_type_name || '',
      grammage: parseInt(editForm.grammage, 10),
      en: parseInt(editForm.en, 10),
      boy: parseInt(editForm.boy, 10),
      tabaka: parseInt(editForm.tabaka, 10),
      kg: editCalculatedKg,
      notes: editForm.notes.trim() || null,
    }

    if (isEntry) {
      updateData.irsaliye_path = irsaliyePath
      updateData.irsaliye_original_name = irsaliyeOriginalName
    } else {
      updateData.is_emri_no = editForm.is_emri_no.trim() || null
    }

    const { error } = await supabase.from(table).update(updateData).eq('id', editingMove.id)

    if (error) {
      console.error('Update error:', error)
      setEditSaving(false)
      return
    }

    // State güncelle
    setMovements((prev) =>
      prev.map((m) =>
        m.id === editingMove.id && m.direction === editingMove.direction
          ? { ...m, ...updateData, direction: m.direction }
          : m
      )
    )
    setEditingMove(null)
    setEditSaving(false)
  }

  // Unique filter values (customer mode)
  const allTypes = [...new Set(movements.map((m) => m.paper_type_name))].filter(Boolean).sort()
  const allGrammages = [...new Set(movements.map((m) => m.grammage))].sort((a, b) => a - b)
  const allEbatlar = [...new Set(movements.map((m) => `${m.en}x${m.boy}`))].sort()

  // Filter movements in customer mode
  const filteredMovements = !isPaperMode
    ? movements.filter((m) => {
        if (fCins && m.paper_type_name !== fCins) return false
        if (fGr && m.grammage !== parseInt(fGr, 10)) return false
        if (fEbat && `${m.en}x${m.boy}` !== fEbat) return false
        return true
      })
    : movements

  const activeFilterCount = (!isPaperMode ? [fCins, fGr, fEbat].filter(Boolean).length : 0)

  // Ozet hesaplama
  const totalEntry = filteredMovements.filter((m) => m.direction === 'entry').reduce((s, m) => s + m.tabaka, 0)
  const totalExit = filteredMovements.filter((m) => m.direction === 'exit').reduce((s, m) => s + m.tabaka, 0)
  const totalEntryKg = filteredMovements.filter((m) => m.direction === 'entry').reduce((s, m) => s + Number(m.kg), 0)
  const totalExitKg = filteredMovements.filter((m) => m.direction === 'exit').reduce((s, m) => s + Number(m.kg), 0)
  const netTabaka = totalEntry - totalExit
  const netKg = totalEntryKg - totalExitKg

  // Kumulatif bakiye hesapla (eskiden yeniye) - sadece paper modda anlamli
  const movementsWithBalance = (() => {
    const sorted = [...filteredMovements].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    let runningTabaka = 0
    let runningKg = 0
    const result = sorted.map((m) => {
      if (m.direction === 'entry') {
        runningTabaka += m.tabaka
        runningKg += Number(m.kg)
      } else {
        runningTabaka -= m.tabaka
        runningKg -= Number(m.kg)
      }
      return { ...m, balanceTabaka: runningTabaka, balanceKg: runningKg }
    })
    return result.reverse()
  })()

  const colCount = (isPaperMode ? 9 : 11) + (isAdmin ? 1 : 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        {/* Geri butonu */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {isEN ? 'Back' : 'Geri'}
        </button>

        {/* Baslik karti */}
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">{cariName}</h1>
          {isPaperMode && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{cins}</span>
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{grammage} gr</span>
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{en}x{boy}</span>
            </div>
          )}

          {/* Ozet */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl bg-green-50 p-3">
              <p className="text-xs font-medium text-green-600">{isEN ? 'Total Entry' : 'Toplam Giris'}</p>
              <p className="mt-0.5 text-lg font-bold text-green-700">{formatNumber(totalEntry)}</p>
              <p className="text-xs text-green-600">{formatNumber(Math.round(totalEntryKg * 100) / 100)} kg</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-xs font-medium text-red-500">{isEN ? 'Total Exit' : 'Toplam Cikis'}</p>
              <p className="mt-0.5 text-lg font-bold text-red-600">{formatNumber(totalExit)}</p>
              <p className="text-xs text-red-500">{formatNumber(Math.round(totalExitKg * 100) / 100)} kg</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{isEN ? 'Net Sheets' : 'Net Tabaka'}</p>
              <p className={`mt-0.5 text-lg font-bold ${netTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(netTabaka)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{isEN ? 'Net KG' : 'Net KG'}</p>
              <p className={`mt-0.5 text-lg font-bold ${netKg < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(Math.round(netKg * 100) / 100)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{isEN ? 'Movements' : 'Hareket Sayisi'}</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">{filteredMovements.length}</p>
            </div>
          </div>
        </div>

        {/* Filtreler (sadece musteri modda) */}
        {!isPaperMode && (
          <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[140px]">
                <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Type' : 'Cins'}</label>
                <select value={fCins} onChange={(e) => updateParams('fcins', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
                  <option value="">{isEN ? 'All' : 'Tümü'}</option>
                  {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Grammage' : 'Gramaj'}</label>
                <select value={fGr} onChange={(e) => updateParams('fgr', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
                  <option value="">{isEN ? 'All' : 'Tümü'}</option>
                  {allGrammages.map((g) => <option key={g} value={g}>{g} gr</option>)}
                </select>
              </div>
              <div className="min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Size' : 'Ebat'}</label>
                <select value={fEbat} onChange={(e) => updateParams('febat', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
                  <option value="">{isEN ? 'All' : 'Tümü'}</option>
                  {allEbatlar.map((eb) => <option key={eb} value={eb}>{eb}</option>)}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev)
                      next.delete('fcins')
                      next.delete('fgr')
                      next.delete('febat')
                      return next
                    })
                  }}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {isEN ? 'Clear Filters' : 'Temizle'} ({activeFilterCount})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hareket tablosu */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-700">{isEN ? 'Movement History' : 'Hareket Gecmisi'}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Date' : 'Tarih'}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Time' : 'Saat'}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Direction' : 'Tur'}</th>
                  {!isPaperMode && (
                    <>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Type' : 'Cins'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Gr</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Size' : 'Ebat'}</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Job Order' : 'Is Emri No'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Sheets' : 'Tabaka'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">KG</th>
                  {isPaperMode && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Balance' : 'Bakiye'}</th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Notes' : 'Not'}</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{isEN ? 'Waybill' : 'İrsaliye'}</th>
                  {isAdmin && <th className="px-4 py-3 w-20" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movementsWithBalance.length === 0 ? (
                  <tr><td colSpan={colCount} className="px-4 py-12 text-center text-sm text-slate-400">{isEN ? 'No movements yet' : 'Henuz hareket yok'}</td></tr>
                ) : (
                  <>
                    {movementsWithBalance.map((m) => {
                      const isExit = m.direction === 'exit'
                      const date = new Date(m.created_at)
                      return (
                        <tr key={`${m.direction}-${m.id}`} className="transition hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                            {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                            {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            {isExit
                              ? <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{isEN ? 'Exit' : 'Cikis'}</span>
                              : <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{isEN ? 'Entry' : 'Giris'}</span>
                            }
                          </td>
                          {!isPaperMode && (
                            <>
                              <td className="px-4 py-3 text-slate-700">{m.paper_type_name}</td>
                              <td className="px-4 py-3 text-slate-600">{m.grammage}</td>
                              <td className="px-4 py-3 text-slate-600">{m.en}x{m.boy}</td>
                            </>
                          )}
                          <td className="px-4 py-3 text-slate-600">{m.is_emri_no || '\u2014'}</td>
                          <td className={`px-4 py-3 text-right tabular-nums font-medium ${isExit ? 'text-red-600' : 'text-green-700'}`}>
                            {isExit ? '-' : '+'}{formatNumber(m.tabaka)}
                          </td>
                          <td className={`px-4 py-3 text-right tabular-nums font-semibold ${isExit ? 'text-red-600' : 'text-green-700'}`}>
                            {isExit ? '-' : '+'}{formatNumber(Math.round(Number(m.kg) * 100) / 100)}
                          </td>
                          {isPaperMode && (
                            <td className={`px-4 py-3 text-right tabular-nums font-bold ${m.balanceTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                              {formatNumber(m.balanceTabaka)}
                            </td>
                          )}
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{m.notes || '\u2014'}</td>
                          <td className="px-4 py-3">
                            {m.direction === 'entry' && m.irsaliye_path ? (
                              <button
                                type="button"
                                onClick={async () => {
                                  const w = window.open('', '_blank')
                                  const { data } = await supabase.storage.from('irsaliyeler').createSignedUrl(m.irsaliye_path, 3600)
                                  if (data?.signedUrl) w.location = data.signedUrl
                                  else w.close()
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {isEN ? 'View' : 'Gör'}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-300">{'\u2014'}</span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => handleStartEdit(m)} className="rounded-lg p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-500" title={isEN ? 'Edit' : 'Düzenle'}>
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                </button>
                                <button type="button" onClick={() => handleDelete(m.id, m.direction)} className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500" title={isEN ? 'Delete' : 'Sil'}>
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                    {/* Toplam satiri */}
                    <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                      <td className="px-4 py-3 text-slate-900" colSpan={isPaperMode ? 4 : 7}>{isEN ? 'TOTAL' : 'TOPLAM'}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${netTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(netTabaka)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${netKg < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(Math.round(netKg * 100) / 100)}</td>
                      {isPaperMode && <td className={`px-4 py-3 text-right tabular-nums ${netTabaka < 0 ? 'text-red-600' : 'text-slate-900'}`}>{formatNumber(netTabaka)}</td>}
                      <td /><td />
                      {isAdmin && <td />}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Düzenleme Modalı */}
      {editingMove && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditingMove(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(ev) => ev.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingMove.direction === 'entry'
                  ? (isEN ? 'Edit Paper Entry' : 'Kağıt Girişi Düzenle')
                  : (isEN ? 'Edit Paper Exit' : 'Kağıt Çıkışı Düzenle')
                }
              </h2>
              <button type="button" onClick={() => setEditingMove(null)} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateMove}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Paper Type' : 'Kağıt Cinsi'}</label>
                  <select value={editForm.paper_type_id} onChange={(e) => setEditForm({ ...editForm, paper_type_id: e.target.value })} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                    <option value="">{isEN ? 'Select...' : 'Seçin...'}</option>
                    {paperTypes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Grammage' : 'Gramaj'}</label>
                  <select value={editForm.grammage} onChange={(e) => setEditForm({ ...editForm, grammage: e.target.value })} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                    <option value="">{isEN ? 'Select...' : 'Seçin...'}</option>
                    {paperGrammages.map((g) => (<option key={g.id} value={g.value}>{g.value}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Size (cm)' : 'Ebat (cm)'}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={editForm.en} onChange={(e) => setEditForm({ ...editForm, en: e.target.value })} placeholder={isEN ? 'W' : 'En'} min="1" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
                    <span className="text-sm font-bold text-slate-400">x</span>
                    <input type="number" value={editForm.boy} onChange={(e) => setEditForm({ ...editForm, boy: e.target.value })} placeholder={isEN ? 'H' : 'Boy'} min="1" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Sheets' : 'Tabaka'}</label>
                  <input type="number" value={editForm.tabaka} onChange={(e) => setEditForm({ ...editForm, tabaka: e.target.value })} min="1" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Weight (KG)' : 'Kağıt KG'}</label>
                  <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                    <span className={`text-sm font-bold ${editCalculatedKg > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{editCalculatedKg > 0 ? formatNumber(Math.round(editCalculatedKg * 100) / 100) : '\u2014'}</span>
                    <span className="ml-1 text-xs text-slate-400">kg</span>
                  </div>
                </div>
                {editingMove.direction === 'exit' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Job Order No' : 'İş Emri No'}</label>
                    <input type="text" value={editForm.is_emri_no} onChange={(e) => setEditForm({ ...editForm, is_emri_no: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Notes' : 'Notlar'}</label>
                  <input type="text" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder={isEN ? 'Optional...' : 'İsteğe bağlı...'} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
                </div>
                {editingMove.direction === 'entry' && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Waybill' : 'İrsaliye'}</label>
                    {editingMove.irsaliye_path && !editIrsaliyeFile && (
                      <div className="mb-2 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="truncate font-medium">{editingMove.irsaliye_original_name || (isEN ? 'Uploaded file' : 'Yüklü dosya')}</span>
                      </div>
                    )}
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 transition hover:border-slate-400">
                      <svg className="h-5 w-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="truncate text-sm text-slate-600">
                        {editIrsaliyeFile ? editIrsaliyeFile.name : (isEN ? 'Choose new file (optional)...' : 'Yeni dosya seçin (isteğe bağlı)...')}
                      </span>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleEditFileChange} className="hidden" />
                    </label>
                    {editFileError && <p className="mt-1 text-xs font-medium text-red-500">{editFileError}</p>}
                  </div>
                )}
              </div>
              <div className="mt-5 flex gap-3">
                <button type="submit" disabled={editSaving || editCalculatedKg <= 0} className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 sm:flex-none sm:px-8">
                  {editSaving ? '...' : isEN ? 'Save Changes' : 'Değişiklikleri Kaydet'}
                </button>
                <button type="button" onClick={() => setEditingMove(null)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  {isEN ? 'Cancel' : 'İptal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
