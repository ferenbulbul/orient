const socials = [
  {
    id: 'facebook',
    href: '#',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M13 22v-8h2.5l.5-3H13V8.5c0-.9.3-1.5 1.6-1.5H16V4.3C15.4 4.2 14.2 4 13 4c-2.4 0-4 1.3-4 3.9V11H6v3h3v8h4z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    href: '#',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm9.5 1.8a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    href: '#',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M6.5 6.5A1.75 1.75 0 104.75 4.75 1.75 1.75 0 006.5 6.5zM4 9h5v11H4zm7 0h4.7v1.6h.1c.6-1.1 2-2.3 4-2.3 4.3 0 5.1 2.8 5.1 6.4V20H20v-5c0-1.2 0-2.7-1.7-2.7-1.7 0-2 1.3-2 2.6V20h-5z" />
      </svg>
    ),
  },
]

const LANGUAGES = ['TR', 'EN', 'DE', 'RU']

function TopBar({ onRequestQuote, isVisible = true }) {
  return (
    <div
      className={`fixed top-0 left-0 z-[70] hidden w-full border-b border-slate-900/20 bg-slate-900/95 text-white transition-all duration-200 sm:block ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 text-sm sm:h-12 sm:min-h-[48px] sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4 sm:px-6 sm:py-0">
        <div className="flex w-full flex-wrap items-center gap-3 text-white/80 sm:flex-1 sm:flex-nowrap sm:gap-4">
          <a
            href="tel:+902123334455"
            className="flex items-center gap-2 font-semibold text-white transition hover:text-amber-300"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M6.6 10.8a11.7 11.7 0 0 0 6.6 6.6l1.5-1.5a1 1 0 0 1 1-.25 8.9 8.9 0 0 0 2.8.45 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A15.4 15.4 0 0 1 3 5a1 1 0 0 1 1-1h2.9a1 1 0 0 1 1 1 8.9 8.9 0 0 0 .46 2.8 1 1 0 0 1-.25 1z" />
            </svg>
            +90 212 333 44 55
          </a>
          <span className="hidden h-4 w-px bg-white/20 sm:block" />
          <a
            href="mailto:info@euromatprint.com"
            className="flex items-center gap-2 text-white/80 transition hover:text-amber-300"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
              <path d="m4 7 7.5 5.5c.3.2.7.2 1 0L20 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            info@euromatprint
          </a>
        </div>
        <div className="flex w-full justify-center sm:flex-1">
          <button
            type="button"
            onClick={onRequestQuote}
            className="inline-flex w-full items-center justify-center rounded-full bg-rose-600 px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 sm:w-auto"
          >
            Teklif İste
          </button>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:flex-1 sm:flex-nowrap sm:justify-end sm:gap-4">
          <div className="flex items-center gap-3 text-white/70">
            {socials.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="rounded-full border border-white/10 p-1.5 text-white/70 transition hover:border-white/40 hover:text-white"
              >
                {item.icon}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/15 px-2 py-1 text-xs font-semibold text-white/80">
            {LANGUAGES.map((lang, index) => (
              <button
                key={lang}
                type="button"
                className={`rounded-full px-2 py-0.5 transition ${
                  index === 0 ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar
