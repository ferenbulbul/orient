import { BookOpen, Scissors, Layers, Package, ZoomIn, X } from "lucide-react";
import { useState } from "react";
import binding from "../assets/images/machine/bsMücellit2.jpg";
import { useLanguage } from "../context/LanguageContext";

const BINDING_POINTS = [
  {
    icon: Layers,
    title: "Harmanlama & Katlama",
    description: "Formaların sayfa sırasına göre yan yana veya iç içe dizilmesi ve kağıdın istenilen ölçüde katlanması işlemleri hassasiyetle gerçekleştirilir."
  },
  {
    icon: BookOpen,
    title: "Dikiş & Ciltleme Çeşitleri",
    description: "Tel dikiş, omega tel dikiş, iplik dikiş ve amerikan cilt gibi farklı ciltleme teknikleriyle her projeye uygun çözümler sunuyoruz."
  },
  {
    icon: Scissors,
    title: "Kesim & Şekillendirme",
    description: "Profesyonel kesim teknolojileriyle hassas ölçüler ve düzgün kenar kesimleri sağlıyoruz. Gofre, perforaj ve pilyaj işlemleri ile özel şekillendirmeler."
  },
  {
    icon: Package,
    title: "Kapak İşleme & Paketleme",
    description: "Sert kapak, lak, selofon ve şömiz uygulamaları ile son kalite kontrol ve paketleme aşamalarında titizlikle çalışıyoruz."
  }
];

