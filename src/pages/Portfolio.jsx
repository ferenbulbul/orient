import { BRAND_LOGOS } from '../data/brands'
import portfolio from "../assets/images/services/portfolio.jpg";

function Portfolio() {
  return (
    <div className="bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <img
          src={portfolio}
          alt="Kurumsal çalışmalar"
          className="h-[320px] w-full object-cover sm:h-[420px]"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 mx-auto flex max-w-5xl flex-col justify-center px-6 text-white">
          <p className="text-xs uppercase tracking-[0.6em] text-amber-300/90">
            Güvenilir İş Ortakları
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Portfolyo</h1>
          <p className="mt-4 max-w-3xl text-base text-slate-100 sm:text-lg">
            Çözüm ortağı olduğumuz markaların kurumsal dünyasına baskı kalitemiz ile değer katıyoruz.
            Aşağıda seçili referanslarımızdan bazılarını bulabilirsiniz.
          </p>
        </div>
      </section>

      <div className="page">
        <section className="section">
          <div className="section__heading">
            <p className="eyebrow">Markalar</p>
            <h2>Stratejik iş ortaklıkları.</h2>
            <p>
              Finans, medya, üretim ve perakende alanlarında faaliyet gösteren markaların baskı
              ihtiyaçlarını kurumsal standartlarda yönetiyoruz.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {BRAND_LOGOS.map((brand) => (
              <article
                key={brand.id}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.15)]"
              >
                <div className="aspect-square p-6">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logosu`}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Portfolio
