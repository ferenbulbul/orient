import { BookOpen, Shield, Scissors, Package } from "lucide-react";
import binding from '../assets/images/services/mücellet.jpg';

const BINDING_POINTS = [
  {
    icon: BookOpen,
    title: "Tel Dikiş & Amerikan Cilt",
    description: "Dikiş ve tutkallama süreçlerinde yapıştırma mukavemetini, sayfa düzenini ve teslim dayanıklılığını üst seviyede tutuyoruz. Katalog ve kitaplar için temiz, rafine bitişler."
  },
  {
    icon: Shield,
    title: "Sert Kapak & Özel Kapak İşçiliği",
    description: "Sert kapaklı, laklı, gofre veya selefonlu kapak çözümlerinde ölçü, kırım ve mukavva seçimleri üretim öncesi netleştirilir. Premium kitap ve ajanda üretiminde kusursuz ciltleme."
  },
  {
    icon: Scissors,
    title: "Kesim ve Şekillendirme",
    description: "Profesyonel kesim teknolojileriyle hassas ölçüler ve düzgün kenarlar sağlıyoruz."
  },
  {
    icon: Package,
    title: "Kalite Kontrol & Paketleme",
    description: "Her iş, son kullanıcıya ulaşmadan önce detaylı kalite kontrol aşamalarından geçirilir."
  }
];

function Binding() {
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
                <BookOpen className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  Baskı Sonrası
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                Dayanıklılık ve{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  sunum
                </span>{" "}
                ön planda
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Baskı sonrası süreçlerde, ürünün dayanıklılığı ve sunumu ön plana çıkar.
              </p>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Mücellit hatlarımızda yapılan ciltleme, kesim ve paketleme işlemleri, ürünün hem estetik hem de fonksiyonel açıdan kusursuz olmasını sağlar. Her iş, son kullanıcıya ulaşmadan önce kalite kontrol aşamalarından geçirilir.
              </p>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="group overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <img
                  src={binding}
                  alt="Ciltleme ve mücellit süreçleri"
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

      {/* Binding Points */}
      <section className="relative py-20">
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BINDING_POINTS.map((point, idx) => {
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
              <span className="font-semibold text-amber-600">Ciltleme ve kapak işlerinde</span>{" "}
              endüstriyel kaliteyi premium bitişlerle buluşturuyoruz. Her projede{" "}
              <span className="font-semibold text-slate-900">kusursuz sonuçlar</span>{" "}
              için detaylı çalışıyoruz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Binding;