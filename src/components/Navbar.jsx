import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

const NAV_LINKS = [
  { id: 'home', label: 'Ana Sayfa', target: 'home' },
  { id: 'about', label: 'Hakkımızda', path: '/about' },
  {
    id: 'services',
    label: 'Hizmetlerimiz',
    target: 'services',
    type: 'dropdown',
  },
  {
    id: 'products',
    label: 'Neler Üretiyoruz',
    target: 'products',
    type: 'mega',
  },
  { id: 'machine', label: 'Makine Parkuru', path: '/makine-parkuru' },
  { id: 'portfolyo', label: 'Portfolyo', path: '/portfolyo' },
  { id: 'contact', label: 'İletişim', path: '/contact' },
]

const SERVICE_DROPDOWN = [
  { id: 'design', label: 'Grafik Tasarım', path: '/hizmetler/grafik-tasarim', icon: 'design' },
  { id: 'print', label: 'Baskı', path: '/hizmetler/baski', icon: 'print' },
  { id: 'binding', label: 'Mücellit', path: '/hizmetler/mucellit', icon: 'binding' },
]

const PRODUCT_MEGA_MENU = [
  { id: 'book', slug: 'kitap', label: 'Kitap', icon: 'book' },
  { id: 'catalog', slug: 'katalog', label: 'Katalog', icon: 'catalog' },
  { id: 'calendar', slug: 'takvim', label: 'Takvim', icon: 'calendar' },
  { id: 'notebook', slug: 'ajanda', label: 'Ajanda', icon: 'notebook' },
  { id: 'bag', slug: 'karton-canta', label: 'Karton Çanta', icon: 'bag' },
  { id: 'magazine', slug: 'dergi', label: 'Dergi', icon: 'magazine' },
]

const PRODUCT_ICONS = {
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4 19a2 2 0 0 1 2-2h13" />
      <path d="M6 5h13v14" />
      <path d="M6 5a2 2 0 0 0-2 2v12" />
      <path d="M10 8h6" />
      <path d="M10 12h4" />
    </svg>
  ),
  catalog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h5" />
      <path d="M8 16h7" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  ),
  notebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="6" y="3" width="12" height="18" rx="1.8" />
      <path d="M9.5 7h5" />
      <path d="M9.5 11h5" />
      <path d="M9.5 15h3" />
      <path d="M6 7h-1" />
      <path d="M6 11h-1" />
      <path d="M6 15h-1" />
    </svg>
  ),
  bag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M7 7V6a5 5 0 0 1 10 0v1" />
      <rect x="4" y="7" width="16" height="13" rx="2" />
      <path d="M10 11v2" />
      <path d="M14 11v2" />
    </svg>
  ),
  magazine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M6 4h11a3 3 0 0 1 3 3v11" />
      <path d="M6 20h12a2 2 0 0 0 2-2V7" />
      <path d="M6 4v16a2 2 0 0 0 2 2" />
      <path d="M8 8h5" />
      <path d="M8 12h3" />
      <path d="M8 16h4" />
    </svg>
  ),
}

const SERVICE_ICONS = {
  design: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4z" />
      <path d="M13.5 6.5 17 10" />
    </svg>
  ),
  print: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8V4h10v4" />
      <rect x="5" y="11" width="14" height="7" rx="2" />
      <path d="M7 15h10" />
    </svg>
  ),
  binding: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="12" height="18" rx="2" />
      <path d="M16 7h2a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H9" />
      <path d="M8 7h4" />
      <path d="M8 11h4" />
    </svg>
  ),
}

