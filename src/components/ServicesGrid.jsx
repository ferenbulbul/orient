import { services } from '../data/services'

function ServicesGrid() {
  return (
    <section className="section" id="services">
      <div className="section__heading">
        <p className="eyebrow">Hizmetlerimiz</p>
        <h2>Her baskıda tutarlılık ve kalite.</h2>
        <p>
          Tasarımdan son teslimata kadar tüm üretim süreçlerini tek çatı altında
          yönetiyoruz. Her ölçekten marka için güvenilir çözüm ortağıyız.
        </p>
      </div>
      <div className="services-grid">
        {services.map((service) => (
          <article className="card service-card" key={service.id}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServicesGrid
