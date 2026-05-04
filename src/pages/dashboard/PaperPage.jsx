import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatNumber } from '../../lib/formatters'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function PaperPage() {
  const { profile, role, isAdmin, canManagePaper } = useAuth()
  const { isEN } = useLanguage()
  const navigate = useNavigate()

  const [tab, setTab] = useState('entry') // 'entry' | 'exit'
  const [types, setTypes] = useState([])
  const [grammages, setGrammages] = useState([])
  const [customers, setCustomers] = useState([])
  const [entries, setEntries] = useState([])
  const [exits, setExits] = useState([])
  const [loading, setLoading] = useState(true)

  // Giriş formu
  const [form, setForm] = useState({
    musteri_id: '',
    paper_type_id: '',
    grammage: '',
    en: '',
    boy: '',
    tabaka: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [irsaliyeFile, setIrsaliyeFile] = useState(null)
  const [fileError, setFileError] = useState('')

  // Çıkış formu
  const [exitForm, setExitForm] = useState({
    musteri_id: '',
    stock_key: '',
    tabaka: '',
    notes: '',
    is_emri_id: '',
  })
  const [exitSaving, setExitSaving] = useState(false)
  const [exitJobs, setExitJobs] = useState([])

  const fetchData = async () => {
    const promises = [
      supabase.from('paper_types').select('*').order('name'),
      supabase.from('paper_grammages').select('*').order('value'),
      supabase.from('paper_entries')
        .select('*, musteri:profiles!paper_entries_musteri_id_fkey(full_name, company_name), paper_type:paper_types!paper_entries_paper_type_id_fkey(name)')
        .order('created_at', { ascending: false }),
      supabase.from('paper_exits')
        .select('*, musteri:profiles!paper_exits_musteri_id_fkey(full_name, company_name), paper_type:paper_types!paper_exits_paper_type_id_fkey(name)')
        .order('created_at', { ascending: false }),
    ]

    promises.push(
      supabase.from('profiles').select('id, full_name, company_name').eq('role', 'musteri').order('full_name')
    )

    const results = await Promise.all(promises)
    setTypes(results[0].data || [])
    setGrammages(results[1].data || [])
    setEntries(results[2].data || [])
    setExits(results[3].data || [])
    if (results[4]) {
      setCustomers(results[4].data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Müşteri değişince çıkış formunu sıfırla + iş emirlerini çek
  const handleExitCustomerChange = async (musteriId) => {
    setExitForm({ musteri_id: musteriId, stock_key: '', tabaka: '', notes: '', is_emri_id: '' })
    if (musteriId) {
      const { data } = await supabase
        .from('jobs')
        .select('id, is_emri_no, is_adi')
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false })
      setExitJobs(data || [])
    } else {
      setExitJobs([])
    }
  }

  // Seçili müşterinin net stok grupları
  const customerStockGroups = (() => {
    if (!exitForm.musteri_id) return []

    const groups = {}

    entries
      .filter((e) => e.musteri_id === exitForm.musteri_id)
      .forEach((e) => {
        const key = `${e.paper_type_id}_${e.grammage}_${e.en}x${e.boy}`
        if (!groups[key]) {
          groups[key] = {
            key,
            paper_type_id: e.paper_type_id,
            paper_type_name: e.paper_type_name,
            grammage: e.grammage,
            en: e.en,
            boy: e.boy,
            totalTabaka: 0,
            totalKg: 0,
          }
        }
        groups[key].totalTabaka += e.tabaka
        groups[key].totalKg += Number(e.kg)
      })

    exits
      .filter((e) => e.musteri_id === exitForm.musteri_id)
      .forEach((e) => {
        const key = `${e.paper_type_id}_${e.grammage}_${e.en}x${e.boy}`
        if (groups[key]) {
          groups[key].totalTabaka -= e.tabaka
          groups[key].totalKg -= Number(e.kg)
        }
      })

    return Object.values(groups).filter((g) => g.totalTabaka > 0)
  })()

  const selectedStock = customerStockGroups.find((g) => g.key === exitForm.stock_key) || null

  // Çıkış KG hesaplama
  const exitCalculatedKg = (() => {
    if (!selectedStock || !exitForm.tabaka) return 0
    const tb = parseInt(exitForm.tabaka, 10) || 0
    if (tb <= 0) return 0
    return (selectedStock.en * selectedStock.boy * selectedStock.grammage * tb) / 10000
  })()

  // Giriş KG hesaplama
  const calculatedKg = (() => {
    const en = parseInt(form.en, 10) || 0
    const boy = parseInt(form.boy, 10) || 0
    const gr = parseInt(form.grammage, 10) || 0
    const tb = parseInt(form.tabaka, 10) || 0
    if (en && boy && gr && tb) return (en * boy * gr * tb) / 10000
    return 0
  })()

  // ---------- İrsaliye dosya seçimi ----------
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError(isEN ? 'Only PDF, PNG, JPG files are allowed.' : 'Sadece PDF, PNG, JPG dosyaları yüklenebilir.')
      return
    }
    if (selected.size > MAX_SIZE) {
      setFileError(isEN ? 'File size must be under 10MB.' : 'Dosya boyutu 10MB altında olmalıdır.')
      return
    }
    setFileError('')
    setIrsaliyeFile(selected)
  }

  // ---------- Giriş ----------
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.musteri_id || !form.paper_type_id || !form.grammage || !form.en || !form.boy || !form.tabaka || !irsaliyeFile) return

    setSaving(true)
    const selectedType = types.find((t) => t.id === form.paper_type_id)

    let filePath = null
    let originalName = null

    if (irsaliyeFile) {
      const fileExt = irsaliyeFile.name.split('.').pop()
      const safeName = `${selectedType?.name || 'paper'}-${form.grammage}gr`.replace(/[^a-zA-Z0-9_-]/g, '_')
      filePath = `paper-entries/${form.musteri_id}/${safeName}_${Date.now()}.${fileExt}`
      originalName = irsaliyeFile.name

      const { error: uploadError } = await supabase.storage
        .from('irsaliyeler')
        .upload(filePath, irsaliyeFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setFileError(isEN ? `Upload failed: ${uploadError.message}` : `Yükleme başarısız: ${uploadError.message}`)
        setSaving(false)
        return
      }
    }

    const { error } = await supabase.from('paper_entries').insert({
      musteri_id: form.musteri_id,
      paper_type_id: form.paper_type_id,
      paper_type_name: selectedType?.name || '',
      grammage: parseInt(form.grammage, 10),
      en: parseInt(form.en, 10),
      boy: parseInt(form.boy, 10),
      tabaka: parseInt(form.tabaka, 10),
      kg: calculatedKg,
      notes: form.notes.trim() || null,
      created_by: profile.id,
      irsaliye_path: filePath,
      irsaliye_original_name: originalName,
    })

    if (error) {
      console.error('Paper entry error:', error)
      if (filePath) await supabase.storage.from('irsaliyeler').remove([filePath])
      setSaving(false)
      return
    }

    setForm({ musteri_id: '', paper_type_id: '', grammage: '', en: '', boy: '', tabaka: '', notes: '' })
    setIrsaliyeFile(null)
    setFileError('')
    setSaving(false)
    fetchData()
  }

  const handleDeleteEntry = async (id) => {
    const entry = entries.find((e) => e.id === id)
    if (entry?.irsaliye_path) {
      await supabase.storage.from('irsaliyeler').remove([entry.irsaliye_path])
    }
    await supabase.from('paper_entries').delete().eq('id', id)
    fetchData()
  }

  // ---------- Çıkış ----------
  const handleExitSubmit = async (e) => {
    e.preventDefault()
    if (!exitForm.musteri_id || !selectedStock || !exitForm.tabaka || !exitForm.is_emri_id) return

    const tb = parseInt(exitForm.tabaka, 10)
    if (tb <= 0 || tb > selectedStock.totalTabaka) return

    setExitSaving(true)

    const selectedJob = exitJobs.find((j) => j.id === exitForm.is_emri_id)
    const { error } = await supabase.from('paper_exits').insert({
      musteri_id: exitForm.musteri_id,
      is_emri_no: selectedJob?.is_emri_no || null,
      paper_type_id: selectedStock.paper_type_id,
      paper_type_name: selectedStock.paper_type_name,
      grammage: selectedStock.grammage,
      en: selectedStock.en,
      boy: selectedStock.boy,
      tabaka: tb,
      kg: exitCalculatedKg,
      notes: exitForm.notes.trim() || null,
      created_by: profile.id,
    })

    if (error) {
      console.error('Paper exit error:', error)
      setExitSaving(false)
      return
    }

    setExitForm({ musteri_id: '', stock_key: '', tabaka: '', notes: '', is_emri_id: '' })
    setExitJobs([])
    setExitSaving(false)
    fetchData()
  }

  const handleDeleteExit = async (id) => {
    await supabase.from('paper_exits').delete().eq('id', id)
    fetchData()
  }

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
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">
            {isEN ? 'Paper Management' : 'Kağıt Yönetimi'}
          </h1>
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/panel/kagit-ayarlari')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isEN ? 'Settings' : 'Ayarlar'}
            </button>
          )}
        </div>

        {/* Tabs */}
        {canManagePaper && (
          <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab('entry')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                tab === 'entry' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isEN ? 'Paper Entry' : 'Kağıt Girişi'}
            </button>
            <button
              type="button"
              onClick={() => setTab('exit')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                tab === 'exit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isEN ? 'Paper Exit' : 'Kağıt Çıkışı'}
            </button>
          </div>
        )}

        {/* ==================== TAB 1: Kağıt Girişi ==================== */}
        {tab === 'entry' && (
          <div>
            {canManagePaper && (
              <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-sm font-semibold text-slate-700">{isEN ? 'New Paper Entry' : 'Yeni Kağıt Girişi'}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Customer' : 'Müşteri'}</label>
                    <select value={form.musteri_id} onChange={(e) => setForm({ ...form, musteri_id: e.target.value })} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                      <option value="">{isEN ? 'Select customer...' : 'Müşteri seçin...'}</option>
                      {customers.map((c) => (<option key={c.id} value={c.id}>{c.full_name}{c.company_name ? ` — ${c.company_name}` : ''}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Paper Type' : 'Kağıt Cinsi'}</label>
                    <select value={form.paper_type_id} onChange={(e) => setForm({ ...form, paper_type_id: e.target.value })} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                      <option value="">{isEN ? 'Select type...' : 'Cins seçin...'}</option>
                      {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Grammage (g/m²)' : 'Gramaj (g/m²)'}</label>
                    <select value={form.grammage} onChange={(e) => setForm({ ...form, grammage: e.target.value })} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                      <option value="">{isEN ? 'Select grammage...' : 'Gramaj seçin...'}</option>
                      {grammages.map((g) => (<option key={g.id} value={g.value}>{g.value}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Size (cm)' : 'Ebat (cm)'}</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} placeholder={isEN ? 'Width' : 'En'} min="1" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
                      <span className="text-sm font-bold text-slate-400">x</span>
                      <input type="number" value={form.boy} onChange={(e) => setForm({ ...form, boy: e.target.value })} placeholder={isEN ? 'Height' : 'Boy'} min="1" required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Sheets' : 'Tabaka'}</label>
                    <input type="number" value={form.tabaka} onChange={(e) => setForm({ ...form, tabaka: e.target.value })} placeholder={isEN ? 'e.g. 20000' : 'ör. 20000'} min="1" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Weight (KG)' : 'Kağıt KG'}</label>
                    <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                      <span className={`text-sm font-bold ${calculatedKg > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{calculatedKg > 0 ? formatNumber(Math.round(calculatedKg * 100) / 100) : '—'}</span>
                      <span className="ml-1 text-xs text-slate-400">kg</span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Notes' : 'Notlar'}</label>
                    <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={isEN ? 'Optional...' : 'İsteğe bağlı...'} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Waybill' : 'İrsaliye'} <span className="text-red-500">*</span></label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 transition hover:border-slate-400">
                      <svg className="h-5 w-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="truncate text-sm text-slate-600">
                        {irsaliyeFile ? irsaliyeFile.name : (isEN ? 'Choose file (PDF, PNG, JPG)...' : 'Dosya seçin (PDF, PNG, JPG)...')}
                      </span>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />
                    </label>
                    {fileError && <p className="mt-1 text-xs font-medium text-red-500">{fileError}</p>}
                  </div>
                </div>
                <button type="submit" disabled={saving || calculatedKg <= 0 || !irsaliyeFile} className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto sm:px-8">
                  {saving ? '...' : isEN ? 'Save' : 'Kaydet'}
                </button>
              </form>
            )}

            {/* Son girişler tablosu */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-700">{isEN ? 'Recent Entries' : 'Son Girişler'}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Date' : 'Tarih'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Customer' : 'Müşteri'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Type' : 'Cins'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Gr</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Size' : 'Ebat'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 text-right">{isEN ? 'Sheets' : 'Tabaka'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 text-right">KG</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Waybill' : 'İrsaliye'}</th>
                      {isAdmin && <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 w-10" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {entries.length === 0 ? (
                      <tr><td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-xs text-slate-400">{isEN ? 'No entries yet' : 'Henüz kayıt yok'}</td></tr>
                    ) : (
                      entries.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(e.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{e.musteri?.company_name || e.musteri?.full_name || '-'}</td>
                          <td className="px-4 py-3 text-slate-700">{e.paper_type_name}</td>
                          <td className="px-4 py-3 text-slate-600">{e.grammage}</td>
                          <td className="px-4 py-3 text-slate-600">{e.en}x{e.boy}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatNumber(e.tabaka)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">{formatNumber(Math.round(Number(e.kg) * 100) / 100)}</td>
                          <td className="px-4 py-3">
                            {e.irsaliye_path ? (
                              <button
                                type="button"
                                onClick={async () => {
                                  const w = window.open('', '_blank')
                                  const { data } = await supabase.storage.from('irsaliyeler').createSignedUrl(e.irsaliye_path, 3600)
                                  if (data?.signedUrl) w.location = data.signedUrl
                                  else w.close()
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {isEN ? 'View' : 'Gör'}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => handleDeleteEntry(e.id)} className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: Kağıt Çıkışı ==================== */}
        {tab === 'exit' && canManagePaper && (
          <div>
            <form onSubmit={handleExitSubmit} className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-semibold text-slate-700">{isEN ? 'New Paper Exit' : 'Yeni Kağıt Çıkışı'}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* 1. Müşteri */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Customer' : 'Müşteri'}</label>
                  <select value={exitForm.musteri_id} onChange={(e) => handleExitCustomerChange(e.target.value)} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                    <option value="">{isEN ? 'Select customer...' : 'Müşteri seçin...'}</option>
                    {customers.map((c) => (<option key={c.id} value={c.id}>{c.full_name}{c.company_name ? ` — ${c.company_name}` : ''}</option>))}
                  </select>
                </div>

                {/* 2. İş Emri Seçimi (Zorunlu) */}
                {exitForm.musteri_id && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Job Order' : 'İş Emri'} <span className="text-red-500">*</span></label>
                    {exitJobs.length === 0 ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {isEN ? 'This customer has no job orders. Paper exit requires a job order.' : 'Bu müşterinin iş emri bulunmuyor. Kağıt çıkışı için iş emri zorunludur.'}
                      </div>
                    ) : (
                      <select value={exitForm.is_emri_id} onChange={(e) => setExitForm({ ...exitForm, is_emri_id: e.target.value })} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                        <option value="">{isEN ? 'Select job order...' : 'İş emri seçin...'}</option>
                        {exitJobs.map((j) => (
                          <option key={j.id} value={j.id}>{j.is_emri_no} — {j.is_adi}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* 3. Stoktan kağıt seç (iş emri varsa göster) */}
                {exitForm.musteri_id && exitJobs.length > 0 && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Select Paper from Stock' : 'Stoktan Kağıt Seçin'}</label>
                    {customerStockGroups.length === 0 ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {isEN ? 'This customer has no paper in stock' : 'Bu müşterinin stokta kağıdı bulunmuyor'}
                      </div>
                    ) : (
                      <select value={exitForm.stock_key} onChange={(e) => setExitForm({ ...exitForm, stock_key: e.target.value, tabaka: '' })} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400">
                        <option value="">{isEN ? 'Select paper...' : 'Kağıt seçin...'}</option>
                        {customerStockGroups.map((g) => (
                          <option key={g.key} value={g.key}>
                            {g.paper_type_name} | {g.grammage}gr | {g.en}x{g.boy}cm — {isEN ? 'Stock' : 'Stok'}: {formatNumber(g.totalTabaka)} {isEN ? 'sheets' : 'tabaka'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* 4. Seçili stok bilgisi + tabaka + not */}
                {selectedStock && (
                  <>
                    <div className="sm:col-span-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-xs text-slate-400">{isEN ? 'Type' : 'Cins'}</span>
                          <p className="font-semibold text-slate-900">{selectedStock.paper_type_name}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">Gr</span>
                          <p className="font-semibold text-slate-900">{selectedStock.grammage}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">{isEN ? 'Size' : 'Ebat'}</span>
                          <p className="font-semibold text-slate-900">{selectedStock.en}x{selectedStock.boy}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">{isEN ? 'Available' : 'Mevcut Stok'}</span>
                          <p className="font-bold text-green-700">{formatNumber(selectedStock.totalTabaka)} {isEN ? 'sheets' : 'tabaka'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">KG</span>
                          <p className="font-bold text-green-700">{formatNumber(Math.round(selectedStock.totalKg * 100) / 100)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Sheets to Exit' : 'Çıkış Tabaka'}</label>
                      <input type="number" value={exitForm.tabaka} onChange={(e) => setExitForm({ ...exitForm, tabaka: e.target.value })} placeholder={`${isEN ? 'Max' : 'Maks'} ${formatNumber(selectedStock.totalTabaka)}`} min="1" max={selectedStock.totalTabaka} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
                      {exitForm.tabaka && parseInt(exitForm.tabaka, 10) > selectedStock.totalTabaka && (
                        <p className="mt-1 text-xs font-medium text-red-500">{isEN ? 'Cannot exceed available stock!' : 'Stoktan fazla çıkış yapılamaz!'}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Weight (KG)' : 'Kağıt KG'}</label>
                      <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                        <span className={`text-sm font-bold ${exitCalculatedKg > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                          {exitCalculatedKg > 0 ? `- ${formatNumber(Math.round(exitCalculatedKg * 100) / 100)}` : '—'}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">kg</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-slate-500">{isEN ? 'Notes' : 'Notlar'}</label>
                      <input type="text" value={exitForm.notes} onChange={(e) => setExitForm({ ...exitForm, notes: e.target.value })} placeholder={isEN ? 'Optional...' : 'İsteğe bağlı...'} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
                    </div>
                  </>
                )}
              </div>

              {selectedStock && (
                <button type="submit" disabled={exitSaving || !exitForm.is_emri_id || !exitForm.tabaka || parseInt(exitForm.tabaka, 10) <= 0 || parseInt(exitForm.tabaka, 10) > selectedStock.totalTabaka} className="mt-5 w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 sm:w-auto sm:px-8">
                  {exitSaving ? '...' : isEN ? 'Record Exit' : 'Çıkış Kaydet'}
                </button>
              )}
            </form>

            {/* Son çıkışlar tablosu */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-700">{isEN ? 'Recent Exits' : 'Son Çıkışlar'}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Date' : 'Tarih'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Customer' : 'Müşteri'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Job Order' : 'İş Emri No'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Type' : 'Cins'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Gr</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{isEN ? 'Size' : 'Ebat'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 text-right">{isEN ? 'Sheets' : 'Tabaka'}</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 text-right">KG</th>
                      {isAdmin && <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 w-10" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {exits.length === 0 ? (
                      <tr><td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-xs text-slate-400">{isEN ? 'No exits yet' : 'Henüz çıkış kaydı yok'}</td></tr>
                    ) : (
                      exits.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(e.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{e.musteri?.company_name || e.musteri?.full_name || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{e.is_emri_no || '—'}</td>
                          <td className="px-4 py-3 text-slate-700">{e.paper_type_name}</td>
                          <td className="px-4 py-3 text-slate-600">{e.grammage}</td>
                          <td className="px-4 py-3 text-slate-600">{e.en}x{e.boy}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium text-red-600">-{formatNumber(e.tabaka)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-red-600">-{formatNumber(Math.round(Number(e.kg) * 100) / 100)}</td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => handleDeleteExit(e.id)} className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