function Navbar({ activeSection = 'home', onNavigate, topOffsetClass = 'top-10' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [hoverMenu, setHoverMenu] = useState(null)
  const [mobileDropdown, setMobileDropdown] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const hoverTimers = useRef({ open: null, close: null })
  const currentPath = location.pathname

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 32)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(hoverTimers.current.open)
      clearTimeout(hoverTimers.current.close)
    }
  }, [])

  const handleHoverEnter = (id, instant = false) => {
    clearTimeout(hoverTimers.current.close)
    if (instant) {
      clearTimeout(hoverTimers.current.open)
      setHoverMenu(id)
      return
    }
    hoverTimers.current.open = setTimeout(() => {
      setHoverMenu(id)
    }, 160)
  }

  const handleHoverLeave = () => {
    clearTimeout(hoverTimers.current.open)
    hoverTimers.current.close = setTimeout(() => {
      setHoverMenu(null)
    }, 160)
  }

  const closeMenus = () => {
    setIsMenuOpen(false)
    setHoverMenu(null)
    setMobileDropdown(null)
  }

  const handleNavigate = (link) => {
    if (link?.slug) {
      navigate(`/urunler/${link.slug}`)
      closeMenus()
      return
    }

    if (link?.path) {
      if (currentPath !== link.path) {
        navigate(link.path)
      }
      closeMenus()
      return
    }

    if (link?.sectionTarget && onNavigate) {
      if (currentPath !== '/') {
        navigate('/')
        setTimeout(() => {
          onNavigate(link.sectionTarget)
        }, 220)
      } else {
        onNavigate(link.sectionTarget)
      }
      closeMenus()
      return
    }

    if (onNavigate && typeof onNavigate === 'function' && link?.target) {
      onNavigate(link.target)
    }

    closeMenus()
  }

  const isHomeRoute = location.pathname === '/'
  const shouldUseLightTheme = hasScrolled || !isHomeRoute

  const headerClasses = useMemo(() => {
    if (shouldUseLightTheme) {
      return `sticky ${topOffsetClass} z-50 w-full border-b border-slate-100 bg-white/95 shadow-[0_15px_40px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300`
    }
    return `sticky ${topOffsetClass} z-50 w-full border-b border-transparent bg-white/10 backdrop-blur-xl transition-all duration-300`
  }, [shouldUseLightTheme, topOffsetClass])
  const innerPadding = hasScrolled ? 'py-3' : 'py-6'
 
  const dropdownPanelBase = shouldUseLightTheme
    ? 'border-slate-100 bg-white text-slate-700 shadow-xl'
    : 'border-white/10 bg-slate-900/85 text-white shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur'
  const dropdownItemBase = shouldUseLightTheme
    ? 'text-slate-700 hover:bg-slate-100'
    : 'text-white hover:bg-white/10'
  const dividerClass = shouldUseLightTheme
    ? 'divide-y divide-slate-100'
    : 'divide-y divide-white/10'
  const isLinkActive = (link) => {
    if (link.path) {
      return currentPath === link.path
    }
    if (link.id === 'products' && currentPath.startsWith('/urunler')) {
      return true
    }
    if (link.id === 'services' && currentPath.startsWith('/hizmetler')) {
      return true
    }
    if (!link.path && currentPath === '/' && activeSection) {
      return activeSection === (link.target ?? link.id)
    }
    return false
  }

  return (
    <header className={headerClasses}>
      <div className={`flex w-full items-center justify-between px-4 sm:px-6 transition-all duration-300 ${innerPadding}`}>
        <a href="#top" className="flex items-center gap-3 pl-4 sm:pl-6 lg:pl-8">
          <img
            src={logo}
            alt="Euromat Print"
            className={`h-10 w-auto flex-shrink-0 ${shouldUseLightTheme ? '' : 'brightness-0 invert'}`}
          />
        </a>

        <nav className="hidden items-center gap-1.5 whitespace-nowrap lg:flex lg:flex-nowrap">
          {NAV_LINKS.map((link) => {
            const isActive = isLinkActive(link)
            const defaultState = shouldUseLightTheme
              ? 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
            const buttonClasses = `rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              isActive
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : defaultState
            }`

            if (link.type === 'dropdown' || link.type === 'mega') {
              const items =
                link.type === 'dropdown' ? SERVICE_DROPDOWN : PRODUCT_MEGA_MENU
              return (
                <div
                  key={link.id}
                  className="relative"
                  onMouseEnter={() => handleHoverEnter(link.id)}
                  onMouseLeave={handleHoverLeave}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setHoverMenu((prev) => (prev === link.id ? null : link.id))
                    }
                    className={buttonClasses}
                  >
                    {link.label}
                  </button>
                  <div
                    className={`absolute left-0 top-full mt-3 min-w-[280px] rounded-2xl border ${dropdownPanelBase} ${
                      hoverMenu === link.id
                        ? 'pointer-events-auto opacity-100 translate-y-0'
                        : 'pointer-events-none opacity-0 -translate-y-1.5'
                    }`}
                  >
                    <div
                      className={`flex flex-col px-3 py-2 ${
                        link.type === 'mega'
                          ? `divide-y ${
                              shouldUseLightTheme ? 'divide-slate-100' : 'divide-white/10'
                            }`
                          : dividerClass
                      }`}
                    >
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (link.type === 'mega') {
                              handleNavigate({ page: 'products', slug: item.slug })
                              return
                            }
                            if (link.type === 'dropdown') {
                              if (item.path) {
                                handleNavigate({ path: item.path })
                              } else if (item.target) {
                                handleNavigate({ sectionTarget: item.target })
                              }
                            }
                          }}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${dropdownItemBase}`}
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                              shouldUseLightTheme
                                ? 'border-slate-200 bg-slate-50 text-slate-500'
                                : 'border-white/20 bg-white/5 text-white/80'
                            }`}
                          >
                            {link.type === 'mega'
                              ? PRODUCT_ICONS[item.icon] ?? PRODUCT_ICONS.book
                              : SERVICE_ICONS[item.icon] ?? <span className="h-2 w-2 rounded-full bg-current" />}
                          </span>
                          <span className="flex-1 text-left">{item.label}</span>
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
              const isActive = isLinkActive(link)

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
                      <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_15px_35px_rgba(15,23,42,0.08)]">
                        <div className="flex flex-col divide-y divide-slate-100">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                if (link.type === 'mega') {
                                  handleNavigate({ page: 'products', slug: item.slug })
                                  return
                                }
                                if (link.type === 'dropdown') {
                                  if (item.path) {
                                    handleNavigate({ path: item.path })
                                  } else if (item.target) {
                                    handleNavigate({ sectionTarget: item.target })
                                  }
                                }
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-700"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                                {link.type === 'mega'
                                  ? PRODUCT_ICONS[item.icon] ?? PRODUCT_ICONS.book
                                  : SERVICE_ICONS[item.icon] ?? <span className="h-2 w-2 rounded-full bg-current" />}
                              </span>
                              <span>{item.label}</span>
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
