import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import logo from '../../assets/logo.svg'

const NAV_ITEMS = {
  musteri: [
    { id: 'jobs', path: '/panel', label: { tr: 'İşlerim', en: 'My Jobs' }, icon: 'clipboard' },
  ],
  personel: [
    { id: 'jobs', path: '/panel', label: { tr: 'Tüm İşler', en: 'All Jobs' }, icon: 'clipboard' },
    { id: 'new-job', path: '/panel/yeni-is', label: { tr: 'Yeni İş', en: 'New Job' }, icon: 'plus' },
  ],
  admin: [
    { id: 'jobs', path: '/panel', label: { tr: 'Tüm İşler', en: 'All Jobs' }, icon: 'clipboard' },
    { id: 'reports', path: '/panel/raporlar', label: { tr: 'Raporlar', en: 'Reports' }, icon: 'chart' },
    { id: 'new-job', path: '/panel/yeni-is', label: { tr: 'Yeni İş', en: 'New Job' }, icon: 'plus' },
    { id: 'users', path: '/panel/kullanicilar', label: { tr: 'Kullanıcılar', en: 'Users' }, icon: 'users' },
  ],
  moderator: [
    { id: 'jobs', path: '/panel', label: { tr: 'Tüm İşler', en: 'All Jobs' }, icon: 'clipboard' },
    { id: 'reports', path: '/panel/raporlar', label: { tr: 'Raporlar', en: 'Reports' }, icon: 'chart' },
  ],
}

const ICONS = {
  clipboard: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  plus: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  chart: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  logout: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
}

export default function DashboardSidebar({ isOpen, onClose }) {
  const { profile, role, signOut } = useAuth()
  const { isEN } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const items = NAV_ITEMS[role] || NAV_ITEMS.musteri

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const ROLE_LABELS = {
    musteri: isEN ? 'Customer' : 'Müşteri',
    personel: isEN ? 'Staff' : 'Personel',
    admin: 'Admin',
    moderator: isEN ? 'Moderator' : 'Moderatör',
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-slate-100 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <img src={logo} alt="Euromat Print" className="h-8 w-auto" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.path)
                    onClose()
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {ICONS[item.icon]}
                  {isEN ? item.label.en : item.label.tr}
                </button>
              )
            })}
          </div>
        </nav>

        {/* User info + sign out */}
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="mb-3 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              {profile?.full_name || (isEN ? 'User' : 'Kullanıcı')}
            </p>
            <p className="text-xs text-slate-500">
              {ROLE_LABELS[role] || role}
              {profile?.company_name ? ` · ${profile.company_name}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            {ICONS.logout}
            {isEN ? 'Sign Out' : 'Çıkış Yap'}
          </button>
        </div>
      </aside>
    </>
  )
}
