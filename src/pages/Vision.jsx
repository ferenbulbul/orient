import { Target, TrendingUp, Globe, Lightbulb } from "lucide-react";
import about from '../assets/images/services/about.jpg';
import { useLanguage } from "../context/LanguageContext";

const VISION_POINTS = [
  {
    icon: Target,
    title: "Teknolojik Liderlik",
    description: "Dünya standartlarında makine parkuru ve sürekli yenilik"
  },
  {
    icon: TrendingUp,
    title: "Sürdürülebilir Üretim",
    description: "Çevre dostu ve verimli üretim süreçleri"
  },
  {
    icon: Globe,
    title: "Bölgesel Önderlik",
    description: "Türkiye ve bölgenin tercih edilen basım merkezi"
  },
  {
    icon: Lightbulb,
    title: "Estetik & Hız",
    description: "Grafik tasarımın estetiği ile endüstriyel üretim gücü"
  }
];

function Vision() {
  const { isEN } = useLanguage();
  const points = isEN
    ? [
        { icon: Target, title: "Technological Leadership", description: "World-class machine park and continuous innovation" },
        { icon: TrendingUp, title: "Sustainable Production", description: "Environmentally friendly and efficient production processes" },
        { icon: Globe, title: "Regional Leadership", description: "The preferred printing hub of Turkey and the region" },
        { icon: Lightbulb, title: "Aesthetics & Speed", description: "Combining design aesthetics with industrial production power" },
      ]
    : VISION_POINTS;

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-amber-100/20 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
                <Target className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  {isEN ? "Our Vision" : "Vizyonumuz"}
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                {isEN ? "Shaping the printing " : "Geleceğin baskı"}{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  {isEN ? "standards of the future" : "standartlarını"}
                </span>{" "}
                {isEN ? "" : "belirliyoruz"}
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {isEN
                  ? "To become the most preferred integrated printing center in Turkey and the region through technological investments and sustainable production."
                  : "Teknolojik yatırımlarımız ve sürdürülebilir üretim anlayışımızla, Türkiye'nin ve bölgenin en çok tercih edilen entegre basım merkezi olmak."}
              </p>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {isEN
                  ? "Blending design aesthetics with industrial speed to elevate the power and quality of printed materials in a digital world."
                  : "Grafik tasarımın estetiğini, endüstriyel üretimin hızıyla harmanlayarak; dijitalleşen dünyada basılı materyalin gücünü ve kalitesini en üst seviyeye taşımak."}
              </p>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="group overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <img
                  src={about}
                  alt={isEN ? "Technology and quality focus in print production" : "Baskı üretiminde teknoloji ve kalite odağı"}
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

      {/* Vision Points */}
      <section className="relative py-20">
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {points.map((point, idx) => {
              const IconComponent = point.icon;
              return (
                <div 
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-xl hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-amber-100 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  
                  <div className="relative">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 shadow-lg shadow-amber-400/20 transition-transform group-hover:scale-110">
                      <IconComponent className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    
                    <h3 className="mt-4 text-base font-bold text-slate-900">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {point.description}
                    </p>

                    <div className="mt-4 h-1 w-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500 group-hover:w-10" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Statement */}
      <section className="relative bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
            <p className="text-lg leading-relaxed text-slate-700">
              <span className="font-semibold text-amber-600">{isEN ? "In a digital world," : "Dijitalleşen dünyada"}</span>{" "}
              {isEN
                ? "we aim to maximize the quality and impact of printed materials and become a "
                : "basılı materyalin gücünü ve kalitesini en üst seviyeye taşıyarak, sektörde fark yaratan bir "}
              <span className="font-semibold text-slate-900">{isEN ? "printing center" : "basım merkezi"}</span>{" "}
              {isEN ? "that stands out in the industry." : "olmayı hedefliyoruz."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Vision;
