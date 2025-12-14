import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'
import './App.css'

const SECTION_TARGETS = {
  home: '#top',
  services: '#services',
}

const ROUTE_TARGETS = {
  about: '/about',
  portfolio: '/portfolio',
  contact: '/contact',
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [pendingSection, setPendingSection] = useState(null)
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/about' && activePage !== 'about') {
      setActivePage('about')
      return
    }
    if (location.pathname === '/portfolio' && activePage !== 'portfolio') {
      setActivePage('portfolio')
      return
    }
    if (location.pathname === '/contact' && activePage !== 'contact') {
      setActivePage('contact')
      return
    }
    if (location.pathname === '/' && pendingSection) {
      setActivePage(pendingSection)
      setPendingSection(null)
      return
    }
    if (
      location.pathname === '/' &&
      !pendingSection &&
      !['home', 'services'].includes(activePage)
    ) {
      setActivePage('home')
    }
  }, [location.pathname, pendingSection, activePage])

  useEffect(() => {
    if (location.pathname === '/' && pendingScrollTarget) {
      requestAnimationFrame(() => {
        scrollToAnchor(pendingScrollTarget)
      })
      setPendingScrollTarget(null)
    }
  }, [location.pathname, pendingScrollTarget])

  const scrollToAnchor = (selector) => {
    if (typeof window === 'undefined') {
      return
    }
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
  }

  const handleNavigate = (target) => {
    const routeTarget = ROUTE_TARGETS[target]
    if (routeTarget) {
      if (location.pathname !== routeTarget) {
        navigate(routeTarget)
      }
      setActivePage(target)
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
    scrollToAnchor(anchor)
  }

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={handleNavigate} />
      <main className="content-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
