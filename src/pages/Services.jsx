import ServicesGrid from '../components/ServicesGrid'
import { useLanguage } from '../context/LanguageContext'

function Services() {
  const { isEN } = useLanguage()
  return (
    <div className="page">
      <header className="section section--narrow">
        <p className="eyebrow">{isEN ? 'Service Catalog' : 'Hizmet Kataloğu'}</p>
        <h1>{isEN ? 'Let’s plan the right print strategy for your brand.' : 'Markanız için doğru baskı stratejisini planlayalım.'}</h1>
        <p>
          {isEN
            ? 'Each industry has different needs. We provide technical consultancy and select the right material and printing method together. Every project is completed on the promised date.'
            : 'Her sektörün ihtiyacı farklı. Teknik danışmanlık sağlar, doğru malzeme ve baskı yöntemini birlikte seçeriz. Tüm işler söz verdiğimiz tarihte tamamlanır.'}
        </p>
      </header>
      <ServicesGrid />
      <section className="section section--narrow">
        <h2>{isEN ? 'Our Process' : 'Süreçlerimiz'}</h2>
        <ul className="process-list">
          <li>
            <strong>{isEN ? 'Discovery & Brief:' : 'Keşif & Brief:'}</strong> {isEN ? 'Brand tone, quantity, and delivery date are clarified.' : 'Marka dili, tiraj ve teslim tarihi netleştirilir.'}
          </li>
          <li>
            <strong>{isEN ? 'Prototype & Approval:' : 'Prototip & Onay:'}</strong> {isEN ? 'Final checks are completed with color matching and mock prints.' : 'Renk eşleştirme ve maket baskı ile son kontroller yapılır.'}
          </li>
          <li>
            <strong>{isEN ? 'Production & Logistics:' : 'Üretim & Lojistik:'}</strong> {isEN ? 'After quality control, products are packaged and prepared for shipment.' : 'Kalite kontrol sonrası ürünler paketlenir ve sevkiyata hazırlanır.'}
          </li>
        </ul>
      </section>
    </div>
  )
}

export default Services
