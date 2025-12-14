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
          className="h-[360px] w-full object-cover sm:h-[440px]"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 mx-auto flex max-w-5xl flex-col justify-center px-6 text-white">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Neler Üretiyoruz</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            {product.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-100 sm:text-lg">
            {product.description}
          </p>
        </div>
      </section>

      <div className="page">
        <section className="section">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(product.gridItems?.length ? product.gridItems : Array.from({ length: 6 })).map(
              (item, index) => (
                <article
                  key={item?.title ?? index}
                  className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
                >
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={item?.image ?? 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'}
                      alt={item?.title ?? 'Üretim'}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-lg font-semibold text-slate-900">
                      {item?.title ?? 'Yeni ürün grubu hazırlanıyor'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item?.title
                        ? 'Teknik şartnamelerinize göre kişiselleştirilir.'
                        : 'Bu kategori kısa süre içinde güncellenecektir.'}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="section section--narrow">
          <div className="contact-cta__actions" style={{ marginTop: 0 }}>
            <Link className="btn primary" to="/contact">
              Teklif Al
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductCategory
