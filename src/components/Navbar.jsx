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
      setHasScrolled(window.scrollY > 8)
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

  const baseClass =
    'sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur transition shadow-sm'
  const scrolledClass = hasScrolled
    ? 'bg-white/95 shadow-[0_10px_35px_rgba(15,23,42,0.12)]'
    : 'bg-white/80'

  return (
    <header className={`${baseClass} ${scrolledClass}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
            OR
          </div>
          <div className="text-left">
            <p className="text-base font-semibold text-slate-900">Orient Matbaa</p>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Kurumsal Baskı
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = (link.page ?? link.id) === activePage
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavigate(link)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 lg:hidden"
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
