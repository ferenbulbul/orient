import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ServicesGrid from './components/ServicesGrid'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'
import Product from './pages/Product'
import './App.css'

const WHY_US = [
  {
    title: 'Uçtan Uca Hizmet',
    description:
      'Tasarım, baskı, kalite kontrol ve sevkiyat süreçlerini tek ekip yönetir.',
  },
  {
    title: 'Şeffaf Planlama',
    description:
      'Her iş için üretim takvimi paylaşır, kritik tarihleri birlikte takip ederiz.',
  },
  {
    title: 'Sürdürülebilir Üretim',
    description:
      'Geri dönüştürülebilir kağıtlar ve düşük israf prensibi ile çalışıyoruz.',
  },
]

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
    if (location.pathname.startsWith('/uretim') && activePage !== 'products') {
      setActivePage('products')
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
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/uretim/:slug" element={<Product />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

function HomePage() {
  return (
    <>
      <Hero />
      <div className="page home-page">
        <ServicesGrid />

        <section className="section">
          <div className="section__heading">
            <p className="eyebrow">Neden Biz?</p>
            <h2>Orient ile iş birliği yapmanın avantajları.</h2>
            <p>
              Uzman üretim kadromuz, modern makine parkurumuz ve sektörel
              deneyimimiz sayesinde, baskı süreçlerinizi güvenle teslim
              edebilirsiniz.
            </p>
          </div>
          <div className="why-grid">
            {WHY_US.map((item) => (
              <article key={item.title} className="card why-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section__heading">
            <p className="eyebrow">Çalışmalarımız</p>
            <h2>Referanslarımızı inceleyin.</h2>
            <p>
              Tamamladığımız baskı projelerinin geniş seçkisine göz atmak için
              çalışmalara özel sayfamızı ziyaret edebilirsiniz.
            </p>
          </div>
          <div className="contact-cta__actions" style={{ marginTop: 24 }}>
            <Link className="btn primary" to="/portfolio">
              Çalışmaları Gör
            </Link>
            <Link className="btn ghost" to="/contact">
              İletişime Geç
            </Link>
          </div>
        </section>

        <section className="section contact-cta" id="contact-cta">
          <div>
            <p className="eyebrow">İletişim</p>
            <h2>Projenizi konuşalım.</h2>
            <p>
              İhtiyaçlarınızı paylaştığınızda, ilgili ekip sizi yeni iletişim
              sayfamız üzerinden yönlendirir ve teklif sürecini başlatır.
            </p>
          </div>
          <div className="contact-cta__actions">
            <Link className="btn primary" to="/contact">
              İletişim Sayfasına Git
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
