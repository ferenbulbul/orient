import { Link } from "react-router-dom";
import book from "../assets/images/category/book.jpg";
import calender from "../assets/images/category/calender.jpg";
import agenda from "../assets/images/category/agenda.jpg";
import cardboard from "../assets/images/category/cardboard.jpg";
import catalog from "../assets/images/category/catalog.jpg";
import magazine from "../assets/images/category/magazine.jpg";

const products = [
  { id: "kitap", slug: "kitap", title: "Kitap", image: book },
  { id: "katalog", slug: "katalog", title: "Katalog", image: catalog },
  { id: "takvim", slug: "takvim", title: "Takvim", image: calender },
  { id: "ajanda", slug: "ajanda", title: "Ajanda", image: agenda },
  { id: "karton-canta", slug: "karton-canta", title: "Karton Çanta", image: cardboard },
  { id: "dergi", slug: "dergi", title: "Dergi", image: magazine },
];

const marqueeItems = [...products, ...products];

function ProductShowcase() {
  return (
    <section
      id="product-band"
      className="relative w-full bg-[#0b1220] py-16 text-white sm:py-20"
    >
      {/* Header */}
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-xs uppercase tracking-[0.45em] text-amber-200">
          Neler Üretiyoruz
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Üretim gücümüzden seçkiler
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Ofset ve dijital parkurlarımızda kitap, katalog, ajanda ve
          promosyon ürünlerini kurumsal standartlarda üretiyoruz.
        </p>
      </div>

      {/* Marquee */}
      <div className="group relative mt-10 overflow-hidden">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0b1220] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0b1220] to-transparent" />

        <div className="flex items-center px-4 md:px-6">
          <div
            className="
              flex min-w-max flex-nowrap items-center gap-5 md:gap-7
              animate-[marquee-reverse_42s_linear_infinite]
              will-change-transform
              group-hover:[animation-play-state:paused]
            "
          >
            {marqueeItems.map((product, index) => (
              <Link
                to={`/urunler/${product.slug}`}
                key={`${product.id}-${index}`}
                className="
                  group/product relative block min-w-[260px] md:min-w-[320px]
                  overflow-hidden rounded-[28px]
                  border border-white/15 bg-white/5
                  shadow-[0_24px_56px_rgba(0,0,0,0.2)]
                "
              >
                {/* Image wrapper – SAFARI SAFE */}
                <div className="relative aspect-[3/2] overflow-hidden bg-slate-900/30">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="
                      absolute inset-0 h-full w-full
                      object-cover object-center
                      transition duration-700 ease-out
                      group-hover/product:scale-105
                      [transform:translate3d(0,0,0)]
                    "
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.9)] via-[rgba(11,18,32,0.35)] to-transparent" />
                </div>

                {/* Title */}
                <div className="absolute inset-x-0 bottom-0 px-6 py-4">
                  <span className="block uppercase tracking-[0.4em] text-amber-300 text-sm">
                    {product.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;
