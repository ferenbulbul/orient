import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

const NAV_LINKS = [
  { id: 'home', label: 'Anasayfa', path: '/' },
  { id: 'corporate', label: 'Kurumsal', type: 'dropdown' },
  { id: 'services', label: 'Hizmetlerimiz', type: 'dropdown' },
  { id: 'parkur', label: 'Parkurumuz', path: '/parkurumuz' },
  { id: 'contact', label: 'İletişim', path: '/iletisim' },
]

const CORPORATE_DROPDOWN = [
  { id: 'about', label: 'Hakkımızda', path: '/kurumsal/hakkimizda' },
  { id: 'vision', label: 'Vizyon', path: '/kurumsal/vizyon' },
  { id: 'mission', label: 'Misyon', path: '/kurumsal/misyon' },
]

const SERVICE_DROPDOWN = [
  { id: 'prepress', label: 'Baskı Öncesi', path: '/hizmetlerimiz/baski-oncesi' },
  { id: 'press', label: 'Baskı', path: '/hizmetlerimiz/baski' },
  { id: 'postpress', label: 'Baskı Sonrası', path: '/hizmetlerimiz/baski-sonrasi' },
]

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
    if (link.id === 'corporate' && currentPath.startsWith('/kurumsal')) {
      return true
    }
    if (link.id === 'services' && currentPath.startsWith('/hizmetlerimiz')) {
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

            if (link.type === 'dropdown') {
              const items = link.id === 'corporate' ? CORPORATE_DROPDOWN : SERVICE_DROPDOWN
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
                      className={`flex flex-col px-3 py-2 ${dividerClass}`}
                    >
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.path) {
                              handleNavigate({ path: item.path })
                            } else if (item.target) {
                              handleNavigate({ sectionTarget: item.target })
                            }
                          }}
                          className={`flex w-full items-center px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${dropdownItemBase}`}
                        >
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

              if (link.type === 'dropdown') {
                const isOpen = mobileDropdown === link.id
                const items = link.id === 'corporate' ? CORPORATE_DROPDOWN : SERVICE_DROPDOWN
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
                                if (item.path) {
                                  handleNavigate({ path: item.path })
                                } else if (item.target) {
                                  handleNavigate({ sectionTarget: item.target })
                                }
                              }}
                              className="flex items-center px-3 py-2.5 text-left text-sm font-semibold text-slate-700"
                            >
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
