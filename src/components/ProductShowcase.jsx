import { useEffect, useRef } from 'react'

const products = [
  {
    id: 'kitap',
    title: 'Kitap',
    image:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'katalog',
    title: 'Katalog',
    image:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'takvim',
    title: 'Takvim',
    image:
      'https://images.unsplash.com/photo-1512427691650-1e2949487aec?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'ajanda',
    title: 'Ajanda',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'karton-canta',
    title: 'Karton Çanta',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'dergi',
    title: 'Dergi',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
  },
]

function ProductShowcase() {
  const trackRef = useRef(null)
  const pauseRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const interval = setInterval(() => {
      if (pauseRef.current || !track) return
      const firstCard = track.querySelector('[data-card]')
      if (!firstCard) return
      const cardWidth = firstCard.clientWidth + 24
      const maxScroll = track.scrollWidth - track.clientWidth
      let next = track.scrollLeft + cardWidth
      if (next >= maxScroll) {
        next = 0
      }
      track.scrollTo({ left: next, behavior: 'smooth' })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full bg-slate-950 py-16 text-white">
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
      <div className="relative mt-10" onMouseEnter={() => (pauseRef.current = true)} onMouseLeave={() => (pauseRef.current = false)}>
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 pt-2 scroll-smooth"
        >
          {products.map((product) => (
            <article
              key={product.id}
              data-card
              className="group relative min-w-[320px] snap-start overflow-hidden rounded-3xl"
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 py-4">
                <span className="text-xl font-semibold">{product.title}</span>
                <span className="text-sm text-amber-300">Üretim</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase
