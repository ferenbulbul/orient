import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

export default function PaperSettings() {
  const { isEN } = useLanguage()

  const [types, setTypes] = useState([])
  const [grammages, setGrammages] = useState([])
  const [newType, setNewType] = useState('')
  const [newGrammage, setNewGrammage] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const [{ data: t }, { data: g }] = await Promise.all([
      supabase.from('paper_types').select('*').order('name'),
      supabase.from('paper_grammages').select('*').order('value'),
    ])
    setTypes(t || [])
    setGrammages(g || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleAddType = async (e) => {
    e.preventDefault()
    const name = newType.trim()
    if (!name) return
    const { error } = await supabase.from('paper_types').insert({ name })
    if (error) {
      console.error('Paper type insert error:', error)
      return
    }
    setNewType('')
    fetchData()
  }

  const handleDeleteType = async (id) => {
    await supabase.from('paper_types').delete().eq('id', id)
    fetchData()
  }

  const handleAddGrammage = async (e) => {
    e.preventDefault()
    const value = parseInt(newGrammage, 10)
    if (!value || value <= 0) return
    const { error } = await supabase.from('paper_grammages').insert({ value })
    if (error) {
      console.error('Paper grammage insert error:', error)
      return
    }
    setNewGrammage('')
    fetchData()
  }

  const handleDeleteGrammage = async (id) => {
    await supabase.from('paper_grammages').delete().eq('id', id)
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
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-xl font-bold text-slate-900">
          {isEN ? 'Paper Settings' : 'Kağıt Ayarları'}
        </h1>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Kağıt Cinsleri */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              {isEN ? 'Paper Types' : 'Kağıt Cinsleri'}
            </h2>

            <form onSubmit={handleAddType} className="mb-4 flex gap-2">
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder={isEN ? 'New type name...' : 'Yeni cins adı...'}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {isEN ? 'Add' : 'Ekle'}
              </button>
            </form>

            <div className="flex flex-col gap-1">
              {types.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                  <span className="text-sm font-medium text-slate-700">{t.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteType(t.id)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {types.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400">
                  {isEN ? 'No paper types yet' : 'Henüz kağıt cinsi yok'}
                </p>
              )}
            </div>
          </div>

          {/* Kağıt Gramajları */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              {isEN ? 'Grammages (g/m²)' : 'Gramajlar (g/m²)'}
            </h2>

            <form onSubmit={handleAddGrammage} className="mb-4 flex gap-2">
              <input
                type="number"
                value={newGrammage}
                onChange={(e) => setNewGrammage(e.target.value)}
                placeholder={isEN ? 'e.g. 80' : 'ör. 80'}
                min="1"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {isEN ? 'Add' : 'Ekle'}
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {grammages.map((g) => (
                <div key={g.id} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
                  <span className="text-sm font-medium text-slate-700">{g.value}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteGrammage(g.id)}
                    className="rounded p-0.5 text-slate-400 transition hover:text-red-500"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {grammages.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400 w-full">
                  {isEN ? 'No grammages yet' : 'Henüz gramaj yok'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
