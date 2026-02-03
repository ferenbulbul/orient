import { Zap, Award, Shield, Leaf, CheckCircle2 } from "lucide-react";
import about from '../assets/images/services/about.jpg';

const MISSION_PILLARS = [
  {
    icon: Zap,
    title: "Hız",
    description: "Modern makine parkurumuzla termin sürelerine sadık kalarak"
  },
  {
    icon: Award,
    title: "Kalite",
    description: "Grafik tasarım titizliğimizi her aşamaya yayarak"
  },
  {
    icon: Shield,
    title: "Güven",
    description: "Entegre üretim tesisimizde her süreci şeffaf yöneterek"
  }
];

const COMMITMENTS = [
  "Yüksek standartlarda ve ekonomik çözümler",
  "FSC standartlarında çevre duyarlı üretim",
  "Kağıt ve emeği en verimli kullanım",
  "Sürdürülebilir gelecek vizyonu"
];

function Mission() {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-100/20 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  Misyonumuz
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                Değer katan{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  baskı çözümleri
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Yayıncılık ve kurumsal iş dünyasındaki paydaşlarımıza, yüksek 
                standartlarda ve ekonomik çözümler sunmak.
              </p>

              {/* Mission Pillars */}
              <div className="mt-8 space-y-4">
                {MISSION_PILLARS.map((pillar, idx) => {
                  const IconComponent = pillar.icon;
                  return (
                    <div 
                      key={idx}
                      className="flex items-start gap-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition-all hover:border-amber-300 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-300 shadow-sm">
                        <IconComponent className="h-5 w-5 text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{pillar.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="group overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <img
                  src={about}
                  alt="Sürdürülebilir ve entegre baskı üretim anlayışı"
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

      {/* Sustainability Section */}
      <section className="relative py-20">
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Left: Sustainability Focus */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-400/20">
                <Leaf className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              
              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                Sürdürülebilir Üretim
              </h2>
              
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Çevreye duyarlı <span className="font-semibold text-slate-900">(FSC standartlarında)</span> üretim 
                anlayışımızla, kağıdı ve emeği en verimli şekilde kullanarak sürdürülebilir 
                bir gelecek inşa etmek temel görevimizdir.
              </p>

              <div className="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-300" />
            </div>

            {/* Right: Commitments */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Taahhütlerimiz</h3>
              
              <div className="mt-6 space-y-3">
                {COMMITMENTS.map((commitment, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-amber-500" strokeWidth={2} />
                    <span className="text-sm leading-relaxed text-slate-600">
                      {commitment}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom Statement */}
      <section className="relative bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
            <p className="text-lg leading-relaxed text-slate-700">
              <span className="font-semibold text-amber-600">Paydaşlarımıza</span>{" "}
              hız, kalite ve güven ilkeleriyle hizmet vererek,{" "}
              <span className="font-semibold text-slate-900">ekonomik ve sürdürülebilir</span>{" "}
              çözümler sunuyoruz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Mission;