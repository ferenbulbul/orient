import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Clock,
  ArrowRight,
  Sparkles,
  Package,
  Zap,
  Target,
  Layers,
  Shield,
  Users
} from "lucide-react";
import Hero from "../components/Hero";
import ProductShowcase from "../components/ProductShowcase";
import { useLanguage } from "../context/LanguageContext";

const CAPABILITIES = [
  {
    icon: Package,
    title: "Yüksek Kapasite",
    metric: "45M",
    unit: "baskı/yıl",
    description: "Endüstriyel ölçekte üretim gücü"
  },
  {
    icon: Clock,
    title: "Hızlı Teslimat",
    metric: "5",
    unit: "gün ort.",
    description: "Planlı ve zamanında teslim"
  },
  {
    icon: Award,
    title: "Kanıtlanmış Deneyim",
    metric: "1200+",
    unit: "proje",
    description: "Başarıyla tamamlanan iş"
  },
  {
    icon: Zap,
    title: "Kalite Güvencesi",
    metric: "ISO 9001",
    unit: "sertifikalı",
    description: "Uluslararası standart"
  }
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Danışmanlık & Analiz",
    description: "Projenizin gereksinimlerini detaylı şekilde analiz eder, en uygun üretim yöntemini belirleriz.",
    icon: Target
  },
  {
    number: "02",
    title: "Tasarım & Hazırlık",
    description: "Grafik tasarım ekibimiz baskı standartlarına uygun dosya hazırlığı yapar, renk provaları sunar.",
    icon: Layers
  },
  {
    number: "03",
    title: "Üretim & Kontrol",
    description: "ISO 9001 standartlarında üretim yapılır, her aşamada kalite kontrol uygulanır.",
    icon: Zap
  },
  {
    number: "04",
    title: "Teslim & Destek",
    description: "Zamanında teslimat garantisi ile işiniz kapınıza gelir, sonrası için destek sağlarız.",
    icon: CheckCircle2
  }
];

const QUALITY_FEATURES = [
  {
    icon: Shield,
    title: "ISO 9001:2015 Sertifikalı",
    description: "Uluslararası kalite standartlarında sürekli iyileştirme"
  },
  {
    icon: Users,
    title: "Deneyimli Ekip",
    description: "20+ yıllık sektör tecrübesi ile profesyonel kadro"
  },
  {
    icon: Award,
    title: "Müşteri Memnuniyeti",
    description: "%100 müşteri memnuniyet oranı ile güvenilir hizmet"
  },
  {
    icon: Zap,
    title: "Hızlı Üretim",
    description: "Modern teknoloji ile rekabetçi teslimat süreleri"
  }
];

