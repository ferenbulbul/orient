import { useEffect, useState } from "react";
import {
  Calendar,
  Package,
  Settings,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import parkur1 from "../assets/images/machine/parkur1.jpg";
import parkur2 from "../assets/images/machine/parkur2.jpg";
import parkur3 from "../assets/images/machine/parkur3.jpg";
import machine from "../assets/images/machine/machine.jpg";

const MACHINE_GROUPS = [
  {
    id: "ofset",
    title: "Ofset Baskı",
    // Her grup için birden fazla görsel
    images: [
      {
        src: parkur2,
        alt: "Komori Lithrone ofset baskı makinesi",
        caption: "Komori Lithrone S40",
      },
      {
        src: parkur3,
        alt: "Heidelberg ofset makinesi",
        caption: "Heidelberg SM 102P",
      },
      {
        src: machine,
        alt: "Ofset baskı detay görsel",
        caption: "Üretim Hattı",
      },
    ],
    description:
      "Yüksek tirajlı ve renk hassasiyeti gerektiren işler için modern ofset baskı altyapımız.",
    stats: { capacity: "45M/yıl", machines: "4", colors: "8" },
    items: [
      {
        date: "01.01.2022",
        unit: "OFSET",
        name: "Komori Lithrone S40 8 Renk",
        modelYear: 2005,
        feature: "70x100 - 8 Renk Perfektör",
      },
      {
        date: "07.01.2025",
        unit: "OFSET",
        name: "Komori Lithrone S40 5 Renk",
        modelYear: 2005,
        feature: "70x100 - 5 Renk",
      },
      {
        date: "07.01.2025",
        unit: "OFSET",
        name: "Heidelberg SM 102P 2 Renk",
        modelYear: 1997,
        feature: "70x100 - 2 Renk Perfektör",
      },
      {
        date: "06.01.2017",
        unit: "OFSET",
        name: "Roland Rekord 2 Renk",
        modelYear: 1987,
        feature: "70x100 - 2 Renk Perfektör",
      },
    ],
  },
  {
    id: "prepress",
    title: "Baskı Öncesi",
    images: [
      {
        src: parkur1,
        alt: "CTP baskı öncesi hazırlık",
        caption: "Kodak Magnus CTP",
      },
      { src: parkur2, alt: "Renk yönetimi sistemi", caption: "Renk Yönetimi" },
      {
        src: parkur3,
        alt: "Proof çıktı sistemleri",
        caption: "Proof Sistemleri",
      },
    ],
    description:
      "Renk yönetimi, kalıp hazırlığı ve prova süreçlerinde yüksek hassasiyet.",
    stats: { capacity: "40/saat", machines: "3", accuracy: "98%" },
    items: [
      {
        date: "06.01.2017",
        unit: "BASKI ÖNCESİ",
        name: "Kodak Magnus 800 CTP",
        modelYear: 2012,
        feature: "40 Kalıp / Saat",
      },
      {
        date: "10.01.2024",
        unit: "BASKI ÖNCESİ",
        name: "Xerox Versant 280",
        modelYear: 2024,
        feature: "%98 Baskı Renk Doğruluğu",
      },
      {
        date: "05.01.2023",
        unit: "BASKI ÖNCESİ",
        name: "Kyocera Printer",
        modelYear: 2021,
        feature: "Ozalit / Prova",
      },
    ],
  },
  {
    id: "bindery",
    title: "Mücellit",
    images: [
      {
        src: parkur3,
        alt: "Müller Martini ciltleme makinesi",
        caption: "Müller Martini Acora",
      },
      { src: machine, alt: "Tel dikiş makinesi", caption: "Tel Dikiş Sistemi" },
      { src: parkur1, alt: "Kesim ve paketleme", caption: "Kesim & Paketleme" },
    ],
    description:
      "Katlama, dikiş, ciltleme ve paketleme süreçlerinde yüksek üretim kapasitesi.",
    stats: { capacity: "8K/saat", machines: "4", stations: "18" },
    items: [
      {
        date: "10.01.2023",
        unit: "MÜCELLİT",
        name: "Müller Martini Acora 5",
        modelYear: 2002,
        feature: "5000 Kitap/Saat - 18 İstasyon",
      },
      {
        date: "10.01.2024",
        unit: "MÜCELLİT",
        name: "Müller Martini Presto Tel Dikiş",
        modelYear: 2003,
        feature: "8000 Dergi/Saat - 6 İstasyon",
      },
      {
        date: "01.01.2017",
        unit: "MÜCELLİT",
        name: "Köşe Kesim (Radüs) Makinesi",
        modelYear: 2017,
        feature: "-",
      },
      {
        date: "06.01.2017",
        unit: "MÜCELLİT",
        name: "Eurocutter Giyotin",
        modelYear: 1992,
        feature: "-",
      },
    ],
  },
  {
    id: "logistics",
    title: "Sevkiyat",
    images: [
      { src: machine, alt: "Sevkiyat araçları", caption: "Filo Araçları" },
      { src: parkur1, alt: "Forklift yükleme", caption: "Depo Operasyonları" },
      {
        src: parkur2,
        alt: "Paketleme ve sevkiyat",
        caption: "Paketleme Birimi",
      },
    ],
    description:
      "Üretimi tamamlanan ürünlerin güvenli ve hızlı şekilde sevkiyatı.",
    stats: { capacity: "5 gün", vehicles: "3", coverage: "TR" },
    items: [
      {
        date: "06.01.2017",
        unit: "SEVKİYAT",
        name: "Iveco Daily",
        modelYear: 2016,
        feature: "-",
      },
      {
        date: "06.01.2017",
        unit: "SEVKİYAT",
        name: "Renault Kangoo",
        modelYear: 2012,
        feature: "-",
      },
      {
        date: "01.01.2025",
        unit: "SEVKİYAT",
        name: "Still Forklift",
        modelYear: 2015,
        feature: "-",
      },
    ],
  },
];

// Scroll animation hook
function useScrollAnimation() {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: "-50px" },
    );

    document.querySelectorAll("[data-scroll-section]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return visibleSections;
}