function Binding() {
  const { isEN } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const points = isEN
    ? [
        { icon: Layers, title: "Gathering & Folding", description: "Signatures are arranged and folded precisely according to page sequence and target format." },
        { icon: BookOpen, title: "Stitching & Binding Types", description: "We provide tailored solutions with wire stitch, omega stitch, thread stitch, and perfect binding options." },
        { icon: Scissors, title: "Cutting & Finishing", description: "Professional cutting technology ensures precise dimensions and clean edges, including embossing, perforation, and creasing." },
        { icon: Package, title: "Cover Processing & Packaging", description: "Hard cover, varnish, lamination, and dust jacket applications are completed with final quality control and packaging." },
      ]
    : BINDING_POINTS;

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
                  {isEN ? "Bindery" : "Mücellit"} 
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                {isEN ? "Post-press " : "Baskı sonrası"}{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  {isEN ? "excellence" : "mükemmellik"}
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {isEN
                  ? "Binding is the process of folding and assembling printed sheets such as books, magazines, and brochures in the correct page order, then securing them with a cover or fastening method."
                  : "Basılmış olan kitap, mecmua, broşür ve buna benzer bütün yazılı veya resimli işlerin bulunduğu kağıtların sayfa ve forma sırasına göre katlanıp bir araya getirilmesi ve bunların blok teşkil ettikten sonra üzerlerine muhafaza olarak bir kap geçirilmesi veya dağılmaması için birbirlerine tutturulması işlemine ciltleme, bu sanata da mücellit sanatı denilmektedir."}
              </p>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {isEN
                  ? "No matter how perfect prepress and printing are, final appearance depends on bindery quality. With modern technology, we execute gathering, stitching, gluing, casing-in, cutting, and packaging flawlessly."
                  : "Hazırlığı, filmi, kağıdı ve baskısı ne kadar mükemmel olsa da, işin mücellithaneden çıktıktan sonraki görünümü ve kalitesi gerçek bir sanattır. Teknolojinin gelişmesiyle harmanlama, dikiş, tutkal, kapak takma, kesme ve paketleme işlemlerini kusursuz bir şekilde gerçekleştiriyoruz."}
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
                  src={binding}
                  alt={isEN ? "Binding and post-press processes" : "Ciltleme ve mücellit süreçleri"}
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

      {/* Binding Points */}
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
            
            {/* Left Column - Main Text */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {isEN ? "What Is Bindery?" : "Mücellit Nedir?"}
                </h2>
                <p className="text-base leading-relaxed text-slate-600">
                  {isEN
                    ? "Bindery is not only about binding a book or magazine. It also includes preparing sheets to the required size and making them ready for production."
                    : "Mücellit sadece bir kitabın, bir mecmuanın ciltlenmesi anlamına gelmez. Örneğin, baskı makinesine basılmak için bir iş geldi. Basılacak kağıdın makineye istenilen ebatta kesilerek yüklenecek hale gelmesi de bu işin bir parçasıdır."}
                </p>
              </div>

              <div>
                <p className="text-base leading-relaxed text-slate-600">
                  {isEN
                    ? "Post-press operations include folding signatures in sequence, stitching or wire binding, creasing, embossing, and similar finishing processes."
                    : "Baskı sonrası formaların birbirini takip edecek şekilde sayfa numarası ile katlanması, yine sıra ile dikilmesi veya tel dikişle tutturulması (zımbalanması), pilyaj yapılması, gofre gibi işlemlerden geçmesi hepsi mücellit işidir."}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <p className="text-base leading-relaxed text-slate-700">
                  <span className="font-semibold text-amber-700">{isEN ? "Post-press" : "Baskı sonrası,"}</span> {isEN
                    ? "acts as the mirror of final product quality. Today, bindery technology is highly advanced; gathering, stitching, gluing, casing-in, cutting, and packaging are largely machine-driven."
                    : "basılan bir işin son durumunu gösteren bir ayna görevini yerine getirmektedir. Günümüzde mücellit işçiliği son derece ilerlemiştir. Teknolojinin gelişmesi ile formaların harmanlanması, dikişli tutkalı, kapak takması, kesme işlemleri, hatta paketleme işlemleri bile makineler tarafından yapılmaktadır."}
                </p>
              </div>
            </div>

            {/* Right Column - Terms */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">{isEN ? "Bindery Terms" : "Ciltcilik Terimleri"}</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Scoring & Folding" : "Kırım & Katlama"}</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Folding printed signatures to required dimensions." : "Basılı bir formayı katlama işi. Kağıdın istenilen ölçüde katlanması."}</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Gathering" : "Harmanlama"}</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Arranging signatures in sequence before binding." : "Formaların, cilt öncesi kitap birimi haline getirilmek üzere sırayla yan yana veya iç içe dizilmesi."}</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Perforation" : "Perforaj"}</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Creating frequent tiny cuts to allow easy tear-off from the same sheet." : "Basılan bir işin aynı sayfa üzerinden rahat koparılabilmesi için sık aralıklarla açılan delik işlemi."}</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Pilyaj</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Creating a groove on cardboard/board to enable easier folding." : "Cilt işlerinde, katlamayı kolaylaştırmak için karton veya mukavva üzerinde oyuk açmak."}</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Tel Dikiş & Omega Tel Dikiş</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Stapling at least two sheets together with wire. Omega is the hump-backed version suitable for filing." : "En az iki yaprağın birbirine tel ile zımbalanması. Omega: Dosyalara takabilmek için sırtı kambur şeklindeki çeşit."}</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Perfect Binding" : "Amerikan Cilt"}</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Trimming signature spines by milling and bonding them with glue." : "Harmanlanan formaların freze ile sırtlarının tıraşlanması ve tutkallanarak yapıştırılması işlemi."}</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Thread Sewing" : "İplik Dikiş"}</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Attaching gathered signatures together from the spine using thread sewing methods." : "Düğümlü, atlamalı veya normal olarak çeşitleri olan ve harmanlanan formaların iplik ile birbirlerine sırt kısımlarından tutturulma işlemi."}</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Dust Jacket" : "Şömiz (Gömlek)"}</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Printed protective jacket wrapped over book covers." : "Genellikle kitapların kapakları üzerine geçirilen baskılı koruma kapakçığı."}</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Gofre</h4>
                  <p className="text-sm text-slate-600 mt-1">{isEN ? "Embossing/debossing on thick paper or cardboard." : "Kalın kağıt veya karton üzerine içten veya dıştan olmak üzere yapılan baskı kabartma."}</p>
                </div>
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
              <span className="font-semibold text-amber-600">{isEN ? "Not bent covers, mixed signatures, or faulty cuts," : "Eğri kapak, karışık formalar veya hatalı kesimler değil,"}</span>{" "}
              {isEN
                ? "we apply detailed quality control for flawless finished products. In bindery workmanship, we combine advanced technology with "
                : "kusursuz bitmiş ürünler için detaylı kalite kontrolü uyguluyoruz. Mücellit işçiliğinde son derece ilerlemiş teknoloji ile "}
              <span className="font-semibold text-slate-900">{isEN ? "traditional craft" : "geleneksel sanatı"}</span>{" "}
              {isEN ? "together." : "birleştiriyoruz."}
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
            src={binding}
            alt={isEN ? "Binding and post-press processes" : "Ciltleme ve mücellit süreçleri"}
            className="max-h-[92vh] w-auto max-w-[92vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default Binding;
