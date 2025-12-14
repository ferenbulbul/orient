import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Contact from './pages/Contact'
import About from './pages/About'
import './App.css'

const PAGE_COMPONENTS = {
  home: <Home />,
  services: <Services />,
  contact: <Contact />,
}

const SECTION_TARGETS = {
  home: '#top',
  services: '#services',
  works: '#portfolio',
  contact: '#contact-cta',
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [pendingSection, setPendingSection] = useState(null)
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/about') {
      setActivePage('about')
      return
    }

    if (location.pathname === '/' && pendingSection) {
      setActivePage(pendingSection)
      setPendingSection(null)
      return
    }

    if (location.pathname === '/' && activePage === 'about') {
      setActivePage('home')
    }
  }, [location.pathname, pendingSection, activePage])

  useEffect(() => {
    if (location.pathname === '/' && pendingScrollTarget) {
      requestAnimationFrame(() => {
        const selector = pendingScrollTarget
        if (!selector || selector === '#top') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        const target = document.querySelector(selector)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
      setPendingScrollTarget(null)
    }
  }, [location.pathname, pendingScrollTarget])

  const handleNavigate = (target) => {
    if (target === 'about') {
      if (location.pathname !== '/about') {
        navigate('/about')
      }
      setActivePage('about')
      return
    }

    const anchor = SECTION_TARGETS[target] ?? '#top'

    if (location.pathname !== '/') {
      setPendingSection(target)
      setPendingScrollTarget(anchor)
      navigate('/')
      return
    }

    setActivePage(target)
  }

  const currentPage = useMemo(
    () => PAGE_COMPONENTS[activePage] ?? <Home />,
    [activePage],
  )

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={handleNavigate} />
      <main className="content-area">
        <Routes>
          <Route path="/" element={currentPage} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
