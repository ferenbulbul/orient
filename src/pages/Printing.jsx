import { Printer, History, Zap, BookOpen, ZoomIn, X } from "lucide-react";
import { useState } from "react";
import print from "../assets/images/machine/bKomori8renk3.jpg";
import { useLanguage } from "../context/LanguageContext";

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
  const { isEN } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const points = isEN
    ? [
        { icon: History, title: "History of Offset Printing", description: "Offset printing, invented by Ira W. Rubel in 1904, remains a core surface-printing method today." },
        { icon: Printer, title: "Speed with CTP Technology", description: "Direct-to-plate workflow eliminates film and montage steps for faster production." },
        { icon: BookOpen, title: "Wide Range of Applications", description: "Suitable for book covers, magazines, and all paper weights with versatile output." },
        { icon: Zap, title: "Plate Technology", description: "Using aluminum plates and light control, we define ink zones precisely for high print quality." },
      ]
    : PRINTING_POINTS;

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
                  {isEN ? "Printing" : "Baskı"}
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                {isEN ? "Offset printing " : "Ofset baskı"}{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  {isEN ? "and features" : "ve özellikleri"}
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {isEN
                  ? "Offset printing, discovered by Ira W. Rubel in 1904, is still widely used in modern production. This method is commonly used in surface-coated jobs such as book and magazine covers."
                  : "Amerikalı Ira W. Rubel tarafından 1904 yılında bulunmuş olan ofset baskı, günümüz teknolojisinde de kullanılmaya devam eden bir baskı çeşididir. Yüzeysel kaplamalarda kullanılan bu baskı çeşidi genellikle kitap ve dergilerin kapaklarında kullanılır."}
              </p>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {isEN
                  ? "The term 'offset' refers to transferring ink to paper through rubber blanket cylinders. Since it can be applied to various paper types and weights, it remains one of the most common methods in printing."
                  : "Ofset kelimesi İngilizce OFF ve SET kelimelerinin birleşiminden dilimize geçmiştir. Anlamı mürekkebin kauçuk vasıtası ile kağıda geçirilmesidir. Her türlü kağıt ve gramaja uygulanabildiği için oldukça sık kullanılan bir çalışma olarak baskı tarihinde yerini sürekli korumaktadır."}
              </p>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group relative block h-[360px] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-xl sm:h-[420px] lg:h-[460px]"
                aria-label={isEN ? "Enlarge image" : "Gorseli buyut"}
              >
                <img
                  src={print}
                  alt={isEN ? "Offset printing technology and features" : "Ofset baskı teknolojisi ve özellikleri"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute right-4 top-4 rounded-full bg-white/85 p-2 text-slate-900 shadow-md">
                  <ZoomIn className="h-4 w-4" />
                </div>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Printing Points */}
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

      {/* Detailed Information Section */}
      <section className="relative bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Left Column - Ofset Baskı Nasıl Yapılır */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {isEN ? "How Is Offset Printing Done?" : "Ofset Baskı Nasıl Yapılır?"}
                </h2>
                <p className="text-base leading-relaxed text-slate-600">
                  {isEN
                    ? "Designers always aim to transfer digital designs to paper in the most effective way. Offset printing, where design is transferred to metal plates, is one of the most effective methods in modern print technology."
                    : "Bilgisayarlarda tasarım yapacak olan tasarımcılar her zaman için bu tasarımları en etkili bir biçimde kağıda dökmek isterler. Yapılan tasarımın bir metalin üzerine alınması ile baskıya geçecek olan ofset baskı, günümüzde baskı teknolojisinde kullanılan en etkili yöntemdir."}
                </p>
                <p className="text-base leading-relaxed text-slate-600 mt-4">
                  {isEN
                    ? "For this reason, printers must understand offset printing and its features deeply. Since proper transfer of design directly affects print quality, professionals in this field should be specialized."
                    : "Bu sebeple baskıcıların ofset baskı ve özellikleri konusuna hakim olmaları ve bu baskıları en iyi şekilde almaları gerekir. Yapılacak olan tasarımların en etkili bir biçimde aktarılacak olması tasarım ve baskı konusunu ilgilendirdiği için, bu konuda çalışan kişilerin kesinlikle konularında uzman olmaları gerekir."}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{isEN ? "Advantage of CTP Technology" : "CTP Teknolojisinin Avantajı"}</h3>
                <p className="text-base leading-relaxed text-slate-700">
                  {isEN
                    ? <>The biggest advantage today is <span className="font-semibold text-amber-700">printing without time loss.</span> With CTP technology, direct computer-to-plate workflow removes film and montage steps and saves time.</>
                    : <>Günümüzde ofset baskı yapmanın en büyük avantajı <span className="font-semibold text-amber-700">zaman kaybı yaşanmadan baskı alınabiliyor olmasıdır.</span> CTP teknolojisi ile doğrudan bilgisayardan baskı alınabiliyor olmasından dolayı eskisi gibi film ve montaj işlemlerine gerek kalmadan bu işlemlerin yapılabiliyor olması zaman kaybını engeller.</>}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{isEN ? "Plate Technology" : "Kalıplama Teknolojisi"}</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {isEN
                    ? "Anyone researching offset printing first encounters CTP. It is a plate-based technology that produces highly reliable results."
                    : "Ofset baskı ve özellikleri konusunu araştıran bir kişi ilk olarak CTP teknolojisi ile karşılaşır. Bu teknoloji kalıplama teknolojisidir. Yapılan çalışmanın kalıba aktarılması ile gerçekleşen çalışmalarda daima en iyi sonuçlar elde edilir."}
                </p>
                <p className="text-sm leading-relaxed text-slate-600 mt-3">
                  {isEN
                    ? "In film and aluminum plate systems, there are light-permeable and non-permeable zones. Non-ink areas are exposed and chemically removed during plate processing."
                    : "Film kullanılan sistem ve alüminyum kalıplar olan baskı işlemlerinde ışığı geçiren ve geçirmeyen alanlar vardır. Baskı işlemlerinde mürekkep tutulmaması gereken alanlar şeffaf olur ve ışığa maruz kalırlar. Alüminyum kalıpta bu alanlar çürüyerek banyoda atılırlar."}
                </p>
              </div>
            </div>

            {/* Right Column - Kullanım Alanları */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">{isEN ? "Where Is Offset Printing Used?" : "Ofset Baskı Hangi Alanlarda Kullanılır?"}</h3>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Book Covers" : "Kitap Kapakları"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "Offset is commonly used for book covers, where designs are transferred through plate systems." : "Günümüzde ofset baskı genellikle kitap kapaklarında kullanılır. Yapılacak olan tasarımlar bir metal üzerine aktarılarak kitap kapaklarına aktarılabilir."}</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Magazines & Publications" : "Dergi ve Yayınlar"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "This method is widely preferred for magazine covers and interior pages." : "Yüzeysel kaplamalarda kullanılan bu baskı çeşidi dergilerin kapaklarında ve iç sayfalarında yaygın olarak tercih edilir."}</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "All Paper Types and Weights" : "Her Türlü Kağıt ve Gramaj"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "Since it applies to almost any paper type and weight, offset remains one of the most used methods." : "Ofset baskı her türlü kağıt ve gramaja uygulanabildiği için oldukça sık kullanılan bir çalışma olarak günümüzde baskı tarihinde yerini sürekli olarak korur."}</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Fast and Serial Production" : "Hızlı ve Seri Üretim"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "With modern technology, digital files can be transferred quickly, enabling serial production." : "Teknolojinin gelişmesi ile ofset baskı ve özellikleri konusundan yararlanan tasarımcı ve baskıcılar direkt olarak bilgisayarda bulunan çalışmayı kağıda aktarabilirler. Daha hızlı yapılacak olan baskılar seri bir şekilde yapılabilir."}</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Clear Results" : "Net Sonuçlar"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "When design and printing teams collaborate closely, clearer and more accurate results are achieved." : "Çalışmaların bir arada yürütüldüğü ve tasarımcı ile baskıcının neredeyse beraber çalıştığı ortamlarda, daha net sonuçlar elde edilebilir."}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6">
                <p className="text-base leading-relaxed text-slate-100">
                  <span className="font-semibold text-amber-400">{isEN ? "With less time spent," : "Daha az zaman harcanarak"}</span>{" "}
                  {isEN
                    ? "these prints can be used much more effectively by designers and printers who master offset printing."
                    : "yapılabilecek olan bu baskılar, ofset baskı ve özellikleri konusuna hakim olan tasarımcılar ve baskıcılar tarafından daha etkin bir şekilde kullanılabilir."}
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
              <span className="font-semibold text-amber-600">{isEN ? "Direct transfer from screen to paper" : "Yapılan çalışmanın bilgisayar ekranından direkt olarak kağıda aktarılabiliyor olması"}</span>{" "}
              {isEN
                ? "is another major advantage. Compared to older methods, these faster workflows continue to be one of the most widely used "
                : "ayrı bir avantaj sağlar. Eski teknolojiye göre daha hızlı yapılabilen bu çalışmalar, günümüzde oldukça fazla kullanılan "}
              <span className="font-semibold text-slate-900">{isEN ? "printing solutions" : "baskı çalışmaları"}</span>{" "}
              {isEN ? "today." : "olmaya devam etmektedir."}
            </p>
          </div>
        </div>
      </section>
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
            aria-label={isEN ? "Close enlarged image" : "Buyutulmus gorseli kapat"}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={print}
            alt={isEN ? "Offset printing technology and features" : "Ofset baskı teknolojisi ve özellikleri"}
            className="max-h-[92vh] w-auto max-w-[92vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default Printing;
