import { Printer, History, Zap, BookOpen } from "lucide-react";
import print from '../assets/images/services/print.jpg';

const PRINTING_POINTS = [
  {
    icon: History,
    title: "Ofset Baskı Tarihi",
    description: "1904 yılında Amerikalı Ira W. Rubel tarafından bulunan ofset baskı, günümüz teknolojisinde de kullanılmaya devam eden yüzeysel kaplama yöntemidir."
  },
  {
    icon: Printer,
    title: "CTP Teknolojisi ile Hız",
    description: "Computer to Plate teknolojisi ile doğrudan bilgisayardan baskı alınabiliyor. Film ve montaj işlemlerine gerek kalmadan hızlı üretim sağlıyoruz."
  },
  {
    icon: BookOpen,
    title: "Geniş Kullanım Alanı",
    description: "Kitap kapakları, dergiler ve her türlü kağıt gramajına uygulanabilen ofset baskı ile çok yönlü çözümler sunuyoruz."
  },
  {
    icon: Zap,
    title: "Kalıplama Teknolojisi",
    description: "Alüminyum kalıplar ve ışık kontrolü ile mürekkep tutma alanlarını hassas şekilde belirleyerek mükemmel baskı kalitesi elde ediyoruz."
  }
];

function Printing() {
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
                <Printer className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  Baskı
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                Ofset baskı{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  ve özellikleri
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Amerikalı Ira W. Rubel tarafından 1904 yılında bulunmuş olan ofset baskı, günümüz teknolojisinde de kullanılmaya devam eden bir baskı çeşididir. Yüzeysel kaplamalarda kullanılan bu baskı çeşidi genellikle kitap ve dergilerin kapaklarında kullanılır.
              </p>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Ofset kelimesi İngilizce OFF ve SET kelimelerinin birleşiminden dilimize geçmiştir. Anlamı mürekkebin kauçuk vasıtası ile kağıda geçirilmesidir. Her türlü kağıt ve gramaja uygulanabildiği için oldukça sık kullanılan bir çalışma olarak baskı tarihinde yerini sürekli korumaktadır.
              </p>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="group overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <img
                  src={print}
                  alt="Ofset baskı teknolojisi ve özellikleri"
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

      {/* Printing Points */}
      <section className="relative py-20">
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINTING_POINTS.map((point, idx) => {
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

      {/* Detailed Information Section */}
      <section className="relative bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Left Column - Ofset Baskı Nasıl Yapılır */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Ofset Baskı Nasıl Yapılır?
                </h2>
                <p className="text-base leading-relaxed text-slate-600">
                  Bilgisayarlarda tasarım yapacak olan tasarımcılar her zaman için bu tasarımları en etkili bir biçimde kağıda dökmek isterler. Yapılan tasarımın bir metalin üzerine alınması ile baskıya geçecek olan ofset baskı, günümüzde baskı teknolojisinde kullanılan en etkili yöntemdir.
                </p>
                <p className="text-base leading-relaxed text-slate-600 mt-4">
                  Bu sebeple baskıcıların ofset baskı ve özellikleri konusuna hakim olmaları ve bu baskıları en iyi şekilde almaları gerekir. Yapılacak olan tasarımların en etkili bir biçimde aktarılacak olması tasarım ve baskı konusunu ilgilendirdiği için, bu konuda çalışan kişilerin kesinlikle konularında uzman olmaları gerekir.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">CTP Teknolojisinin Avantajı</h3>
                <p className="text-base leading-relaxed text-slate-700">
                  Günümüzde ofset baskı yapmanın en büyük avantajı <span className="font-semibold text-amber-700">zaman kaybı yaşanmadan baskı alınabiliyor olmasıdır.</span> CTP teknolojisi ile doğrudan bilgisayardan baskı alınabiliyor olmasından dolayı eskisi gibi film ve montaj işlemlerine gerek kalmadan bu işlemlerin yapılabiliyor olması zaman kaybını engeller.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Kalıplama Teknolojisi</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Ofset baskı ve özellikleri konusunu araştıran bir kişi ilk olarak CTP teknolojisi ile karşılaşır. Bu teknoloji kalıplama teknolojisidir. Yapılan çalışmanın kalıba aktarılması ile gerçekleşen çalışmalarda daima en iyi sonuçlar elde edilir.
                </p>
                <p className="text-sm leading-relaxed text-slate-600 mt-3">
                  Film kullanılan sistem ve alüminyum kalıplar olan baskı işlemlerinde ışığı geçiren ve geçirmeyen alanlar vardır. Baskı işlemlerinde mürekkep tutulmaması gereken alanlar şeffaf olur ve ışığa maruz kalırlar. Alüminyum kalıpta bu alanlar çürüyerek banyoda atılırlar.
                </p>
              </div>
            </div>

            {/* Right Column - Kullanım Alanları */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Ofset Baskı Hangi Alanlarda Kullanılır?</h3>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">Kitap Kapakları</h4>
                    <p className="text-sm text-slate-600 mt-1">Günümüzde ofset baskı genellikle kitap kapaklarında kullanılır. Yapılacak olan tasarımlar bir metal üzerine aktarılarak kitap kapaklarına aktarılabilir.</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">Dergi ve Yayınlar</h4>
                    <p className="text-sm text-slate-600 mt-1">Yüzeysel kaplamalarda kullanılan bu baskı çeşidi dergilerin kapaklarında ve iç sayfalarında yaygın olarak tercih edilir.</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">Her Türlü Kağıt ve Gramaj</h4>
                    <p className="text-sm text-slate-600 mt-1">Ofset baskı her türlü kağıt ve gramaja uygulanabildiği için oldukça sık kullanılan bir çalışma olarak günümüzde baskı tarihinde yerini sürekli olarak korur.</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">Hızlı ve Seri Üretim</h4>
                    <p className="text-sm text-slate-600 mt-1">Teknolojinin gelişmesi ile ofset baskı ve özellikleri konusundan yararlanan tasarımcı ve baskıcılar direkt olarak bilgisayarda bulunan çalışmayı kağıda aktarabilirler. Daha hızlı yapılacak olan baskılar seri bir şekilde yapılabilir.</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">Net Sonuçlar</h4>
                    <p className="text-sm text-slate-600 mt-1">Çalışmaların bir arada yürütüldüğü ve tasarımcı ile baskıcının neredeyse beraber çalıştığı ortamlarda, daha net sonuçlar elde edilebilir.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6">
                <p className="text-base leading-relaxed text-slate-100">
                  <span className="font-semibold text-amber-400">Daha az zaman harcanarak</span>{" "}
                  yapılabilecek olan bu baskılar, ofset baskı ve özellikleri konusuna hakim olan tasarımcılar ve baskıcılar tarafından daha etkin bir şekilde kullanılabilir.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom Statement */}
      <section className="relative bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
            <p className="text-lg leading-relaxed text-slate-700">
              <span className="font-semibold text-amber-600">Yapılan çalışmanın bilgisayar ekranından direkt olarak kağıda aktarılabiliyor olması</span>{" "}
              ayrı bir avantaj sağlar. Eski teknolojiye göre daha hızlı yapılabilen bu çalışmalar,
              günümüzde oldukça fazla kullanılan{" "}
              <span className="font-semibold text-slate-900">baskı çalışmaları</span>{" "}
              olmaya devam etmektedir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Printing;