function MachinePark() {
  const visibleSections = useScrollAnimation();
  const [activeImage, setActiveImage] = useState({});

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 backdrop-blur-sm">
            <Settings className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Teknoloji & Altyapı
            </span>
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Makine{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Parkurumuz
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
            Modern teknoloji ile donatılmış üretim hatlarımız, yüksek kalite
            standartlarında kesintisiz üretim kapasitesi sunar.
          </p>

          {/* Quick Stats */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Toplam Makine", value: "14+", icon: Settings },
              {
                label: "Üretim Kapasitesi",
                value: "45M/yıl",
                icon: TrendingUp,
              },
              { label: "Kalite Standart", value: "ISO 9001", icon: Award },
              { label: "Teknoloji Yatırımı", value: "2024", icon: Sparkles },
            ].map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-amber-400/50 hover:scale-105"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                  }}
                >
                  <div className="absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-amber-400/10 blur-2xl transition-transform group-hover:scale-150" />

                  <IconComponent
                    className="h-6 w-6 text-amber-400 transition-transform group-hover:scale-110"
                    strokeWidth={1.5}
                  />

                  <div className="mt-3">
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
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

      {/* Machine Groups */}
      <div className="mx-auto max-w-7xl space-y-32 px-6 py-28">
        {MACHINE_GROUPS.map((group, index) => {
          const currentImage = activeImage[group.id] || 0;

          return (
            <section
              key={group.id}
              id={group.id}
              data-scroll-section
              className="scroll-mt-32"
            >
              {/* Section Header */}
              <div
                className={`mb-12 transition-all duration-1000 ${
                  visibleSections.has(group.id)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
                  <Package className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                    Makine Parkuru
                  </span>
                </div>

                <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  {group.title}
                </h2>

                <p className="mt-4 max-w-3xl text-lg text-slate-600">
                  {group.description}
                </p>
              </div>

              {/* ENHANCED IMAGE GALLERY + STATS */}
              <div
                className={`mb-12 grid gap-6 lg:grid-cols-3 transition-all duration-1000 ${
                  visibleSections.has(group.id)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: "0.2s" }}
              >
                {/* LEFT: Main Image Gallery - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Main Large Image */}
                  <div className="group relative h-[450px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl">
                    <img
                      src={group.images[currentImage].src}
                      alt={group.images[currentImage].alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

                    {/* Image Caption */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-white">
                          <ImageIcon className="h-5 w-5 text-amber-400" />
                          <span className="text-lg font-semibold">
                            {group.images[currentImage].caption}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Zoom Icon */}
                    <div className="absolute top-6 right-6 rounded-full bg-white/10 p-3 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-3 gap-4">
                    {group.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          setActiveImage((prev) => ({
                            ...prev,
                            [group.id]: idx,
                          }))
                        }
                        className={`group relative h-32 overflow-hidden rounded-xl border-2 transition-all ${
                          currentImage === idx
                            ? "border-amber-400 shadow-lg shadow-amber-400/30"
                            : "border-slate-200 hover:border-amber-300"
                        }`}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div
                          className={`absolute inset-0 transition-opacity ${
                            currentImage === idx
                              ? "bg-amber-400/20"
                              : "bg-slate-900/40 group-hover:bg-slate-900/20"
                          }`}
                        />

                        {/* Active Indicator */}
                        {currentImage === idx && (
                          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Stats Cards - 1 column */}
                <div className="flex flex-col gap-6">
                  {Object.entries(group.stats).map(([key, value], idx) => (
                    <div
                      key={key}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-amber-100 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />

                      <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
                          {key === "capacity"
                            ? "Kapasite"
                            : key === "machines"
                              ? "Makine Sayısı"
                              : key === "vehicles"
                                ? "Araç Sayısı"
                                : key === "colors"
                                  ? "Renk"
                                  : key === "accuracy"
                                    ? "Doğruluk"
                                    : key === "stations"
                                      ? "İstasyon"
                                      : key === "coverage"
                                        ? "Kapsam"
                                        : key}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Machine Table */}
              <div
                className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition-all duration-1000 ${
                  visibleSections.has(group.id)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: "0.4s" }}
              >
                {/* Table Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-[0.3em] text-amber-600">
                    <span className="col-span-2">Tarih</span>
                    <span className="col-span-2">Birim</span>
                    <span className="col-span-4">Ürün İsmi</span>
                    <span className="col-span-2">Model Yılı</span>
                    <span className="col-span-2">Özellik</span>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      className="group grid grid-cols-12 gap-4 items-center px-6 py-4 text-sm transition-colors hover:bg-amber-50/50"
                    >
                      <div className="col-span-2 flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4 text-amber-400" />
                        <span>{item.date}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          <ChevronRight className="h-3 w-3" />
                          {item.unit}
                        </span>
                      </div>
                      <span className="col-span-4 font-semibold text-slate-900">
                        {item.name}
                      </span>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {item.modelYear}
                        </span>
                      </div>
                      <span className="col-span-2 text-slate-600">
                        {item.feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              {index < MACHINE_GROUPS.length - 1 && (
                <div className="mt-32 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                  <div className="flex h-2 w-2 items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Teknoloji ile{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              güçlü üretim
            </span>
          </h2>

          <p className="mt-4 text-lg text-slate-300">
            Modern makine parkurumuz ile projelerinizi zamanında ve kusursuz
            teslim ediyoruz.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Award className="h-5 w-5 text-amber-400" />
            <span>ISO 9001:2015 Sertifikalı Üretim</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MachinePark;
