import { useEffect, useState } from "react";
import {
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  MapPin,
  Factory
} from "lucide-react";
import about from "../assets/images/services/about.jpg";
import founderProfile from "../assets/images/profile/profile.jpeg";
import { useLanguage } from "../context/LanguageContext";

const VALUES = [
  {
    icon: Target,
    title: "Tam Entegre Çözümler",
    description:
      "Grafik tasarımdan baskıya, iplik dikişten paketlemeye kadar tüm süreçleri kendi bünyemizde yönetiyoruz."
  },
  {
    icon: TrendingUp,
    title: "Yüksek Üretim Kapasitesi",
    description:
      "8 ve 5 renkli modern ofset makinelerimizle günde 20 saat kesintisiz hizmet veriyor, yoğun sezonlarda bile termin sürelerine sadık kalıyoruz."
  },
  {
    icon: Award,
    title: "Uzman Kadro",
    description:
      "Ustalarımız, planlama ekibimiz ve grafik birimimizle kitap, dergi ve kurumsal materyal üretiminde sıfır hata vizyonuyla çalışıyoruz."
  }
];

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
      { threshold: 0.1, rootMargin: "-50px" }
    );

    document.querySelectorAll("[data-scroll-section]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return visibleSections;
}

function About() {
  const { isEN } = useLanguage();
  const visibleSections = useScrollAnimation();
  const values = isEN
    ? [
        {
          icon: Target,
          title: "Fully Integrated Solutions",
          description: "We manage all processes in-house, from graphic design to printing, thread sewing, and packaging.",
        },
        {
          icon: TrendingUp,
          title: "High Production Capacity",
          description: "With modern 8- and 5-color offset machines, we operate 20 hours a day and stay on schedule even in peak seasons.",
        },
        {
          icon: Award,
          title: "Expert Team",
          description: "Our masters, planning team, and graphics unit work with a zero-error vision in books, magazines, and corporate materials.",
        },
      ]
    : VALUES;

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-amber-100/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
                <Factory className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  {isEN ? "Corporate" : "Kurumsal"}
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">{isEN ? "About Us" : "Hakkımızda"}</h1>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                {isEN
                  ? "At Euromat Print, we do more than combine paper and ink; we become a reliable solution partner that carries our clients' effort and brand into the future with top quality."
                  : "Euromat Print olarak biz, sadece kağıdı ve mürekkebi bir araya getirmiyoruz; müşterilerimizin emeğini ve markasını, en kaliteli haliyle geleceğe taşıyan güvenilir bir çözüm ortağı oluyoruz."}
              </p>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                <MapPin className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{isEN ? "Istanbul Ikitelli OIZ" : "İstanbul İkitelli OSB"}</p>
                  <p className="text-xs text-slate-500">{isEN ? "1,700 m² Fully Integrated Facility" : "1.700 m² Tam Entegre Fabrika"}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="group overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <img
                  src={about}
                  alt={isEN ? "Euromat Print production facility" : "Euromat Print üretim tesisi"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="story" data-scroll-section className="relative bg-white py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div
            className={`grid gap-8 lg:grid-cols-2 transition-all duration-1000 ${
              visibleSections.has("story") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "0.2s" }}
          >
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
                <p className="text-lg leading-relaxed text-slate-700">
                  {isEN
                    ? "Euromat Print was built on deep expertise in graphic design and prepress in the early 2000s. This know-how, gained at the core of design and technical precision, transformed into industrial production power under Euromat Print Inc. from 2017 onward."
                    : "Euromat Print&apos;in temelleri, 2000&apos;li yılların başında grafik tasarım ve baskı öncesi hazırlık süreçlerindeki derin uzmanlıkla atılmıştır. Sektörün mutfağında, tasarımın ve teknik hassasiyetin merkezinde kazanılan bu birikim, 2017 yılından itibaren Euromat Print A.Ş. çatısı altında endüstriyel bir üretim gücüne dönüşmüştür."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
                <p className="text-lg leading-relaxed text-slate-700">
                  {isEN
                    ? "Today, at our 1,700 m² modern facility in Istanbul Ikitelli Organized Industrial Zone, we provide high-standard printing services from publishing to corporate business."
                    : "Bugün İstanbul İkitelli OSB&apos;de, 1.700 metrekarelik modern fabrikamızda; yayıncılık dünyasından kurumsal iş dünyasına kadar geniş bir yelpazede yüksek standartlı basım hizmetleri sunuyoruz."}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900">{isEN ? "Designer Precision, Industrial Capacity" : "Tasarımcı Titizliği, Endüstriyel Kapasite"}</h3>
                <p className="mt-4 text-lg leading-relaxed text-slate-700">
                  {isEN
                    ? "What differentiates Euromat Print is our designer-level precision in every production process."
                    : "Euromat Print&apos;i sektördeki diğer matbaalardan ayıran en temel özellik, üretim süreçlerine bir tasarımcı titizliğiyle yaklaşmasıdır."}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-slate-700">
                  {isEN
                    ? "With the capacity expansion completed in 2025, we combined our high-speed offset lines and fully integrated bindery under one roof."
                    : "2025 yılında gerçekleştirdiğimiz kapasite artırımıyla beraber, yüksek hızlı ofset baskı hatlarımızı ve tam entegre mücellit parkurumuzu tek çatı altında birleştirdik."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 shadow-sm">
                <p className="text-base leading-relaxed text-slate-200">
                  {isEN
                    ? "From publishers to corporate companies, we provide quality, speed, and sustainable production as a single integrated approach."
                    : "Yayınevlerinden kurumsal firmalara kadar tüm iş ortaklarımız için kalite, hız ve sürdürülebilir üretim yaklaşımını birlikte sunuyoruz."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-slate-50 py-24 overflow-hidden">
        <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-96 w-96 rounded-full bg-slate-200/60 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
                <img
                  src={founderProfile}
                  alt={isEN ? "Mehmet Polat profile photo" : "Mehmet Polat profil görseli"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {isEN ? "Mehmet Polat | Founder & Printing Operations Manager" : "Mehmet Polat | Kurucu & Matbaa İşletmecisi"}
              </h2>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900">{isEN ? "Professional Background" : "Profesyonel Arkaplan"}</h3>
                <ul className="mt-4 space-y-3 text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span>{isEN ? "Industry Experience: Providing uninterrupted service in printing and publishing industry since 2002." : "Sektörel Deneyim: 2002 yılından bu yana matbaacılık ve basım sanayiinde kesintisiz hizmet vermektedir."}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span>{isEN ? "Expertise: Started his career from the ground up in graphic design; built deep expertise in prepress, layout, and technical aesthetics." : "Uzmanlık Alanı: Kariyerine Grafik Tasarım alanında çekirdekten yetişerek başlamış; baskı öncesi hazırlık, mizanpaj ve teknik estetik konularında derin uzmanlık kazanmıştır."}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span>{isEN ? "Entrepreneurship: Turned 15 years of sector experience into industrial scale by founding Euromat Print Inc. in 2017." : "Girişimcilik: Sektördeki 15 yıllık mutfak tecrübesini, 2017 yılında kendi şirketi olan Euromat Print A.Ş.&apos;yi kurarak endüstriyel boyuta taşımıştır."}</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900">{isEN ? "Business Vision" : "İşletme Vizyonu"}</h3>
                <ul className="mt-4 space-y-3 text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span>{isEN ? "Strategic Growth: Expanded production from 1,100 m² to a fully integrated 1,700 m² facility in 2025." : "Stratejik Büyüme: Başakşehir İkitelli OSB&apos;de 1.100 m² ile başladığı üretim serüvenini, 2025 yılında 1.700 m²&apos;lik tam entegre tesise dönüştürmüştür."}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span>{isEN ? "Production Philosophy: Combines designer precision with modern technology (8-color Komori, Muller Martini lines, etc.) to deliver high-capacity, high-quality partnerships." : "Üretim Felsefesi: Tasarımcı titizliğini modern teknolojiyle (8 renkli Komori, Müller Martini hatları vb.) birleştirerek yayınevleri ve kurumsal firmalar için yüksek kapasiteli ve kaliteli çözüm ortaklığı sunmaktadır."}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span>{isEN ? "Future Focus: Aims to expand publishing strength into the corporate market and sustainable production standards (FSC, etc.)." : "Gelecek Odağı: Yayıncılık gücünü kurumsal pazara ve sürdürülebilir üretim standartlarına (FSC vb.) odaklanarak büyütmeyi hedeflemektedir."}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="values" data-scroll-section className="relative bg-white py-24 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-amber-100/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div
            className={`text-center mb-14 transition-all duration-1000 ${
              visibleSections.has("values") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">{isEN ? "Why Euromat Print?" : "Neden Euromat Print?"}</span>
            </div>
          </div>

          <div
            className={`grid gap-6 md:grid-cols-3 transition-all duration-1000 ${
              visibleSections.has("values") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "0.2s" }}
          >
            {values.map((value, idx) => {
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
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.description}</p>
                    <div className="mt-4 h-1 w-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500 group-hover:w-12" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
