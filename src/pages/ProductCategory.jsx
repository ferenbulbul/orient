import { Link, useParams } from 'react-router-dom'
import { productCategories } from '../data/products'

function ProductCategory() {
  const { slug } = useParams()
  const product = productCategories[slug]

  if (!product || !product.heroImage) {
    return (
      <div className="page">
        <section className="section section--narrow">
          <h1>Ürün Bulunamadı</h1>
          <p>Aradığınız ürün kategorisini şimdilik listeleyemiyoruz.</p>
          <Link className="btn primary" to="/">
            Ana Sayfaya Dön
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
          alt={product.title}
          className="h-[320px] w-full object-cover sm:h-[420px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/30 to-transparent" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl items-center px-6">
          <div className="flex flex-col border-l-4 border-amber-300/80 pl-6 text-white sm:pl-10">
            <p className="text-xs uppercase tracking-[0.55em] text-amber-200/90">
              Neler Üretiyoruz
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {product.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-100/90 sm:text-lg">
              {product.description}
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
                    alt={item?.title ?? 'Üretim'}
                    className="h-full w-full object-cover transition duration-[1600ms] ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent transition duration-500 ease-out group-hover:from-slate-950/90 group-active:from-slate-950/75" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col px-6 py-5">
                    <p className="text-lg font-semibold tracking-tight text-white drop-shadow-md">
                      {item?.title}
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
