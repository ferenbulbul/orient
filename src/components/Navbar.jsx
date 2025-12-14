const NAV_LINKS = [
  { id: 'home', label: 'Ana Sayfa' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'contact', label: 'İletişim' },
]

function Navbar({ activePage, onNavigate }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">Orient</span>
        <small>Matbaa & Tanıtım</small>
      </div>
      <nav className="navbar__links">
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            className={
              link.id === activePage ? 'navbar__link is-active' : 'navbar__link'
            }
            onClick={() => onNavigate(link.id)}
          >
            {link.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export default Navbar
