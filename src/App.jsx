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
import ScrollToTop from "./components/ScrollToTop";
import TopBar from "./components/TopBar";
import QuoteModal from "./components/QuoteModal";
import About from "./pages/About";
import Vision from "./pages/Vision";
import Mission from "./pages/Mission";
import Contact from "./pages/Contact";
import MachinePark from "./pages/MachinePark";
import ProductCategory from "./pages/ProductCategory";
import PrePress from "./pages/PrePress";
import Printing from "./pages/Printing";
import Binding from "./pages/Binding";
import HomePage from "./pages/Home";
import "./App.css";



const SECTION_TARGETS = {
  home: "#top",
  services: "#product-band",
  products: "#product-band",
};


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
          <Route path="/kurumsal/hakkimizda" element={<About />} />
          <Route path="/kurumsal/vizyon" element={<Vision />} />
          <Route path="/kurumsal/misyon" element={<Mission />} />
          <Route path="/hizmetlerimiz/baski-oncesi" element={<PrePress />} />
          <Route path="/hizmetlerimiz/baski" element={<Printing />} />
          <Route path="/hizmetlerimiz/baski-sonrasi" element={<Binding />} />
          <Route
            path="/iletisim"
            element={<Contact onOpenQuoteModal={openQuoteModal} />}
          />

          <Route path="/parkurumuz" element={<MachinePark />} />
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
