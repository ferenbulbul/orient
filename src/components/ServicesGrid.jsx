import { services } from '../data/services'
import { useLanguage } from '../context/LanguageContext'

const icons = ['🖨️', '📘', '🎯', '💡', '📦', '🚚']

function ServicesGrid() {
  const { isEN } = useLanguage()
  const localizedServices = services.map((service) => {
    if (!isEN) return service
    const map = {
      kartvizit: {
        title: 'Business Card Printing',
        description:
          'Strengthen your corporate identity with premium paper options, embossing, and foil applications.',
      },
      brostur: {
        title: 'Brochure & Catalog',
        description:
          'Design and production for multi-page catalogs, campaign brochures, and corporate booklets.',
      },
      afis: {
        title: 'Poster & Billboard',
        description:
          'Durable, high-resolution prints suitable for both indoor and outdoor use.',
      },
      dijital: {
        title: 'Digital Printing',
        description:
          'Fast and cost-efficient solutions for short runs and personalized prints.',
      },
      ambalaj: {
        title: 'Custom Cut Packaging',
        description:
          'Stand out on shelves with custom boxes, labels, and sticker solutions for your products.',
      },
      lojistik: {
        title: 'Warehouse & Logistics',
        description:
          'On-time delivery assurance with courier service in Istanbul and nationwide shipping.',
      },
    }
    return map[service.id] ? { ...service, ...map[service.id] } : service
  })

  return (
    <section
      id="services"
      className="w-full bg-slate-50 px-6 py-16 text-slate-900 sm:px-10"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
          {isEN ? 'Our Services' : 'Hizmetlerimiz'}
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          {isEN ? 'Consistency and quality in every print run.' : 'Her baskıda tutarlılık ve kalite.'}
        </h2>
        <p className="text-base text-slate-500 sm:text-lg">
          {isEN
            ? 'From design to final delivery, we manage all production processes under one roof. We are a reliable solution partner for brands of all sizes.'
            : 'Tasarımdan son teslimata kadar tüm üretim süreçlerini tek çatı altında yönetiyoruz. Her ölçekten marka için güvenilir çözüm ortağıyız.'}
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {localizedServices.map((service, index) => (
          <article
            key={service.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,23,42,0.15)]"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/90 text-xl">
              {icons[index % icons.length]}
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              {service.title}
            </h3>
            <p className="mt-3 text-sm text-slate-500">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServicesGrid
