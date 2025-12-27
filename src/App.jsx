import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ProductShowcase from "./components/ProductShowcase";
import ScrollToTop from "./components/ScrollToTop";
import TopBar from "./components/TopBar";
import QuoteModal from "./components/QuoteModal";
import { BRAND_LOGOS } from "./data/brands";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Portfolyo from "./pages/Portfolyo";
import Contact from "./pages/Contact";
import MachinePark from "./pages/MachinePark";
import ProductCategory from "./pages/ProductCategory";
import GraphicDesign from "./pages/GraphicDesign";
import Printing from "./pages/Printing";
import Binding from "./pages/Binding";
import "./App.css";

const WHY_US = [
  {
    title: "Uçtan Uca Hizmet",
    description:
      "Tasarım, baskı, kalite kontrol ve sevkiyat süreçlerini tek ekip yönetir.",
  },
  {
    title: "Şeffaf Planlama",
    description:
      "Her iş için üretim takvimi paylaşır, kritik tarihleri birlikte takip ederiz.",
  },
  {
    title: "Sürdürülebilir Üretim",
    description:
      "Geri dönüştürülebilir kağıtlar ve düşük israf prensibi ile çalışıyoruz.",
  },
];

const SECTION_TARGETS = {
  home: "#top",
  services: "#product-band",
  products: "#product-band",
};

const FEATURED_BRANDS = BRAND_LOGOS.slice(0, 5);

function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [pendingSection, setPendingSection] = useState(null);
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/" && pendingSection) {
      setActiveSection(pendingSection);
      setPendingSection(null);
      return;
    }
    if (location.pathname !== "/") {
      setActiveSection("home");
    }
  }, [location.pathname, pendingSection]);

  useEffect(() => {
    if (location.pathname === "/" && pendingScrollTarget) {
      requestAnimationFrame(() => {
        scrollToAnchor(pendingScrollTarget);
      });
      setPendingScrollTarget(null);
    }
  }, [location.pathname, pendingScrollTarget]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBar(window.scrollY < 64);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToAnchor = (selector) => {
    if (typeof window === "undefined") {
      return;
    }
    if (!selector || selector === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigate = (target) => {
    const anchor = SECTION_TARGETS[target] ?? "#top";

    if (location.pathname !== "/") {
      setPendingSection(target);
      setPendingScrollTarget(anchor);
      navigate("/");
      return;
    }

    setActiveSection(target);
    scrollToAnchor(anchor);
  };

  const openQuoteModal = () => setIsQuoteModalOpen(true);

  return (
    <div className="app-shell">
      <ScrollToTop />
      <TopBar onRequestQuote={openQuoteModal} isVisible={showTopBar} />
      <Navbar
        activeSection={location.pathname === "/" ? activeSection : null}
        onNavigate={handleNavigate}
        topOffsetClass={showTopBar ? "top-0 sm:top-10" : "top-0"}
      />
      <main className="content-area">
        <Routes>
          <Route
            path="/"
            element={<HomePage onOpenQuoteModal={openQuoteModal} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolyo" element={<Portfolyo />} />
          <Route path="/hizmetler/grafik-tasarim" element={<GraphicDesign />} />
          <Route path="/hizmetler/baski" element={<Printing />} />
          <Route path="/hizmetler/mucellit" element={<Binding />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/makine-parkuru" element={<MachinePark />} />
          <Route path="/urunler/:slug" element={<ProductCategory />} />
          <Route
            path="*"
            element={<HomePage onOpenQuoteModal={openQuoteModal} />}
          />
        </Routes>
      </main>
      <Footer />
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </div>
  );
}

export default App;

function HomePage({ onOpenQuoteModal }) {
  return (
    <>
      <Hero onOpenQuoteModal={onOpenQuoteModal} />
      <div className="page home-page">
        <section className="section section--panel section--why">
         
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">
              Neden Biz?
            </p>
             <div className="section__heading">
            <h2 className="text-amber-300">
              EuromatPrint ile iş birliği yapmanın avantajları.
            </h2>
            <p>
              Uzman üretim kadromuz, modern makine parkurumuz ve sektörel
              deneyimimiz sayesinde, baskı süreçlerinizi güvenle teslim
              edebilirsiniz.
            </p>
          </div>
          <div className="why-grid">
            {WHY_US.map((item) => (
              <article key={item.title} className="card why-card">
                <h3 className="tracking-[0.4em] text-amber-400">{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <ProductShowcase />
      <div className="page home-page">
        <section className="section section--panel brands-panel">
          
            <p className="eyebrow text-amber-300/90">
              Birlikte Çalıştığımız Markalar
            </p>
            <div className="section__heading">
            <h2 className="text-amber-300">Portfolyomuzdan seçkiler.</h2>
            <p>
              Yıllar içinde büyüttüğümüz kurumsal müşteri ağımızın bir bölümünü
              aşağıda görebilirsiniz. Tam liste için portfolyo sayfamızı ziyaret
              edebilirsiniz.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {FEATURED_BRANDS.map((brand) => (
              <Link
                key={brand.id}
                to="/portfolyo"
                className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"

                aria-label={`${brand.name} portfolyo kartı`}
              >
                <div className="flex aspect-square items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logosu`}
                    className="max-h-[90px] w-full object-contain transition duration-500 ease-out group-hover:scale-105 sm:max-h-[110px] lg:max-h-[120px]"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/40 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
              to="/portfolyo"
            >
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
            <Link
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/40 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
              to="/contact"
            >
              İletişim Sayfasına Git
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
