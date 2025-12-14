import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import ServicesGrid from '../components/ServicesGrid'

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

      <section className="section">
        <div className="section__heading">
          <p className="eyebrow">Çalışmalarımız</p>
          <h2>Referanslarımızı inceleyin.</h2>
          <p>
            Tamamladığımız baskı projelerinin geniş seçkisine göz atmak için
            çalışmalara özel sayfamızı ziyaret edebilirsiniz.
          </p>
        </div>
        <div className="contact-cta__actions" style={{ marginTop: 24 }}>
          <Link className="btn primary" to="/portfolio">
            Çalışmaları Gör
          </Link>
          <Link className="btn ghost" to="/contact">
            İletişime Geç
          </Link>
        </div>
      </section>

      <section className="section contact-cta" id="contact-cta">
        <div>
          <p className="eyebrow">İletişim</p>
          <h2>Projenizi konuşalım.</h2>
          <p>
            İhtiyaçlarınızı paylaştığınızda, ilgili ekip sizi yeni iletişim
            sayfamız üzerinden yönlendirir ve teklif sürecini başlatır.
          </p>
        </div>
        <div className="contact-cta__actions">
          <Link className="btn primary" to="/contact">
            İletişim Sayfasına Git
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
