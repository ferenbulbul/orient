function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <p className="eyebrow">35+ yıllık deneyim</p>
        <h1>Orient Matbaa ile markanızı güçlendirin.</h1>
        <p>
          Kartvizitten katalog baskısına kadar tüm kurumsal ihtiyaçlarınız için
          tek noktadan, titiz üretim ve zamanında teslim garanti ediyoruz.
        </p>
        <div className="hero__actions">
          <a className="btn primary" href="#contact-cta">
            Teklif Al
          </a>
          <a className="btn ghost" href="#services">
            Hizmetleri İncele
          </a>
        </div>
      </div>
      <div className="hero__visual">
        <div className="hero__badge">ISO 9001 Sertifikalı Üretim</div>
        <div className="hero__image" aria-hidden="true">
          <img
            src="https://via.placeholder.com/560x360/0a0a0a/ffffff?text=Orient+Matbaa"
            alt="Orient Matbaa baskı atölyesi"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
