import { BookOpen, Scissors, Layers, Package } from "lucide-react";
import binding from '../assets/images/services/mücellet.jpg';

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
                  Mücellit 
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                Baskı sonrası{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  mükemmellik
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Basılmış olan kitap, mecmua, broşür ve buna benzer bütün yazılı veya resimli işlerin bulunduğu kağıtların sayfa ve forma sırasına göre katlanıp bir araya getirilmesi ve bunların blok teşkil ettikten sonra üzerlerine muhafaza olarak bir kap geçirilmesi veya dağılmaması için birbirlerine tutturulması işlemine ciltleme, bu sanata da mücellit sanatı denilmektedir.
              </p>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Hazırlığı, filmi, kağıdı ve baskısı ne kadar mükemmel olsa da, işin mücellithaneden çıktıktan sonraki görünümü ve kalitesi gerçek bir sanattır. Teknolojinin gelişmesiyle harmanlama, dikiş, tutkal, kapak takma, kesme ve paketleme işlemlerini kusursuz bir şekilde gerçekleştiriyoruz.
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

      {/* Detailed Information Section */}
      <section className="relative bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Left Column - Main Text */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Mücellit Nedir?
                </h2>
                <p className="text-base leading-relaxed text-slate-600">
                  Mücellit sadece bir kitabın, bir mecmuanın ciltlenmesi anlamına gelmez. Örneğin, baskı makinesine basılmak için bir iş geldi. Basılacak kağıdın makineye istenilen ebatta kesilerek yüklenecek hale gelmesi de bu işin bir parçasıdır.
                </p>
              </div>

              <div>
                <p className="text-base leading-relaxed text-slate-600">
                  Baskı sonrası formaların birbirini takip edecek şekilde sayfa numarası ile katlanması, yine sıra ile dikilmesi veya tel dikişle tutturulması (zımbalanması), pilyaj yapılması, gofre gibi işlemlerden geçmesi hepsi mücellit işidir.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <p className="text-base leading-relaxed text-slate-700">
                  <span className="font-semibold text-amber-700">Baskı sonrası,</span> basılan bir işin son durumunu gösteren bir ayna görevini yerine getirmektedir. Günümüzde mücellit işçiliği son derece ilerlemiştir. Teknolojinin gelişmesi ile formaların harmanlanması, dikişli tutkalı, kapak takması, kesme işlemleri, hatta paketleme işlemleri bile makineler tarafından yapılmaktadır.
                </p>
              </div>
            </div>

            {/* Right Column - Terms */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Ciltcilik Terimleri</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Kırım & Katlama</h4>
                  <p className="text-sm text-slate-600 mt-1">Basılı bir formayı katlama işi. Kağıdın istenilen ölçüde katlanması.</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Harmanlama</h4>
                  <p className="text-sm text-slate-600 mt-1">Formaların, cilt öncesi kitap birimi haline getirilmek üzere sırayla yan yana veya iç içe dizilmesi.</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Perforaj</h4>
                  <p className="text-sm text-slate-600 mt-1">Basılan bir işin aynı sayfa üzerinden rahat koparılabilmesi için sık aralıklarla açılan delik işlemi.</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Pilyaj</h4>
                  <p className="text-sm text-slate-600 mt-1">Cilt işlerinde, katlamayı kolaylaştırmak için karton veya mukavva üzerinde oyuk açmak.</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Tel Dikiş & Omega Tel Dikiş</h4>
                  <p className="text-sm text-slate-600 mt-1">En az iki yaprağın birbirine tel ile zımbalanması. Omega: Dosyalara takabilmek için sırtı kambur şeklindeki çeşit.</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Amerikan Cilt</h4>
                  <p className="text-sm text-slate-600 mt-1">Harmanlanan formaların freze ile sırtlarının tıraşlanması ve tutkallanarak yapıştırılması işlemi.</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">İplik Dikiş</h4>
                  <p className="text-sm text-slate-600 mt-1">Düğümlü, atlamalı veya normal olarak çeşitleri olan ve harmanlanan formaların iplik ile birbirlerine sırt kısımlarından tutturulma işlemi.</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Şömiz (Gömlek)</h4>
                  <p className="text-sm text-slate-600 mt-1">Genellikle kitapların kapakları üzerine geçirilen baskılı koruma kapakçığı.</p>
                </div>
                
                <div className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-semibold text-slate-900 text-sm">Gofre</h4>
                  <p className="text-sm text-slate-600 mt-1">Kalın kağıt veya karton üzerine içten veya dıştan olmak üzere yapılan baskı kabartma.</p>
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
              <span className="font-semibold text-amber-600">Eğri kapak, karışık formalar veya hatalı kesimler değil,</span>{" "}
              kusursuz bitmiş ürünler için detaylı kalite kontrolü uyguluyoruz.
              Mücellit işçiliğinde son derece ilerlemiş teknoloji ile{" "}
              <span className="font-semibold text-slate-900">geleneksel sanatı</span>{" "}
              birleştiriyoruz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Binding;