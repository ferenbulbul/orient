import Hero from '../components/Hero'
import ServicesGrid from '../components/ServicesGrid'
import PortfolioGrid from '../components/PortfolioGrid'

const whyUs = [
  {
    title: 'Uçtan Uca Hizmet',
    description:
      'Tasarım, baskı, kalite kontrol ve sevkiyat süreçlerini tek ekip yönetir.',
  },
  {
    title: 'Şeffaf Planlama',
    description:
      'Her iş için üretim takvimi paylaşır, kritik tarihleri birlikte takip ederiz.',
  },
  {
    title: 'Sürdürülebilir Üretim',
    description:
      'Geri dönüştürülebilir kağıtlar ve düşük israf prensibi ile çalışıyoruz.',
  },
]

function Home() {
  return (
    <div className="page home-page">
      <Hero />
      <ServicesGrid />

      <section className="section">
        <div className="section__heading">
          <p className="eyebrow">Neden Biz?</p>
          <h2>Orient ile iş birliği yapmanın avantajları.</h2>
          <p>
            Uzman üretim kadromuz, modern makine parkurumuz ve sektörel deneyimimiz
            sayesinde, baskı süreçlerinizi güvenle teslim edebilirsiniz.
          </p>
        </div>
        <div className="why-grid">
          {whyUs.map((item) => (
            <article key={item.title} className="card why-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <PortfolioGrid />

      <section className="section contact-cta" id="contact-cta">
        <div>
          <p className="eyebrow">İletişim</p>
          <h2>Projenizi konuşalım.</h2>
          <p>
            İhtiyaçlarınızı paylaştığınızda, aynı gün içinde teknik detaylar ve
            fiyatlandırmayı içeren teklifimizi gönderiyoruz.
          </p>
        </div>
        <div className="contact-cta__actions">
          <a className="btn primary" href="mailto:info@orientmatbaa.com">
            info@orientmatbaa.com
          </a>
          <a className="btn ghost" href="tel:+902160000000">
            +90 (216) 000 00 00
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home
