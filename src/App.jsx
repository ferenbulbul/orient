import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ProductShowcase from './components/ProductShowcase'
import ScrollToTop from './components/ScrollToTop'
import TopBar from './components/TopBar'
import QuoteModal from './components/QuoteModal'
import { BRAND_LOGOS } from './data/brands'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import Portfolyo from './pages/Portfolyo'
import Contact from './pages/Contact'
import MachinePark from './pages/MachinePark'
import ProductCategory from './pages/ProductCategory'
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
  services: '#product-band',
  products: '#product-band',
}

const FEATURED_BRANDS = BRAND_LOGOS.slice(0, 5)

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [pendingSection, setPendingSection] = useState(null)
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/' && pendingSection) {
      setActiveSection(pendingSection)
      setPendingSection(null)
      return
    }
    if (location.pathname !== '/') {
      setActiveSection('home')
    }
  }, [location.pathname, pendingSection])

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
    const anchor = SECTION_TARGETS[target] ?? '#top'

    if (location.pathname !== '/') {
      setPendingSection(target)
      setPendingScrollTarget(anchor)
      navigate('/')
      return
    }

    setActiveSection(target)
    scrollToAnchor(anchor)
  }

  const openQuoteModal = () => setIsQuoteModalOpen(true)

  return (
    <div className="app-shell">
      <ScrollToTop />
      <TopBar onRequestQuote={openQuoteModal} />
      <Navbar
        activeSection={location.pathname === '/' ? activeSection : null}
        onNavigate={handleNavigate}
      />
      <main className="content-area">
        <Routes>
          <Route path="/" element={<HomePage onOpenQuoteModal={openQuoteModal} />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolyo" element={<Portfolyo />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/makine-parkuru" element={<MachinePark />} />
          <Route path="/urunler/:slug" element={<ProductCategory />} />
          <Route path="*" element={<HomePage onOpenQuoteModal={openQuoteModal} />} />
        </Routes>
      </main>
      <Footer />
      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  )
}

export default App

function HomePage({ onOpenQuoteModal }) {
  return (
    <>
      <Hero onOpenQuoteModal={onOpenQuoteModal} />
      <div className="page home-page">
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
      </div>
      <ProductShowcase />
      <div className="page home-page">
        <section className="section">
          <div className="section__heading">
            <p className="eyebrow">Birlikte Çalıştığımız Markalar</p>
            <h2>Tüm portfolyomuzdan seçkiler.</h2>
            <p>
              Yıllar içinde büyüttüğümüz kurumsal müşteri ağımızın bir bölümünü aşağıda görebilirsiniz.
              Tam liste için portfolyo sayfamızı ziyaret edebilirsiniz.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {FEATURED_BRANDS.map((brand) => (
              <Link
                key={brand.id}
                to="/portfolyo"
                className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.12)]"
                aria-label={`${brand.name} portfolyo kartı`}
              >
                <div className="aspect-square p-4">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logosu`}
                    className="h-full w-full object-contain transition duration-400 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link className="btn primary" to="/portfolyo">
              Tüm Portfolyoyu Gör
            </Link>
          </div>
        </section>
      </div>
      <div className="page home-page">
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
