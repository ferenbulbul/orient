import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { id: 'home', label: 'Ana Sayfa', href: '#top', page: 'home' },
  { id: 'about', label: 'Hakkımızda', page: 'about' },
  {
    id: 'services',
    label: 'Hizmetlerimiz',
    href: '#services',
    page: 'services',
    type: 'dropdown',
  },
  { id: 'products', label: 'Neler Üretiyoruz', type: 'mega' },
  { id: 'portfolio', label: 'Çalışmalar', page: 'portfolio' },
  { id: 'contact', label: 'İletişim', page: 'contact' },
]

const SERVICE_DROPDOWN = [
  { id: 'design', label: 'Grafik Tasarım' },
  { id: 'print', label: 'Baskı' },
  { id: 'binding', label: 'Mücellit' },
]

const PRODUCT_MEGA_MENU = [
  { id: 'book', icon: '📘', label: 'Kitap' },
  { id: 'catalog', icon: '📕', label: 'Katalog' },
  { id: 'calendar', icon: '🗓️', label: 'Takvim' },
  { id: 'notebook', icon: '📓', label: 'Ajanda' },
  { id: 'bag', icon: '🛍️', label: 'Karton Çanta' },
  { id: 'magazine', icon: '📰', label: 'Dergi' },
]

function Navbar({ activePage = 'home', onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [hoverMenu, setHoverMenu] = useState(null)
  const [mobileDropdown, setMobileDropdown] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 32)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigate = (link) => {
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(link.page ?? link.id)
    }

    if (link.href && typeof window !== 'undefined') {
      const target = document.querySelector(link.href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if ((link.page ?? link.id) === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (typeof window !== 'undefined' && (link.page ?? link.id) === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const isHomeRoute = location.pathname === '/'
  const shouldUseLightTheme = hasScrolled || !isHomeRoute

  const headerClasses = useMemo(() => {
    if (shouldUseLightTheme) {
      return 'sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-[0_15px_40px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300'
    }
    return 'sticky top-0 z-50 w-full border-b border-transparent bg-white/10 backdrop-blur-xl transition-all duration-300'
  }, [shouldUseLightTheme])
  const innerPadding = hasScrolled ? 'py-3' : 'py-6'
  const logoCircleClass = `flex items-center justify-center rounded-full bg-slate-900 text-white transition-all duration-300 ${
    hasScrolled ? 'h-12 w-12 text-lg' : 'h-16 w-16 text-2xl'
  }`
  const brandTextClass = `text-left transition-all duration-300 ${
    hasScrolled ? 'text-base' : 'text-lg'
  }`

  return (
    <header className={headerClasses}>
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${innerPadding}`}
      >
        <a href="#top" className="flex items-center gap-3">
          <div className={logoCircleClass}>OR</div>
          <div className={brandTextClass}>
            <p
              className={`font-semibold ${
                shouldUseLightTheme ? 'text-slate-900' : 'text-white'
              }`}
            >
              Orient Matbaa
            </p>
            <p
              className={`text-xs uppercase tracking-[0.32em] ${
                shouldUseLightTheme ? 'text-slate-400' : 'text-white/70'
              }`}
            >
              Kurumsal Baskı
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = (link.page ?? link.id) === activePage
            const defaultState = shouldUseLightTheme
              ? 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
            const buttonClasses = `rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : defaultState
            }`

            if (link.type === 'dropdown') {
              return (
                <div
                  key={link.id}
                  className="relative"
                  onMouseEnter={() => setHoverMenu(link.id)}
                  onMouseLeave={() => setHoverMenu(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleNavigate(link)}
                    className={buttonClasses}
                  >
                    {link.label}
                  </button>
                  <div
                    className={`absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl transition-all duration-200 ${
                      hoverMenu === link.id
                        ? 'pointer-events-auto opacity-100 translate-y-0'
                        : 'pointer-events-none opacity-0 -translate-y-2'
                    }`}
                  >
                    {SERVICE_DROPDOWN.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            }

            if (link.type === 'mega') {
              return (
                <div
                  key={link.id}
                  className="relative"
                  onMouseEnter={() => setHoverMenu(link.id)}
                  onMouseLeave={() => setHoverMenu(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleNavigate(link)}
                    className={buttonClasses}
                  >
                    {link.label}
                  </button>
                  <div
                    className={`absolute left-1/2 top-full mt-3 w-[480px] -translate-x-1/2 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl transition-all duration-200 ${
                      hoverMenu === link.id
                        ? 'pointer-events-auto opacity-100 translate-y-0'
                        : 'pointer-events-none opacity-0 -translate-y-2'
                    }`}
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      {PRODUCT_MEGA_MENU.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-left text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="mt-2">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavigate(link)}
                className={buttonClasses}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 lg:hidden ${
            shouldUseLightTheme ? 'border-slate-300 text-slate-900' : 'border-white/60 text-white'
          }`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Menüyü Aç/Kapat"
        >
          Menü
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white/98 px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = (link.page ?? link.id) === activePage

              if (link.type === 'dropdown' || link.type === 'mega') {
                const isOpen = mobileDropdown === link.id
                const items =
                  link.type === 'dropdown' ? SERVICE_DROPDOWN : PRODUCT_MEGA_MENU
                return (
                  <div key={link.id} className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileDropdown((prev) => (prev === link.id ? null : link.id))
                      }
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-base font-semibold transition ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {link.label}
                      <span className="text-sm">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                        <div
                          className={
                            link.type === 'mega'
                              ? 'grid gap-3 sm:grid-cols-2'
                              : 'flex flex-col gap-2'
                          }
                        >
                          {items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="rounded-xl bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700"
                            >
                              {item.icon ? (
                                <span className="flex items-center gap-2">
                                  <span>{item.icon}</span>
                                  <span>{item.label}</span>
                                </span>
                              ) : (
                                item.label
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavigate(link)}
                  className={`rounded-2xl px-4 py-3 text-left text-base font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
