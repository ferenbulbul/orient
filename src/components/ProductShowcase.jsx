
import { Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import book from "../assets/images/category/book.jpg";
import calender from "../assets/images/category/calender.jpg";
import agenda from "../assets/images/category/agenda.jpg";
import cardboard from "../assets/images/category/cardboard.jpg";
import catalog from "../assets/images/category/catalog.jpg";
import magazine from "../assets/images/category/magazine.jpg";

const products = [
  { 
    id: "kitap", 
    slug: "kitap", 
    title: "Kitap", 
    image: book,
    description: "Ciltli ve karton kapak",

  },
  { 
    id: "katalog", 
    slug: "katalog", 
    title: "Katalog", 
    image: catalog,
    description: "Ürün ve hizmet tanıtımı",

  },
  { 
    id: "takvim", 
    slug: "takvim", 
    title: "Takvim", 
    image: calender,
    description: "Kurumsal ve promosyon",

  },
  { 
    id: "ajanda", 
    slug: "ajanda", 
    title: "Ajanda", 
    image: agenda,
    description: "Deri ve bez kaplı",

  },
  { 
    id: "karton-canta", 
    slug: "karton-canta", 
    title: "Karton Çanta", 
    image: cardboard,
    description: "Lüks ve ekonomik",

  },
  { 
    id: "dergi", 
    slug: "dergi", 
    title: "Dergi", 
    image: magazine,
    description: "Periyodik yayınlar",

  },
];

function ProductShowcase() {
  const { isEN } = useLanguage();
  const localizedProducts = products.map((product) => {
    const map = {
      Kitap: { title: "Book", description: "Hardcover and paperback" },
      Katalog: { title: "Catalog", description: "Product and service promotion" },
      Takvim: { title: "Calendar", description: "Corporate and promotional" },
      Ajanda: { title: "Planner", description: "Leather and fabric cover" },
      "Karton Çanta": { title: "Paper Bag", description: "Premium and economical" },
      Dergi: { title: "Magazine", description: "Periodical publications" },
    };
    if (!isEN || !map[product.title]) return product;
    return { ...product, ...map[product.title] };
  });
  const marqueeItems = [...localizedProducts, ...localizedProducts];

  return (
    <section
      id="product-band"
      className="relative w-full overflow-hidden bg-white py-28"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              {isEN ? "Our Product Portfolio" : "Ürün Portföyümüz"}
            </span>
          </div>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {isEN ? "What do we " : "Neler "}
            <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
              {isEN ? "produce?" : "üretiyoruz?"}
            </span>
          </h2>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            {isEN
              ? "We produce books, catalogs, planners, and promotional products at corporate quality standards in our offset and digital lines."
              : "Ofset ve dijital parkurlarımızda kitap, katalog, ajanda ve promosyon ürünlerini kurumsal standartlarda üretiyoruz."}
          </p>
        </div>
      </div>

      {/* Enhanced Marquee */}
      <div className="group relative z-10 mt-16 overflow-hidden">
        {/* Enhanced Edge Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-gradient-to-r from-white via-white/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-gradient-to-l from-white via-white/80 to-transparent" />

        <div className="flex items-center px-4 md:px-6">
          <div
            className="
              flex min-w-max flex-nowrap items-center gap-8
              animate-[marquee-reverse_50s_linear_infinite]
              will-change-transform
              group-hover:[animation-play-state:paused]
            "
          >
            {marqueeItems.map((product, index) => (
              <div

                key={`${product.id}-${index}`}
                className="
                  group/product relative block min-w-[280px] md:min-w-[340px]
                  overflow-hidden rounded-3xl
                  bg-white
                  border border-slate-200
                  shadow-[0_20px_40px_rgba(15,23,42,0.08)]
                  transition-all duration-500
                  hover:-translate-y-2
                  hover:shadow-[0_30px_60px_rgba(15,23,42,0.12)]
                  hover:border-amber-300
                "
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-400/0 transition-all duration-500 group-hover/product:from-amber-400/5 group-hover/product:to-transparent" />

                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="
                      absolute inset-0 h-full w-full object-cover
                      transition-all duration-700 ease-out
                      group-hover/product:scale-110
                    "
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent transition-opacity duration-500 group-hover/product:from-slate-900/70" />
                  
                  

                  {/* Bottom Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-200">
                      {product.description}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;
