import ServicesGrid from '../components/ServicesGrid'

function Services() {
  return (
    <div className="page">
      <header className="section section--narrow">
        <p className="eyebrow">Hizmet Kataloğu</p>
        <h1>Markanız için doğru baskı stratejisini planlayalım.</h1>
        <p>
          Her sektörün ihtiyacı farklı. Teknik danışmanlık sağlar, doğru malzeme
          ve baskı yöntemini birlikte seçeriz. Tüm işler söz verdiğimiz tarihte
          tamamlanır.
        </p>
      </header>
      <ServicesGrid />
      <section className="section section--narrow">
        <h2>Süreçlerimiz</h2>
        <ul className="process-list">
          <li>
            <strong>Keşif & Brief:</strong> Marka dili, tiraj ve teslim tarihi
            netleştirilir.
          </li>
          <li>
            <strong>Prototip & Onay:</strong> Renk eşleştirme ve maket baskı ile
            son kontroller yapılır.
          </li>
          <li>
            <strong>Üretim & Lojistik:</strong> Kalite kontrol sonrası ürünler
            paketlenir ve sevkiyata hazırlanır.
          </li>
        </ul>
      </section>
    </div>
  )
}

export default Services
