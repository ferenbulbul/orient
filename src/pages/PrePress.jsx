import { FileText, Monitor, Image, Settings } from "lucide-react";
import prepressImage from "../assets/images/machine/böCTPbaskıöncesi.jpg";
import { useLanguage } from "../context/LanguageContext";

const PREPRESS_POINTS = [
  {
    icon: Monitor,
    title: "CTP Teknolojisi",
    description: "Computer to Plate (Bilgisayardan kalıba pozlandırma) teknolojisi ile filme gerek duymadan doğrudan baskı kalıbına aktarım yapıyoruz."
  },
  {
    icon: Image,
    title: "Dosya Formatları & Renk Yönetimi",
    description: "PDF, PSD, AI, INDD, SVG ve EPS formatlarında CMYK modunda çalışıyoruz. Doğru profil kullanımı ile renk tonlamalarını koruyoruz."
  },
  {
    icon: Settings,
    title: "Baskı Öncesi Ayarlar",
    description: "Kalıp takma, kağıt hazırlığı, mürekkep ayarları ve makine kontrollerini titizlikle gerçekleştiriyoruz."
  },
  {
    icon: FileText,
    title: "Kalite Standartları",
    description: "300 DPI çözünürlük standardı ve profesyonel dosya kontrolü ile kusursuz baskı hazırlığı sağlıyoruz."
  }
];

