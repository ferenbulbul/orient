import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { id: 'home', label: 'Ana Sayfa', href: '#top', page: 'home' },
  { id: 'about', label: 'Hakkımızda', page: 'about' },
  { id: 'services', label: 'Hizmetler', href: '#services', page: 'services' },
  { id: 'portfolio', label: 'Çalışmalar', page: 'portfolio' },
  { id: 'contact', label: 'İletişim', page: 'contact' },
]

function Navbar({ activePage = 'home', onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

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

  const headerClasses = `sticky top-0 z-50 w-full border-b transition-all duration-300 ${
    hasScrolled
      ? 'border-white/40 bg-white/90 shadow-[0_15px_40px_rgba(15,23,42,0.15)] backdrop-blur-md'
      : 'border-transparent bg-white/10 backdrop-blur-xl'
  }`
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
                hasScrolled ? 'text-slate-900' : 'text-white'
              }`}
            >
              Orient Matbaa
            </p>
            <p
              className={`text-xs uppercase tracking-[0.32em] ${
                hasScrolled ? 'text-slate-400' : 'text-white/70'
              }`}
            >
              Kurumsal Baskı
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = (link.page ?? link.id) === activePage
            const defaultState = hasScrolled
              ? 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavigate(link)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : defaultState
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 lg:hidden ${
            hasScrolled ? 'border-slate-300 text-slate-900' : 'border-white/60 text-white'
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
