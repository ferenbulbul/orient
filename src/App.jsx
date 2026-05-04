import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
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
import PrePress from "./pages/PrePress";
import Printing from "./pages/Printing";
import Binding from "./pages/Binding";
import HomePage from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/dashboard/ProtectedRoute";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import JobDetail from "./pages/dashboard/JobDetail";
import JobCreate from "./pages/dashboard/JobCreate";
import UserManagement from "./pages/dashboard/UserManagement";
import ReportsPage from "./pages/dashboard/ReportsPage";
import PaperPage from "./pages/dashboard/PaperPage";
import PaperSettings from "./pages/dashboard/PaperSettings";
import DepoStokPage from "./pages/dashboard/DepoStokPage";
import DepoHareketPage from "./pages/dashboard/DepoHareketPage";
import "./App.css";



const SECTION_TARGETS = {
  home: "#top",
  services: "#product-band",
  products: "#product-band",
};

// Routes where the public site shell (TopBar/Navbar/Footer) should be hidden
const isDashboardRoute = (pathname) =>
  pathname.startsWith("/panel") || pathname === "/giris";


function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [pendingSection, setPendingSection] = useState(null);
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const hideSiteShell = isDashboardRoute(location.pathname);

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
    <div className={hideSiteShell ? "" : "app-shell"}>
      <ScrollToTop />

      {!hideSiteShell && (
        <>
          <TopBar onRequestQuote={openQuoteModal} isVisible={showTopBar} />
          <Navbar
            activeSection={location.pathname === "/" ? activeSection : null}
            onNavigate={handleNavigate}
            topOffsetClass={showTopBar ? "top-0 sm:top-10" : "top-0"}
          />
        </>
      )}

      <main className={hideSiteShell ? "" : "content-area"}>
        <Routes>
          {/* Public routes */}
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

          {/* Auth */}
          <Route path="/giris" element={<Login />} />

          {/* Dashboard routes */}
          <Route
            path="/panel"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/is/:jobId"
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/yeni-is"
            element={
              <ProtectedRoute allowedRoles={["personel", "admin", "depocu"]}>
                <JobCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/raporlar"
            element={
              <ProtectedRoute allowedRoles={["admin", "moderator"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/kullanicilar"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/kagit"
            element={
              <ProtectedRoute allowedRoles={["personel", "admin", "moderator", "depocu"]}>
                <PaperPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/kagit-ayarlari"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PaperSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/depo-stok"
            element={
              <ProtectedRoute allowedRoles={["personel", "admin", "moderator", "depocu"]}>
                <DepoStokPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/depo-stok/hareket"
            element={
              <ProtectedRoute allowedRoles={["personel", "admin", "moderator", "depocu"]}>
                <DepoHareketPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<HomePage onOpenQuoteModal={openQuoteModal} />}
          />
        </Routes>
      </main>

      {!hideSiteShell && <Footer />}

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </div>
  );
}

export default App;
