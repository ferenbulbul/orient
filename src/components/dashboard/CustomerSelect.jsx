import { useEffect, useRef, useState } from 'react'
import { supabase, createNewUser } from '../../lib/supabase'
import { sendWelcomeEmail } from '../../lib/email'
import { useLanguage } from '../../context/LanguageContext'
import { formatPhone, phoneToRaw } from '../../lib/formatters'

export default function CustomerSelect({ value, onChange }) {
  const { isEN } = useLanguage()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  // Arama
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  // Yeni müşteri
  const [newName, setNewName] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [errors, setErrors] = useState({})
  const [successInfo, setSuccessInfo] = useState(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, company_name, phone')
        .eq('role', 'musteri')
        .order('full_name')
      setCustomers(data || [])
      setLoading(false)
    }
    fetchCustomers()
  }, [])

  // Dışarı tıklayınca dropdown kapat
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedCustomer = customers.find((c) => c.id === value)

  const filtered = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (c.full_name || '').toLowerCase().includes(q) ||
      (c.company_name || '').toLowerCase().includes(q)
    )
  })

  const handleSelect = (id) => {
    onChange(id)
    setSearch('')
    setIsOpen(false)
  }

  const handlePhoneChange = (val) => {
    setNewPhone(formatPhone(val))
  }

  const handleCreateCustomer = async () => {
    const newErrors = {}
    if (!newName.trim()) {
      newErrors.name = isEN ? 'Name is required' : 'Ad Soyad zorunlu'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newEmail.trim()) {
      newErrors.email = isEN ? 'Email is required' : 'E-posta zorunlu'
    } else if (!emailRegex.test(newEmail.trim())) {
      newErrors.email = isEN ? 'Please enter a valid email address' : 'Geçerli bir e-posta adresi girin (örn: ad@firma.com)'
    }
    if (!newPassword) {
      newErrors.password = isEN ? 'Password is required' : 'Şifre zorunlu'
    } else if (newPassword.length < 6) {
      newErrors.password = isEN ? 'Password must be at least 6 characters' : 'Şifre en az 6 karakter olmalı'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setCreating(true)
    setErrors({})

    const rawPhone = phoneToRaw(newPhone)

    try {
      const { userId } = await createNewUser({
        email: newEmail.trim(),
        password: newPassword,
        full_name: newName.trim(),
        company_name: newCompany.trim(),
        phone: rawPhone,
        role: 'musteri',
      })

      sendWelcomeEmail({
        email: newEmail.trim(),
        name: newName.trim(),
        password: newPassword,
        role: 'musteri',
      })

      const newCustomer = {
        id: userId,
        full_name: newName.trim(),
        company_name: newCompany.trim(),
        phone: rawPhone,
      }
      setCustomers((prev) => [...prev, newCustomer])
      onChange(userId)
      setShowNew(false)
      setSuccessInfo({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
      })
      setTimeout(() => setSuccessInfo(null), 8000)
      setNewName('')
      setNewCompany('')
      setNewEmail('')
      setNewPhone('')
      setNewPassword('')
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setErrors({ email: isEN ? 'This email is already registered' : 'Bu e-posta zaten kayıtlı' })
      } else if (msg.includes('email') || msg.includes('validate')) {
        setErrors({ email: isEN ? 'Invalid email format' : 'Geçersiz e-posta formatı (örn: ad@firma.com)' })
      } else if (msg.includes('password') || msg.includes('Password')) {
        setErrors({ password: isEN ? 'Password must be at least 6 characters' : 'Şifre en az 6 karakter olmalı' })
      } else {
        setErrors({ general: msg || (isEN ? 'Failed to create customer' : 'Müşteri oluşturulamadı') })
      }
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        {/* Searchable dropdown */}
        <div className="relative flex-1" ref={wrapperRef}>
          <input
            type="text"
            value={isOpen ? search : (selectedCustomer ? `${selectedCustomer.full_name}${selectedCustomer.company_name ? ` (${selectedCustomer.company_name})` : ''}` : '')}
            onChange={(e) => {
              setSearch(e.target.value)
              if (!isOpen) setIsOpen(true)
            }}
            onFocus={() => {
              setIsOpen(true)
              setSearch('')
            }}
            placeholder={isEN ? 'Search customer by name...' : 'Müşteri adıyla arayın...'}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />

          {/* Clear button */}
          {value && !isOpen && (
            <button
              type="button"
              onClick={() => { onChange(null); setSearch('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Dropdown list */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400">
                  {isEN ? 'No customers found' : 'Müşteri bulunamadı'}
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                      c.id === value ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <span>
                      {c.full_name}
                      {c.company_name ? (
                        <span className="ml-1.5 text-xs text-slate-400">({c.company_name})</span>
                      ) : null}
                    </span>
                    {c.id === value && (
                      <svg className="h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => { setShowNew((prev) => !prev); setErrors({}) }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {showNew ? (isEN ? 'Cancel' : 'İptal') : (isEN ? '+ New' : '+ Yeni')}
        </button>
      </div>

      {successInfo && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 text-sm">
            <p className="font-medium text-green-800">
              {isEN ? 'Customer created successfully!' : 'Müşteri başarıyla oluşturuldu!'}
            </p>
            <p className="mt-1 text-green-700">
              <span className="font-medium">{successInfo.name}</span> — {successInfo.email}
            </p>
            <p className="mt-0.5 text-xs text-green-600">
              {isEN
                ? `Password: ${successInfo.password} — Welcome email sent.`
                : `Şifre: ${successInfo.password} — Hoşgeldin e-postası gönderildi.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessInfo(null)}
            className="shrink-0 rounded p-1 text-green-500 hover:text-green-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {showNew && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {isEN ? 'Full Name *' : 'Ad Soyad *'}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })) }}
                className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {isEN ? 'Email *' : 'E-posta *'}
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })) }}
                className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {isEN ? 'Password *' : 'Şifre *'}
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })) }}
                placeholder={isEN ? 'Min 6 characters' : 'Min 6 karakter'}
                className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {isEN ? 'Company' : 'Firma'}
              </label>
              <input
                type="text"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {isEN ? 'Phone' : 'Telefon'}
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-2 text-xs text-slate-500">+90</span>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(5XX) XXX XX XX"
                  maxLength={15}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {errors.general && (
            <p className="mt-2 text-xs text-red-600">{errors.general}</p>
          )}

          <button
            type="button"
            onClick={handleCreateCustomer}
            disabled={creating || !newName.trim() || !newEmail.trim() || !newPassword || newPassword.length < 6}
            className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {creating
              ? (isEN ? 'Creating...' : 'Oluşturuluyor...')
              : (isEN ? 'Create Customer' : 'Müşteri Oluştur')}
          </button>
        </div>
      )}
    </div>
  )
}
