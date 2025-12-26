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
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80',
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
    <section id="product-band" className="relative w-full bg-[#0b1220] py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-amber-200">Neler Üretiyoruz</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Üretim gücümüzden seçkiler
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Ofset ve dijital parkurlarımızda kitap, katalog, ajanda ve promosyon ürünlerini kurumsal
              standartlarda üretiyoruz.
            </p>
          </div>
          <div className="flex gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-white/15 px-3 py-1">Ofset</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Dijital</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Mücellit</span>
          </div>
        </div>
      </div>

      <div className="group relative mt-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0b1220] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0b1220] to-transparent" />
        <div className="flex gap-5 px-4 md:gap-7 md:px-6">
          <div className="flex min-w-max flex-nowrap gap-5 md:gap-7 animate-[marquee-reverse_28s_linear_infinite] group-hover:[animation-play-state:paused]">
            {marqueeItems.map((product, index) => (
              <Link
                to={`/urunler/${product.slug}`}
                key={`${product.id}-${index}`}
                className="group/product relative block min-w-[240px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.18)] md:min-w-[320px]"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-48 w-full object-cover transition duration-700 ease-out group-hover/product:scale-110 md:h-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.9)] via-[rgba(11,18,32,0.35)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 py-4">
                  <span className="text-lg font-semibold tracking-tight">{product.title}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-amber-200">Ürün</span>
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
