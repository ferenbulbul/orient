import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, createNewUser } from '../../lib/supabase'
import { sendWelcomeEmail } from '../../lib/email'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import DashboardLayout from '../../components/dashboard/DashboardLayout'

const ROLE_COLORS = {
  musteri: 'bg-blue-100 text-blue-700',
  personel: 'bg-amber-100 text-amber-700',
  admin: 'bg-purple-100 text-purple-700',
}

// +90 5XX XXX XX XX formatı
const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '')
  // Başında 90 varsa kaldır
  const num = digits.startsWith('90') ? digits.slice(2) : digits
  const limited = num.slice(0, 10)

  if (limited.length === 0) return ''
  if (limited.length <= 3) return `(${limited}`
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
  if (limited.length <= 8) return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)} ${limited.slice(6)}`
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`
}

const phoneToRaw = (formatted) => {
  const digits = formatted.replace(/\D/g, '')
  return digits.length > 0 ? `+90${digits}` : ''
}

const rawToDisplay = (raw) => {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  const num = digits.startsWith('90') ? digits.slice(2) : digits
  return formatPhone(num)
}

export default function UserManagement() {
  const { isEN } = useLanguage()
  const { profile: currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    phone: '',
    role: 'musteri',
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [createdInfo, setCreatedInfo] = useState(null)
  // Düzenleme
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  // Silme onayı
  const [deletingId, setDeletingId] = useState(null)

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Personel seçilince firma otomatik EuromatPrint
      if (field === 'role' && (value === 'personel' || value === 'admin')) {
        next.company_name = 'EuromatPrint'
      }
      if (field === 'role' && value === 'musteri' && prev.company_name === 'EuromatPrint') {
        next.company_name = ''
      }
      return next
    })
  }

  const handlePhoneChange = (value) => {
    setForm((prev) => ({ ...prev, phone: formatPhone(value) }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreatedInfo(null)
    setCreating(true)

    const rawPhone = phoneToRaw(form.phone)

    try {
      await createNewUser({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        company_name: form.company_name.trim(),
        phone: rawPhone,
        role: form.role,
      })

      sendWelcomeEmail({
        email: form.email.trim(),
        name: form.full_name.trim(),
        password: form.password,
        role: form.role,
      })

      const info = {
        email: form.email.trim(),
        password: form.password,
        name: form.full_name.trim(),
        role: form.role,
      }

      setCreatedInfo(info)
      setSuccess(isEN ? 'User created successfully!' : 'Kullanıcı başarıyla oluşturuldu!')
      setForm({ email: '', password: '', full_name: '', company_name: '', phone: '', role: 'musteri' })
      setShowForm(false)
      await fetchUsers()
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError(isEN ? 'This email is already registered' : 'Bu e-posta adresi zaten kayıtlı')
      } else {
        setError(msg || (isEN ? 'Failed to create user' : 'Kullanıcı oluşturulamadı'))
      }
    } finally {
      setCreating(false)
    }
  }

  // Düzenleme başlat
  const startEdit = (user) => {
    setEditingId(user.id)
    setEditForm({
      full_name: user.full_name || '',
      company_name: user.company_name || '',
      phone: rawToDisplay(user.phone),
      role: user.role,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (userId) => {
    setSaving(true)
    const rawPhone = phoneToRaw(editForm.phone)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name.trim(),
        company_name: editForm.company_name.trim() || null,
        phone: rawPhone || null,
        role: editForm.role,
      })
      .eq('id', userId)

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, full_name: editForm.full_name.trim(), company_name: editForm.company_name.trim(), phone: rawPhone, role: editForm.role }
            : u
        )
      )
      setEditingId(null)
    }
    setSaving(false)
  }

  // Silme — auth.users'dan siler, profiles CASCADE ile silinir
  const handleDelete = async (userId) => {
    const { error } = await supabase.rpc('delete_user', { user_id: userId })

    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } else {
      setError(error.message || (isEN ? 'Failed to delete user' : 'Kullanıcı silinemedi'))
    }
    setDeletingId(null)
  }

  const ROLE_TR = { musteri: 'Müşteri', personel: 'Personel', admin: 'Admin' }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/panel')}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {isEN ? 'Back to panel' : 'Panele dön'}
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEN ? 'User Management' : 'Kullanıcı Yönetimi'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {users.length} {isEN ? 'users total' : 'toplam kullanıcı'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm((p) => !p); setCreatedInfo(null) }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {showForm ? (isEN ? 'Cancel' : 'İptal') : (isEN ? 'New User' : 'Yeni Kullanıcı')}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {createdInfo && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="mb-2 text-sm font-semibold text-green-800">{success}</p>
            <div className="rounded-lg bg-white/70 p-3 text-sm text-green-900">
              <p><span className="font-medium">{isEN ? 'Name' : 'İsim'}:</span> {createdInfo.name}</p>
              <p><span className="font-medium">{isEN ? 'Email' : 'E-posta'}:</span> {createdInfo.email}</p>
              <p><span className="font-medium">{isEN ? 'Password' : 'Şifre'}:</span> {createdInfo.password}</p>
              <p><span className="font-medium">{isEN ? 'Role' : 'Rol'}:</span> {ROLE_TR[createdInfo.role]}</p>
            </div>
            <p className="mt-2 text-xs text-green-600">
              {isEN
                ? 'Share these credentials with the user. A welcome email has been sent.'
                : 'Bu bilgileri kullanıcıyla paylaşın. Hoşgeldin emaili gönderildi.'}
            </p>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              {isEN ? 'Create New User' : 'Yeni Kullanıcı Oluştur'}
            </h2>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {isEN ? 'Full Name' : 'Ad Soyad'} *
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {isEN ? 'Email' : 'E-posta'} *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {isEN ? 'Password' : 'Şifre'} *
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={isEN ? 'Min 6 characters' : 'Min 6 karakter'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {isEN ? 'Role' : 'Rol'} *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="musteri">{isEN ? 'Customer' : 'Müşteri'}</option>
                  <option value="personel">{isEN ? 'Staff' : 'Personel'}</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {isEN ? 'Company' : 'Firma'}
                </label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  {isEN ? 'Phone' : 'Telefon'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm text-slate-500">+90</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(5XX) XXX XX XX"
                    maxLength={15}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {creating
                    ? (isEN ? 'Creating...' : 'Oluşturuluyor...')
                    : (isEN ? 'Create User' : 'Kullanıcı Oluştur')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user) => {
              const isEditing = editingId === user.id
              const isDeleting = deletingId === user.id
              const isSelf = user.id === currentUser?.id

              return (
                <div
                  key={user.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200"
                >
                  {isEditing ? (
                    /* ---- DÜZENLEME MODU ---- */
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          {isEN ? 'Full Name' : 'Ad Soyad'}
                        </label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          {isEN ? 'Company' : 'Firma'}
                        </label>
                        <input
                          type="text"
                          value={editForm.company_name}
                          onChange={(e) => setEditForm((p) => ({ ...p, company_name: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          {isEN ? 'Phone' : 'Telefon'}
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-2 text-xs text-slate-500">+90</span>
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                            placeholder="(5XX) XXX XX XX"
                            maxLength={15}
                            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          {isEN ? 'Role' : 'Rol'}
                        </label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        >
                          <option value="musteri">{isEN ? 'Customer' : 'Müşteri'}</option>
                          <option value="personel">{isEN ? 'Staff' : 'Personel'}</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2 sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(user.id)}
                          disabled={saving}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                          {saving ? '...' : isEN ? 'Save' : 'Kaydet'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                          {isEN ? 'Cancel' : 'İptal'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---- GÖRÜNTÜLEME MODU ---- */
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {user.full_name || '-'}
                          </p>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[user.role]}`}>
                            {ROLE_TR[user.role]}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                          {user.company_name && <span>{user.company_name}</span>}
                          {user.phone && <span>+90 {rawToDisplay(user.phone)}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(user)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          title={isEN ? 'Edit' : 'Düzenle'}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>

                        {!isSelf && (
                          isDeleting ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(user.id)}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                              >
                                {isEN ? 'Confirm' : 'Onayla'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                              >
                                {isEN ? 'Cancel' : 'İptal'}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(user.id)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title={isEN ? 'Delete' : 'Sil'}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
