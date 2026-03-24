import { Link, useParams } from 'react-router-dom'
import { productCategories } from '../data/products'
import { useLanguage } from '../context/LanguageContext'

function ProductCategory() {
  const { isEN } = useLanguage()
  const { slug } = useParams()
  const product = productCategories[slug]
  const EN_NAMES = {
    Kitap: 'Book',
    Katalog: 'Catalog',
    Takvim: 'Calendar',
    Ajanda: 'Planner',
    'Karton Çanta': 'Paper Bag',
    Dergi: 'Magazine',
  }
  const EN_DESC = {
    kitap: 'From novel series to educational sets, we prepare all types of books with strong color management and premium binding options.',
    katalog: 'Professional production for catalog content.',
    takvim: 'Calendar production portfolio.',
    ajanda: 'Planner production portfolio.',
    'karton-canta': 'Paper bag production portfolio.',
    dergi: 'Expert solutions in magazine production.',
  }
  const EN_GRID_TITLES = {
    "Kalite Kontrol Aşaması": "Quality Control Stage",
  }
  const localizedTitle = isEN ? EN_NAMES[product?.title] ?? product?.title : product?.title
  const localizedDescription = isEN ? EN_DESC[slug] ?? product?.description : product?.description

  if (!product || !product.heroImage) {
    return (
      <div className="page">
        <section className="section section--narrow">
          <h1>{isEN ? 'Product Not Found' : 'Ürün Bulunamadı'}</h1>
          <p>{isEN ? 'We cannot list the product category you are looking for right now.' : 'Aradığınız ürün kategorisini şimdilik listeleyemiyoruz.'}</p>
          <Link className="btn primary" to="/">
            {isEN ? 'Back to Home' : 'Ana Sayfaya Dön'}
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <img
          src={product.heroImage}
          alt={localizedTitle}
          className="h-[320px] w-full object-cover sm:h-[420px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/30 to-transparent" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl items-center px-6">
          <div className="flex flex-col border-l-4 border-amber-300/80 pl-6 text-white sm:pl-10">
            <p className="text-xs uppercase tracking-[0.55em] text-amber-200/90">
              {isEN ? 'What We Produce' : 'Neler Üretiyoruz'}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {localizedTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-100/90 sm:text-lg">
              {localizedDescription}
            </p>
          </div>
        </div>
      </section>

      <div className="page">
        <section className="section pb-16 lg:pb-20">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            {(product.gridItems?.length ? product.gridItems : Array.from({ length: 6 })).map(
              (item, index) => (
                <article
                  key={item?.title ?? index}
                  className="group relative aspect-[16/14] cursor-pointer overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-500 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_35px_90px_rgba(15,23,42,0.18)] active:scale-95"
                >
                  <img
                    src={
                      item?.image ??
                      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={item?.title ?? (isEN ? 'Production' : 'Üretim')}
                    className="h-full w-full object-cover transition duration-[1600ms] ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent transition duration-500 ease-out group-hover:from-slate-950/90 group-active:from-slate-950/75" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col px-6 py-5">
                    <p className="text-lg font-semibold tracking-tight text-white drop-shadow-md">
                      {isEN ? (EN_GRID_TITLES[item?.title] ?? item?.title) : item?.title}
                    </p>
                    <span className="mt-2 h-px w-10 bg-white/60 transition duration-500 group-hover:w-16" />
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductCategory
