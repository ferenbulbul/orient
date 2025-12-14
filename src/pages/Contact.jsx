function Contact() {
  return (
    <div className="page">
      <header className="section section--narrow">
        <p className="eyebrow">İletişime Geçin</p>
        <h1>Ofisimizi ziyaret edin ya da hemen arayın.</h1>
        <p>
          Baskı süreçlerinizi planlamak için randevu alabilir veya dosyalarınızı
          dijital olarak iletebilirsiniz. Ekibimiz 09:00-19:00 saatleri arasında
          aktif.
        </p>
      </header>
      <section className="section contact-panel">
        <div>
          <h2>Genel Merkez</h2>
          <p>İkitelli OSB Mah. Matbaa Cad. No:12 Başakşehir / İstanbul</p>
          <p>
            Tel: <a href="tel:+902160000000">+90 (216) 000 00 00</a>
          </p>
          <p>
            E-posta:{' '}
            <a href="mailto:info@orientmatbaa.com">info@orientmatbaa.com</a>
          </p>
        </div>
        <div>
          <h2>Teklif Formu</h2>
          <form className="contact-form">
            <label>
              Proje Adı
              <input type="text" name="project" placeholder="Örn. Katalog Baskı" />
            </label>
            <label>
              Tiraj
              <input type="number" name="qty" placeholder="1000" />
            </label>
            <label>
              Notlar
              <textarea
                name="notes"
                rows="4"
                placeholder="Özel kağıt tercihleri, teslim tarihi vb."
              />
            </label>
            <button className="btn primary" type="button">
              Formu Gönder
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <p className="eyebrow">Konum</p>
          <h2>Üretim tesisimizi ziyaret edin.</h2>
          <p>
            Aşağıdaki alan Google Maps iframe bileşeni için ayrılmıştır. Yakında
            canlı harita entegrasyonu eklenecektir.
          </p>
          <div
            className="map-placeholder"
            style={{
              marginTop: '24px',
              width: '100%',
              borderRadius: '16px',
              border: '1px dashed rgba(148, 163, 184, 0.6)',
              height: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              background: '#f8fafc',
            }}
          >
            Google Maps alanı (placeholder)
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
