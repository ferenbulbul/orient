import { Link } from 'react-router-dom'

const products = [
  {
    id: 'kitap',
    slug: 'kitap',
    title: 'Kitap',
    image:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'katalog',
    slug: 'katalog',
    title: 'Katalog',
    image:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'takvim',
    slug: 'takvim',
    title: 'Takvim',
    image:
      'https://images.unsplash.com/photo-1512427691650-1e2949487aec?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'ajanda',
    slug: 'ajanda',
    title: 'Ajanda',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'karton-canta',
    slug: 'karton-canta',
    title: 'Karton Çanta',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'dergi',
    slug: 'dergi',
    title: 'Dergi',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
  },
]

const marqueeItems = [...products, ...products]

function ProductShowcase() {

  return (
    <section id="product-band" className="w-full bg-slate-950 py-16 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-300">
          Neler Üretiyoruz
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-semibold">Markanızı taşıyan baskılar.</h2>
          <p className="text-sm text-slate-300">
            Ofset ve dijital parkurlarımızla kitap, katalog ve promosyon ürünlerini premium kaliteyle üretiyoruz.
          </p>
        </div>
      </div>
      <div className="group relative mt-10 overflow-hidden">
        <div className="flex gap-4 px-4 py-0 md:gap-6 md:px-6">
          <div className="flex min-w-max flex-nowrap gap-4 md:gap-6 animate-[marquee-reverse_30s_linear_infinite] group-hover:[animation-play-state:paused]">
            {marqueeItems.map((product, index) => (
              <Link
                to={`/urunler/${product.slug}`}
                key={`${product.id}-${index}`}
                className="group/product relative block min-w-[240px] overflow-hidden rounded-3xl shadow-lg md:min-w-[320px]"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-44 w-full object-cover transition duration-500 group-hover/product:scale-105 md:h-56"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 py-4">
                  <span className="text-xl font-semibold">{product.title}</span>
                  <span className="text-sm text-amber-300">Ürün</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase
