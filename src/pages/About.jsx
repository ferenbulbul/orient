import { useEffect, useState } from "react";
import { 
  Award,
  Users,
  Target,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Factory
} from "lucide-react";
import about from '../assets/images/services/about.jpg';

const TIMELINE = [
  {
    year: "2002",
    title: "Kuruluş",
    description: "Mehmet Polat'ın grafik tasarım ile matbaacılık sektörüne adım atması"
  },
  {
    year: "2017",
    title: "Kurumsallaşma",
    description: "Euromat Print A.Ş. çatısı altında kurumsal yapılanma"
  },
  {
    year: "2024",
    title: "Modern Teknoloji",
    description: "8 renkli Komori ve Heidelberg makine parkuru ile kapasite artışı"
  },
  {
    year: "2025",
    title: "Genişleme",
    description: "Üretim kapasitesinin genişletilmesi ve uzman ekip güçlendirmesi"
  }
];

const STATS = [
  { icon: Factory, value: "1,700m²", label: "Üretim Alanı" },
  { icon: TrendingUp, value: "16K/saat", label: "Baskı Kapasitesi" },
  { icon: Users, value: "20+ Yıl", label: "Sektör Tecrübesi" },
  { icon: Award, value: "ISO 9001", label: "Kalite Sertifikası" }
];

const VALUES = [
  {
    icon: Target,
    title: "Uçtan Uca Çözüm",
    description: "Tasarımdan teslimata tüm süreçleri kendi bünyemizde yönetiyoruz."
  },
  {
    icon: Award,
    title: "Kalite Odaklı",
    description: "Her tabakada kaliteli baskı sözünü gerçeğe dönüştürüyoruz."
  },
  {
    icon: Users,
    title: "Uzman Ekip",
    description: "Grafik tasarım kökenli titizlik ile profesyonel üretim gücü."
  },
  {
    icon: Sparkles,
    title: "Modern Teknoloji",
    description: "Dünya standartlarında makine parkuru ve sürekli yenilik."
  }
];

// Scroll animation hook
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

function About() {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
                  Hakkımızda
                </span>
              </div>

              <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
                Çeyrek asırlık{" "}
                <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  tecrübe
                </span>
              </h1>
              
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                2002'den bugüne grafik tasarımdan üretim gücüne uzanan bir yolculuk.
                Modern teknoloji ile buluşan deneyim.
              </p>

              {/* Location Badge */}
              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <MapPin className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-white">İstanbul İkitelli OSB</p>
                  <p className="text-xs text-slate-400">1,700 m² Üretim Tesisi</p>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <img
                  src={about}
                  alt="Modern baskı makineleri ile entegre matbaa üretimi"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 right-6 rounded-2xl border border-amber-400/20 bg-slate-950/90 p-6 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-amber-400">2002</p>
                    <p className="text-xs text-slate-400">Kuruluş Yılı</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-400">16K+</p>
                    <p className="text-xs text-slate-400">Tabaka/Saat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 pb-28">
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all hover:border-amber-300 hover:shadow-2xl hover:-translate-y-2"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div className="absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-amber-100 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  
                  <div className="relative">
                    <IconComponent className="h-8 w-8 text-amber-500 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                    <p className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
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

      {/* Story Section */}
      <section 
        id="story"
        data-scroll-section
        className="relative bg-white py-28 overflow-hidden"
      >
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has('story') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                Hikayemiz
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Tasarımdan{" "}
              <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                üretime
              </span>
            </h2>
          </div>

          <div 
            className={`grid gap-8 lg:grid-cols-2 transition-all duration-1000 ${
              visibleSections.has('story') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: '0.2s' }}
          >
            {/* Story Text */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
                <p className="text-lg leading-relaxed text-slate-700">
                  <span className="text-3xl font-bold text-amber-500">E</span>uromat Print'in hikayesi, kurucumuz Mehmet Polat'ın 2002 yılında
                  matbaacılık sektörüne grafik tasarım ile adım atmasıyla başladı. İşin
                  mutfağında, tasarımın ve estetiğin merkezinde yetişen bu vizyon, 2017
                  yılında Euromat Print A.Ş. çatısı altında kurumsallaşarak üretim
                  gücüne dönüştü.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
                <p className="text-lg leading-relaxed text-slate-700">
                  Bugün İstanbul İkitelli OSB'de, 1.700 metrekarelik tam entegre
                  fabrikamızda; eğitimden akademiye, kültür yayıncılığından kurumsal
                  çözümlere kadar geniş bir yelpazede hizmet veriyoruz.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
                <p className="text-lg leading-relaxed text-slate-700">
                  Grafik tasarım kökenli olmamızın verdiği titizliği, saatte 16.000 tabaka baskı
                  kapasitesine sahip 8 renkli Komori ve Heidelberg gibi dünya devi
                  makine parkurumuzla birleştiriyoruz.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-amber-300 to-slate-200" />

              <div className="space-y-8">
                {TIMELINE.map((item, idx) => (
                  <div 
                    key={idx}
                    className="relative pl-12"
                    style={{
                      animation: visibleSections.has('story') 
                        ? `slideInRight 0.6s ease-out ${idx * 0.15}s both` 
                        : 'none'
                    }}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow-lg shadow-amber-400/50">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>

                    {/* Content Card */}
                    <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-xl hover:-translate-x-2">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-amber-500">{item.year}</span>
                        <div className="h-px flex-1 bg-amber-200" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </section>

      {/* Values Section */}
      <section 
        id="values"
        data-scroll-section
        className="relative bg-slate-50 py-28"
      >
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has('values') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                Değerlerimiz
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Neden{" "}
              <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Euromat Print?
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Sadece bir matbaa değil, çözüm ortağınız
            </p>
          </div>

          <div 
            className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-1000 ${
              visibleSections.has('values') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: '0.2s' }}
          >
            {VALUES.map((value, idx) => {
              const IconComponent = value.icon;
              return (
                <div 
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-xl hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-amber-100 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  
                  <div className="relative">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 shadow-lg shadow-amber-400/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
                      <IconComponent className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    
                    <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {value.description}
                    </p>

                    <div className="mt-4 h-1 w-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500 group-hover:w-12" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            2025 yılında genişlettiğimiz{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              üretim kapasitemiz
            </span>
          </h2>
          
          <p className="mt-4 text-lg text-slate-300">
            "Kaliteli baskı" sözünü her tabakada gerçeğe dönüştürüyoruz.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
              <span>Grafik Tasarım Kökenli</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
              <span>Tam Entegre Üretim</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
              <span>Uzman Ekip</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;