// Custom hook for scroll animations
function useScrollAnimation() {
  const [visibleSections, setVisibleSections] = useState(new Set());
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    document.querySelectorAll('[data-scroll-section]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return visibleSections;
}

function Home({ onOpenQuoteModal }) {
  const { isEN } = useLanguage();
  const capabilities = isEN
    ? [
        { icon: Package, title: "High Capacity", metric: "45M", unit: "prints/year", description: "Industrial-scale production power" },
        { icon: Clock, title: "Fast Delivery", metric: "3", unit: "days avg.", description: "Planned and on-time delivery" },
        { icon: Award, title: "Proven Experience", metric: "1200+", unit: "projects", description: "Successfully completed jobs" },
        { icon: Zap, title: "Quality Assurance", metric: "ISO 9001", unit: "certified", description: "International standard" },
      ]
    : CAPABILITIES;
  const processSteps = isEN
    ? [
        { number: "01", title: "Consulting & Analysis", description: "We analyze your requirements in detail and define the most suitable production method.", icon: Target },
        { number: "02", title: "Design & Preparation", description: "Our design team prepares print-ready files and provides color proofs.", icon: Layers },
        { number: "03", title: "Production & Control", description: "Production is done according to ISO 9001 standards with quality checks at every stage.", icon: Zap },
        { number: "04", title: "Delivery & Support", description: "Your work is delivered on time with post-delivery support.", icon: CheckCircle2 },
      ]
    : PROCESS_STEPS;
  const qualityFeatures = isEN
    ? [
        { icon: Shield, title: "ISO 9001:2015 Certified", description: "Continuous improvement with international quality standards" },
        { icon: Users, title: "Experienced Team", description: "Professional team with 20+ years of sector experience" },
        { icon: Award, title: "Client Satisfaction", description: "Reliable service with 100% customer satisfaction approach" },
        { icon: Zap, title: "Fast Production", description: "Competitive lead times with modern technology" },
      ]
    : QUALITY_FEATURES;

  const visibleSections = useScrollAnimation();

  return (
    <>
      {/* ================= HERO ================= */}
      <Hero onOpenQuoteModal={onOpenQuoteModal} />

      {/* ================= FLOATING STATS BAR ================= */}
      <section className="relative bg-slate-950 py-20 -mt-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-500 hover:border-amber-400/50 hover:bg-white/10 hover:scale-105"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-amber-400/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
                  
                  <IconComponent className="h-8 w-8 text-amber-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" strokeWidth={1.5} />
                  
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white transition-all duration-300 group-hover:text-amber-300">{item.metric}</span>
                      <span className="text-sm text-slate-400">{item.unit}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* ================= WHAT WE DO - ENHANCED WITH SCROLL ================= */}
      <section 
        id="what-we-do"
        data-scroll-section
        className="relative bg-slate-50 py-28 overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-96 w-96 rounded-full bg-slate-300/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* LEFT: TEXT */}
            <div 
              className={`transition-all duration-1000 ${
                visibleSections.has('what-we-do') 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-12'
              }`}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  {isEN ? "End-to-End Solution" : "Uçtan Uca Çözüm"}
                  </span>
              </div>

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                {isEN ? "From design to delivery," : "Tasarımdan teslimata,"}
                <br />
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  {isEN ? "single-team" : "tek ekip"}
                </span>{" "}
                {isEN ? "execution" : "yönetimi"}
              </h2>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {isEN
                  ? "Graphic design, prepress, offset and digital printing, bindery operations... We manage all production stages under one roof to prevent time loss and secure quality standards."
                  : "Grafik tasarım, baskı öncesi hazırlık, ofset ve dijital baskı, mücellit işlemleri... Tüm üretim aşamalarını tek çatı altında yöneterek zaman kaybını önlüyor, kalite standartlarını garanti altına alıyoruz."}
              </p>

              <div className="mt-8 space-y-4">
                {(isEN
                  ? [
                      "ISO 9001 certified quality management",
                      "Real-time production tracking",
                      "Dedicated account representative support",
                    ]
                  : [
                      "ISO 9001 sertifikalı kalite yönetimi",
                      "Gerçek zamanlı üretim takibi",
                      "Özel müşteri temsilcisi desteği",
                    ]).map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 group"
                    style={{
                      animation: visibleSections.has('what-we-do') 
                        ? `slideInLeft 0.5s ease-out ${idx * 0.1 + 0.3}s both` 
                        : 'none'
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full group-hover:bg-amber-400/40 transition-all" />
                      <CheckCircle2 className="relative h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" strokeWidth={2} />
                    </div>
                    <span className="text-slate-700 group-hover:text-slate-900 transition-colors">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onOpenQuoteModal}
                className="group mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/40"
              >
                {isEN ? "Get Free Quote" : "Ücretsiz Teklif Alın"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* RIGHT: SERVICE CARDS */}
            <div 
              className={`grid gap-6 transition-all duration-1000 ${
                visibleSections.has('what-we-do') 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-12'
              }`}
            >
              {(isEN
                ? [
                    {
                      title: "Prepress",
                      subtitle: "Graphic Design & CTP",
                      features: ["Color management", "Proof outputs", "File optimization"],
                      color: "from-amber-50 to-orange-50"
                    },
                    {
                      title: "Printing",
                      subtitle: "Offset & Digital",
                      features: ["High run capacity", "Personalization", "Fast production"],
                      color: "from-blue-50 to-cyan-50"
                    },
                    {
                      title: "Postpress",
                      subtitle: "Bindery & Finishing",
                      features: ["Lamination", "UV varnish", "Cut & fold"],
                      color: "from-purple-50 to-pink-50"
                    }
                  ]
                : [
                {
                  title: "Baskı Öncesi",
                  subtitle: "Grafik Tasarım & CTP",
                  features: ["Renk yönetimi", "Proof çıktıları", "Dosya optimizasyonu"],
                  color: "from-amber-50 to-orange-50"
                },
                {
                  title: "Baskı",
                  subtitle: "Ofset & Dijital",
                  features: ["Yüksek tiraj kapasitesi", "Kişiselleştirme", "Hızlı üretim"],
                  color: "from-blue-50 to-cyan-50"
                },
                {
                  title: "Baskı Sonrası",
                  subtitle: "Mücellit & Ciltleme",
                  features: ["Laminasyon", "UV lak", "Kesim & katla"],
                  color: "from-purple-50 to-pink-50"
                }
              ]).map((service, idx) => (
                <div 
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:border-amber-300 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    transitionDelay: visibleSections.has('what-we-do') ? `${idx * 0.1 + 0.2}s` : '0s'
                  }}
                >
                  <div className={`absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br ${service.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {service.title}
                        </h3>
                        <p className="mt-1 text-sm text-amber-600 font-medium">{service.subtitle}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-600 group-hover:scale-110 group-hover:rotate-12 transition-all">
                        {idx + 1}
                      </div>
                    </div>
                    
                    <ul className="mt-4 space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400 group-hover:scale-150 transition-transform" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </section>

      {/* ================= QUALITY COMMITMENT SECTION ================= */}
      <section 
        id="quality-section"
        data-scroll-section
        className="relative bg-white py-28 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(251,191,36,0.05),transparent_50%)]" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div 
            className={`text-center transition-all duration-1000 ${
              visibleSections.has('quality-section') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
              <Shield className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                {isEN ? "Our Quality Commitment" : "Kalite Taahhüdümüz"}
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {isEN ? "Why " : "Neden "}
              <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Euromat Print?
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              {isEN ? "We move your business forward with reliable, fast, and integrated production processes." : "Güvenilir, hızlı ve entegre üretim süreçlerimizle işinizi bir adım öne taşıyoruz"}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {qualityFeatures.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={idx}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all duration-700 hover:border-amber-300 hover:shadow-xl hover:-translate-y-2 ${
                    visibleSections.has('quality-section') 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-12'
                  }`}
                  style={{
                    transitionDelay: visibleSections.has('quality-section') ? `${idx * 0.15}s` : '0s'
                  }}
                >
                  <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-amber-100/50 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="relative">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 shadow-lg shadow-amber-400/30 transition-all group-hover:scale-110 group-hover:rotate-3">
                      <IconComponent className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    
                    <h3 className="mt-6 text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>

                    <div className="mt-4 h-1 w-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500 group-hover:w-12" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
        {/* ================= PRODUCTS ================= */}
      <ProductShowcase />
      {/* ================= PROCESS WITH VISUAL TIMELINE ================= */}
      <section 
        id="process-section"
        data-scroll-section
        className="relative bg-slate-50 py-28 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.05),transparent_50%)]" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div 
            className={`text-center transition-all duration-1000 ${
              visibleSections.has('process-section') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <TrendingUp className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                {isEN ? "Our Workflow" : "Çalışma Sürecimiz"}
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {isEN ? "In 4 steps," : "4 adımda"}
              {" "}
              <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                {isEN ? "excellent results" : "mükemmel sonuç"}
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              {isEN ? "Our optimized workflow for a transparent, fast, and reliable process." : "Şeffaf, hızlı ve güvenilir bir süreç için optimize edilmiş iş akışımız"}
            </p>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, idx) => {
              const IconComponent = step.icon;
              const isVisible = visibleSections.has('process-section');
              return (
                <div 
                  key={idx} 
                  className={`relative group transition-all duration-700 ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-12'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${idx * 0.15}s` : '0s'
                  }}
                >
                  {/* Connection Line */}
                  {idx < processSteps.length - 1 && (
                    <div className="absolute top-12 left-full hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-amber-200 via-amber-300 to-slate-200 lg:block" 
                         style={{ zIndex: 0 }} />
                  )}

                  <div className="relative">
                    {/* Number Badge with Icon */}
                    <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-300 text-2xl font-bold text-white shadow-xl shadow-amber-400/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                      <span className="relative z-10">{step.number}</span>
                      <div className="absolute -bottom-2 -right-2 rounded-full bg-white p-1.5 shadow-lg">
                        <IconComponent className="h-4 w-4 text-amber-600" strokeWidth={2.5} />
                      </div>
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>

                    {/* Hover Effect Line */}
                    <div className="mt-4 h-1 w-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500 group-hover:w-12" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      

      {/* ================= FINAL CTA - ENHANCED ================= */}
      <section className="relative overflow-hidden bg-slate-950 py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl animate-pulse" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              {isEN ? "Start Now" : "Hemen Başlayın"}
            </span>
          </div>

          <h2 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {isEN ? "Let’s bring your project " : "Projenizi"}{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              {isEN ? "to life" : "hayata geçirelim"}
            </span>
          </h2>
          
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            {isEN ? "Our expert team prepares a tailored production plan and delivers" : "Uzman ekibimiz size özel üretim planı hazırlar ve"}
            <br className="hidden sm:block" />
            {isEN ? "the best solution within 24 hours." : "en uygun çözümü 24 saat içinde sunar."}
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onOpenQuoteModal}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 px-10 py-4 text-base font-semibold text-slate-950 shadow-xl shadow-amber-400/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-400/50"
            >
              {isEN ? "Get Free Quote" : "Ücretsiz Teklif Alın"}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              to="/iletisim"
              className="group inline-flex items-center gap-2 rounded-full border border-white/30 px-10 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/10 hover:border-white/50"
            >
              {isEN ? "Contact Us" : "İletişime Geçin"}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full" />
                <CheckCircle2 className="relative h-5 w-5 text-amber-400 transition-transform group-hover:scale-110" />
              </div>
              <span className="group-hover:text-slate-300 transition-colors">{isEN ? "Response within 24 hours" : "24 saat içinde geri dönüş"}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full" />
                <CheckCircle2 className="relative h-5 w-5 text-amber-400 transition-transform group-hover:scale-110" />
              </div>
              <span className="group-hover:text-slate-300 transition-colors">{isEN ? "Free consultancy" : "Ücretsiz danışmanlık"}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full" />
                <CheckCircle2 className="relative h-5 w-5 text-amber-400 transition-transform group-hover:scale-110" />
              </div>
              <span className="group-hover:text-slate-300 transition-colors">{isEN ? "ISO 9001 quality assurance" : "ISO 9001 kalite garantisi"}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
