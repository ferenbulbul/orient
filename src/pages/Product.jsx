import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'

function Product() {
  const { slug } = useParams()
  const product = useMemo(() => products.find((item) => item.slug === slug), [slug])

  if (!product) {
    return (
      <div className="page">
        <section className="section section--narrow">
          <h1>Ürün bulunamadı</h1>
          <p>Aradığınız ürün stoklarımızda görünmüyor. Lütfen katalog sayfamızı ziyaret edin.</p>
          <Link className="btn primary" to="/portfolio">
            Çalışmalarımıza Geri Dön
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
          className="h-[420px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 mx-auto flex max-w-5xl flex-col justify-center px-6 text-white">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Üretim</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{product.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-100 sm:text-lg">
            {product.subtitle}
          </p>
        </div>
      </section>

      <div className="page">
        <section className="section section--narrow">
          <p className="eyebrow">Ürün Tanımı</p>
          <p className="text-lg text-slate-600">{product.shortDescription}</p>
        </section>

        <section className="section">
          <div className="section__heading">
            <p className="eyebrow">Kullanım Alanları</p>
            <h2>Her sektöre uyum sağlayan baskı çözümleri.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.bulletFeatures.map((feature) => (
              <article key={feature} className="card">
                <p>{feature}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section__heading">
            <p className="eyebrow">Neden Euromat Print?</p>
            <h2>Planlama, üretim ve teslimat tek ekipte.</h2>
            <p>
              Tüm ürün familyaları için aynı kalite standartlarını uygular, veri temelli
              üretim planları ile teslim tarihlerini garanti altına alırız.
            </p>
          </div>
          <div className="contact-cta__actions" style={{ marginTop: 24 }}>
            <Link className="btn primary" to="/contact">
              Teklif Al
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Product