function Prepress() {
  const { isEN } = useLanguage();
  const points = isEN
    ? [
        {
          icon: Monitor,
          title: "CTP Technology",
          description: "Using Computer to Plate technology, we transfer directly to printing plates without film.",
        },
        {
          icon: Image,
          title: "File Formats & Color Management",
          description: "We work in PDF, PSD, AI, INDD, SVG and EPS formats in CMYK mode, preserving tones with proper profiles.",
        },
        {
          icon: Settings,
          title: "Prepress Settings",
          description: "Plate mounting, paper preparation, ink settings and machine controls are handled with precision.",
        },
        {
          icon: FileText,
          title: "Quality Standards",
          description: "We deliver flawless preparation with 300 DPI resolution standards and professional file checks.",
        },
      ]
    : PREPRESS_POINTS;

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
                <FileText className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  {isEN ? "Graphic Design" : "Grafik Tasarım"}
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                {isEN ? "Prepress " : "Baskı öncesi"}{" "}
                <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  {isEN ? "preparation" : "hazırlık"}
                </span>{" "}
                {isEN ? "stages" : "aşamaları"}
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {isEN
                  ? "With modern print technologies, the industry has advanced significantly. A successful print job requires solid technical preparation."
                  : "Teknolojinin nimetlerinden olan baskı teknolojileri ile matbaa sektörü oldukça gelişmiş bir hal almış durumdadır. Başarılı bir baskı çalışması için bilinmesi gereken birçok bilgi vardır."}
              </p>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {isEN
                  ? "Prepress decisions vary by sector and directly improve final print quality. Teams that invest in prepress preparation consistently deliver better results."
                  : "Kullanılacak olan sektöre göre değişecek olan baskı çalışmaları, matbaa baskı işlemlerinin daha başarılı olmasını sağlar. Matbaa baskı öncesi hazırlık aşaması yapan kişiler her zaman için daha başarılı sonuçlara imza atma şansına sahip olurlar."}
              </p>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="group overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <img
                  src={prepressImage}
                  alt={isEN ? "Graphic design and prepress preparation processes" : "Grafik tasarım ve baskı öncesi hazırlık süreçleri"}
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

      {/* Prepress Points */}
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
            
            {/* Left Column - CTP & Resim Formatları */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {isEN ? "Advantage of CTP" : "CTP'nin Avantajı"}
                </h2>
                <p className="text-base leading-relaxed text-slate-600">
                  {isEN
                    ? "In printing, prepress preparation is strongly connected with CTP. CTP (Computer to Plate) means direct exposure from computer to plate and is widely used."
                    : "Matbaacılık için matbaada baskıdan önce hazırlık aşaması denildiği anda akla CTP gelir. CTP (Computer to Plate) bilgisayardan kalıba pozlandırma olarak bilinir. Bu teknoloji oldukça kullanılan bir teknolojidir."}
                </p>
                <p className="text-base leading-relaxed text-slate-600 mt-4">
                  {isEN
                    ? "With CTP in offset printing, transfer to plate is done without film. Film-based workflows have higher error risk; therefore CTP is preferred in modern prepress."
                    : "Ofset baskının daha kolay olanı olan CTP ile kalıba aktarım yapılırken filme gerek duyulmadan baskı işleminin yapılmasıdır. Ayrıca film ile çalışma yapılacağı durumlarda hata riski daha fazla olur. Günümüzde matbaada baskıdan önce hazırlık aşaması çalışmalarında CTP'den yararlanılır."}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{isEN ? "Image Formats" : "Resimlerin Formatı"}</h3>
                <p className="text-base leading-relaxed text-slate-700">
                  {isEN
                    ? "Image formats are critical in print production, so format checks are an essential part of prepress."
                    : "Yapılacak olan baskılama işlemlerinde resimlerin formatları da önemli olmasından dolayı matbaa baskı öncesi hazırlık aşaması çalışmalarında resim formatlarına da bakılması gerekir."}
                </p>
                <p className="text-base leading-relaxed text-slate-700 mt-3">
                  {isEN
                    ? <>Images should be in <span className="font-semibold text-amber-700">PDF, PSD, AI, INDD, SVG or EPS</span> formats and prepared in CMYK mode rather than RGB.</>
                    : <>Baskısı alınacak olan resimlerin formatının <span className="font-semibold text-amber-700">PDF, PSD, AI, INDD, SVG veya EPS</span> olması gerekir. CMYK modunda olması gereken bu resimlerin RGB modunda çalışmaması gerekir.</>}
                </p>
                <p className="text-sm leading-relaxed text-slate-600 mt-3">
                  {isEN
                    ? "When converting RGB sources to CMYK, correct color profiles must be used; otherwise color shifts may occur."
                    : "RGB formatlı kaynakların CMYK format dönüştürmeleri yapılırken doğru profilde olmasına dikkat edilmelidir. Doğru profil kullanılmayan çeviri formatlarında farklı renk tonlamaları ortaya çıkabilir."}
                </p>
              </div>
            </div>

            {/* Right Column - Baskı Öncesi Ayarlar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">{isEN ? "Required Prepress Settings" : "Baskı Öncesi Yapılması Gereken Ayarlar"}</h3>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Plate Mounting" : "Kalıp Takma"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "The first step is mounting the plate onto the cylinder. The plate must be centered and aligned correctly." : "Yapılacak olan ilk işlem kazana germe çubuğu ile kalıp takılır. Kalıbın düzgün ve ortalı takılması gerekir."}</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Paper Preparation" : "Kağıt Hazırlığı"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "Aerated paper is loaded to prevent sheets from sticking together at the edges." : "Havalandırılan kağıt asansöre yerleştirilir. Kağıdın havalandırılmasının sebebi kenarların birbirine yapışmaması içindir."}</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Ink Settings" : "Mürekkep Ayarları"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "Ink viscosity and color should be adjusted according to paper properties and original design requirements." : "Daha kaliteli bir baskı için mürekkebin olduğu gibi kullanılması gerekir. Kullanılacak olan kağıdın inceliğine göre mürekkebin inceliği, baskı orijinaline göre de mürekkebin rengi ayarlanmalıdır."}</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Equipment Checks" : "Ekipman Kontrolleri"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "Suction heads, vacuum systems, transport roller pressure, double-sheet controls, guides, and grippers are checked according to paper type." : "Kağıdın özelliklerine göre ayarlanacak olan emici kafa ayarlanır ve vakum lastikleri düzenlenir. Transport makaraların basınçları, çift kağıt kontrol ekipmanları, makaslar ve siperler gözden geçirilerek kontrol edilir."}</p>
                  </div>
                  
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isEN ? "Resolution Standard" : "Çözünürlük Standardı"}</h4>
                    <p className="text-sm text-slate-600 mt-1">{isEN ? "Using 300 DPI images helps ensure high-quality print output." : "Baskı alınacak olan resimlerin 300 DPI olması kaliteli bir baskının alınmasını sağlar."}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6">
                <p className="text-base leading-relaxed text-slate-100">
                  <span className="font-semibold text-amber-400">{isEN ? "Consistently high-quality printing" : "Her zaman için daha kaliteli baskı almak,"}</span>{" "}
                  {isEN
                    ? "requires meticulous prepress preparation. With proper setup, images can be printed at a much better quality."
                    : "baskıdan önce hazırlık aşaması çalışmalarının titizlikle yapılmasını gerektirir. Yapılan çalışmalar ile resimler daha iyi bir kalitede baskıya alınabilir."}
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
              <span className="font-semibold text-amber-600">{isEN ? "From selected dimensions and paper types" : "Belirlenecek olan ölçüler ve kullanılacak olan kağıtlar,"}</span>{" "}
              {isEN
                ? "to image formats and press settings, many factors must be prepared correctly. In printing, equipment knowledge and "
                : "resimlerin formatlarından baskı ayarlarına kadar birçok konu için çalışma yapılması gerekir. Matbaa sektöründe cihaz bilgisine sahip olmak ve "}
              <span className="font-semibold text-slate-900">{isEN ? "meticulous preparation" : "titiz hazırlık çalışmaları"}</span>{" "}
              {isEN ? "are the foundation of successful outcomes." : "başarılı sonuçların temelidir."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Prepress;
